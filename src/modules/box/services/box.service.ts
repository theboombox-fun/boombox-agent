import { Injectable } from '@nestjs/common';
import { Box, BoxEvent } from '@prisma/client';
import { plainToInstance } from 'class-transformer';
import { AIService } from '../../../ai/ai.service.js';
import { GeneratedClassificationType, GeneratedSpeechAnalysisType, GeneratedSubstanceType } from '../../../ai/interfaces/ai.interfaces.js';
import { AnalyzerService } from '../../../api/analyzer/analyzer.service.js';
import { AnalyzerResponse } from '../../../api/analyzer/interfaces/response.dto.js';
import { BoomboxInterfaceService } from '../../../api/boombox-interface/boombox-interface.service.js';
import { ClankerApiService } from '../../../api/clanker/clanker-api.service.js';
import { prepareDeployTokenRequest } from '../../../api/clanker/clanker.util.js';
import { CloudflareImageService } from '../../../api/cloudflare/cloudflare-image.service.js';
import { generateThumbnail } from '../../../utilities/canvas.js';
import { BoxDatabaseService } from '../databases/box.database.service.js';
import { BoxDto } from '../interfaces/box.interface.js';

@Injectable()
export class BoxService {
  constructor(
    private readonly boxDatabaseService: BoxDatabaseService,
    private readonly aiService: AIService,
    private readonly analyzerService: AnalyzerService,
    private readonly boomboxInterfaceService: BoomboxInterfaceService,
    private readonly cloudflareImageService: CloudflareImageService,
    private readonly clankerApiService: ClankerApiService,
  ) { }

  async analyzeBox(boxEvent: BoxEvent): Promise<{
    buffer: Buffer,
    analyzerResponse: AnalyzerResponse
  } | null> {
    try {
      const buffer = await this.analyzerService.downloadSound(boxEvent.creator_source!);
      console.log("Sound downloaded");

      if (!buffer) throw new Error("Sound download failed");

      const analyzerResponse = await this.analyzerService.analyze(buffer);
      if (!analyzerResponse) throw new Error("Failed to analyze sound");
      console.log("Analyzer response: ", {
        caption: analyzerResponse.caption,
        result: analyzerResponse.results[0]
      });

      return {
        buffer,
        analyzerResponse
      }
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async *createBox(boxEvent: BoxEvent, buffer: Buffer, analyzerResponse: AnalyzerResponse, withLogging: boolean = false) {
    try {
      yield { event: "CLASSIFICATING_AUDIO" };

      //Classify sound
      const classification = await this.classificationProcess(analyzerResponse, withLogging);
      if (!classification) throw new Error("Failed to classify sound");

      //Generate Box Substance
      const substance = await this.substanceProcess(classification, buffer, withLogging);
      if (!substance) throw new Error("Failed to generate box substance");

      yield { event: "GENERATING_PFP" };

      const imageUrl = await this.visualProcess(substance, withLogging);
      if (!imageUrl) throw new Error("Failed to generate box profile image");

      yield { event: "TOKENIZING" };

      const tokenAddress = await this.tokenProcess(substance, imageUrl, boxEvent, withLogging);
      if (!tokenAddress) throw new Error("Failed to create token");

      const thumbnailUrl = await this.thumbnailProcess(substance, tokenAddress, imageUrl, boxEvent);

      //Create Box
      const box = await this.boxDatabaseService.create({
        name: substance.name,
        ticker: substance.ticker,
        pfp_url: imageUrl,
        thumbnail_url: thumbnailUrl,
        sound_url: boxEvent.creator_source!,
        contract_address: tokenAddress,
        creator_inbox_id: boxEvent.creator_inbox_id!,
        conversation_id: boxEvent.conversation_id!,
        is_test: boxEvent.is_test ?? false,
      });

      this.boomboxInterfaceProcess(substance, boxEvent, imageUrl, thumbnailUrl ?? "", tokenAddress);

      const response = {
        id: Number(box.id),
        ticker: box.ticker,
        contract_address: box.contract_address,
        pfp_url: box.pfp_url,
      }

      console.log("Box instance: ", withLogging ? response : "Box instance generation successful");

      yield { event: "BOX_CREATED", data: response };

    } catch (error) {
      console.error(error);
      yield { event: "ERROR", data: error.message.toString() };
    }
  }

  async classificationProcess(analyzerResponse: AnalyzerResponse, withLogging: boolean = false): Promise<GeneratedClassificationType | null> {
    try {
      const classification = await this.aiService.audioClassification(analyzerResponse);
      if (!classification) throw new Error("Failed to classify sound");
      console.log("Classification: ", withLogging ? classification : "Classification successful");
      return classification;
    } catch (error) {
      return null;
    }
  }

  async substanceProcess(classification: GeneratedClassificationType, buffer: Buffer, withLogging: boolean = false): Promise<GeneratedSubstanceType | null> {
    try {
      let speechAnalysis: GeneratedSpeechAnalysisType | null = null;

      if (classification.speech_status === "speech_detected") {
        //Analyze speech
        speechAnalysis = await this.aiService.generateSpeechAnalysis(buffer);
        if (!speechAnalysis) throw new Error("Failed to analyze speech");
        console.log("Speech analysis: ", withLogging ? speechAnalysis : "Speech analysis successful");
      }

      //Generate Box Substance
      const substance = await this.aiService.generateSubstance(classification, speechAnalysis);
      if (!substance) throw new Error("Failed to generate box substance");
      console.log("Substance: ", withLogging ? substance : "Substance generation successful");
      return substance;
    } catch (error) {
      return null;
    }
  }

  async visualProcess(substance: GeneratedSubstanceType, withLogging: boolean = false): Promise<string | null> {
    try {
      //Generate Box Visual
      const visual = await this.aiService.generateVisual(substance.visual_prompt);
      if (!visual) throw new Error("Visual generation failed");
      console.log("Visual: ", withLogging ? visual : "Visual generation successful");

      //Generate PFP
      const imageUrl = await this.aiService.generatePfp(visual);
      if (!imageUrl) throw new Error("Failed to generate box profile image");
      console.log("Image URL: ", withLogging ? imageUrl : "Image URL generation successful");

      return imageUrl
    } catch (error) {
      return null;
    }
  }

  async tokenProcess(substance: GeneratedSubstanceType, imageUrl: string, boxEvent: BoxEvent, withLogging: boolean = false): Promise<string | null> {
    try {
      let tokenAddress: string | null = null;

      if (!boxEvent.is_test) {
        //Create Token With Clanker
        const result = await this.clankerApiService.deployToken(prepareDeployTokenRequest(substance.name, substance.ticker, imageUrl, boxEvent, boxEvent.creator_wallet_address!));
        console.log("Clanker result: ", withLogging ? result : "Clanker result generation successful -> " + result.contract_address);
        tokenAddress = result.contract_address;
      } else {
        tokenAddress = "0x0000000000000000000000000000000000000000";
      }

      return tokenAddress;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async thumbnailProcess(substance: GeneratedSubstanceType, tokenAddress: string, imageUrl: string, boxEvent: BoxEvent): Promise<string | null> {
    try {
      let thumbnail: string | null = null;

      if (!boxEvent.is_test) {
        thumbnail = await generateThumbnail(
          this.cloudflareImageService,
          substance.name,
          substance.ticker,
          tokenAddress ?? "0x0000000000000000000000000000000000000000",
          imageUrl,
        );
      }
      return thumbnail;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async boomboxInterfaceProcess(substance: GeneratedSubstanceType, boxEvent: BoxEvent, imageUrl: string, thumbnailUrl: string, tokenAddress: string) {
    try {
      const boomboxResponse = await this.boomboxInterfaceService.createBox({
        name: substance.name,
        ticker: substance.ticker,
        creator_wallet_address: boxEvent.creator_wallet_address!,
        sound_url: boxEvent.creator_source!,
        pfp_url: imageUrl,
        thumbnail_url: thumbnailUrl ?? "",
        contract_address: tokenAddress ?? "",
      });

      if (!boomboxResponse) {
        console.error("Failed to create box on Boombox api");
      }
    } catch (error) {
      console.error(error);
    }
  }

  async findOne(id: number): Promise<BoxDto> {
    const box = await this.boxDatabaseService.find(id);
    return plainToInstance(BoxDto, box);
  }

  async findOneWithContractAddress(contractAddress: string): Promise<BoxDto> {
    const box = await this.boxDatabaseService.findByContractAddress(contractAddress);
    return plainToInstance(BoxDto, box);
  }

  async find(id: number): Promise<Box | null> {
    return await this.boxDatabaseService.find(id);
  }
}
