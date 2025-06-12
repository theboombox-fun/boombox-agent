import { Injectable } from "@nestjs/common";
import fs from "fs";
import openai from "./ai.tool.js";
import * as openaiv2 from '@ai-sdk/openai';
import path, { dirname } from 'path';
import { randomUUID } from 'crypto';
import { zodTextFormat } from "openai/helpers/zod";
import { generateText, ToolSet, generateObject } from 'ai';
import { GeneratedClassification, GeneratedClassificationType, GeneratedResponse, GeneratedResponseType, GeneratedSpeechAnalysis, GeneratedSpeechAnalysisType, GeneratedSubstance, GeneratedSubstanceType, GeneratedVisual, GeneratedVisualType } from "./interfaces/ai.interfaces.js";
import { audioClassifierPrompt, basePrompt, checkerPrompt, speechAnalysisPrompt, substanceGenerationPrompt, visualGenerationPrompt } from "./ai.prompts.js";
import { CloudflareImageService } from "../api/cloudflare/cloudflare-image.service.js";
import { fileURLToPath } from "url";
import { AgentService } from "../agent/agent.service.js";
@Injectable()
export class AIService {
    constructor(private readonly cloudflareImageService: CloudflareImageService, private readonly agentService: AgentService) { }

    public async generateResponse(payload: string, address: string, history: { role: string, content: string }[]): Promise<GeneratedResponseType | null> {
        try {

            console.log("Request: ", [
                {
                    role: "system",
                    content: basePrompt + checkerPrompt
                },
                ...history as any,
                {
                    role: "assistant",
                    content: "Generate response to this message: " + payload
                }
            ]);
            const aiTools = await this.agentService.createAITools(address);
            const response = await generateText({
                model: openaiv2.openai('gpt-4.1'),
                tools: { ...aiTools },
                toolChoice: "auto",
                system: basePrompt + checkerPrompt,
                messages: [
                    {
                        role: "system",
                        content: basePrompt + checkerPrompt
                    },
                    ...history as any,
                    {
                        role: "assistant",
                        content: "Generate response to this message: " + payload
                    }
                ],
            });

            if (response.toolResults.length > 0) {
                const result = (response.toolResults[0] as any);
                if ((response.toolResults[0] as any).toolName === "CreateBoxActionProvider_create-box") {
                    return {
                        event_type: result.event_type,
                        event_message: result.event_message,
                        response: "Creating box...",
                        new_box_info: {
                            sound_url: result.result
                        }
                    };
                } else {
                    return {
                        event_type: "1",
                        event_message: "CONVERSATION",
                        response: result.result,
                        new_box_info: {
                            sound_url: null
                        }
                    }
                }
            }

            const responseText = response.steps[0].text.replaceAll("```json", "").replaceAll("```", "").replaceAll("\n", "");

            try {
                const result = GeneratedResponse.safeParse(JSON.parse(responseText));

                if (result.error) {
                    throw new Error(result.error.errors[0].code);
                }

                return result.data;
            } catch (error) {
                console.log("Error", error);
                return {
                    event_type: "1",
                    event_message: "CONVERSATION",
                    response: responseText,
                    new_box_info: {
                        sound_url: null
                    }
                }
            }
        } catch (error) {
            console.log(error);
            return null;
        }
    }

    public async audioClassification(payload: any): Promise<GeneratedClassificationType | null> {
        try {
            const response = await openai.responses.create({
                model: "gpt-4.1",
                instructions: audioClassifierPrompt,
                input: "caption: " + payload.caption + ", result: " + payload.results[0].label,
                text: {
                    format: zodTextFormat(GeneratedClassification, "research_paper_extraction"),
                }
            });
            const result = GeneratedClassification.safeParse(JSON.parse(response.output_text));

            if (result.error) {
                throw new Error(result.error.errors[0].code);
            }

            return result.data;
        } catch (error) {
            console.log(error);
            return null;
        }
    }

    public async generateSpeechAnalysis(buffer: Buffer<ArrayBufferLike>): Promise<GeneratedSpeechAnalysisType | null> {
        try {
            const text = await this.convertSpeechToText(buffer);
            if (!text) {
                console.log("Failed to convert speech to text");
                return null;
            }

            const response = await openai.responses.create({
                model: "gpt-4.1",
                instructions: speechAnalysisPrompt,
                input: "Transcripted text: " + text,
                text: {
                    format: zodTextFormat(GeneratedSpeechAnalysis, "research_paper_extraction"),
                }
            });
            const result = GeneratedSpeechAnalysis.safeParse(JSON.parse(response.output_text));

            if (result.error) {
                throw new Error(result.error.errors[0].code);
            }

            return result.data;
        } catch (error) {
            console.log(error);
            return null;
        }
    }

    public async convertSpeechToText(buffer: Buffer<ArrayBufferLike>): Promise<string | null> {
        try {
            const tempFilePath = path.join(__dirname, `${randomUUID()}.mp3`);
            fs.writeFileSync(tempFilePath, buffer);

            const response = await openai.audio.transcriptions.create({
                model: "gpt-4o-transcribe",
                file: fs.createReadStream(tempFilePath),
                response_format: "text"
            });

            fs.unlinkSync(tempFilePath);

            console.log("Speech to text response: ", response);

            return response;
        } catch (error) {
            console.log(error);
            return null;
        }
    }

    public async generateVisual(payload: any): Promise<GeneratedVisualType | null> {
        try {
            const response = await openai.responses.create({
                model: "gpt-4.1",
                instructions: visualGenerationPrompt,
                input: payload.toString(),
                text: {
                    format: zodTextFormat(GeneratedVisual, "research_paper_extraction"),
                }
            });
            const result = GeneratedVisual.safeParse(JSON.parse(response.output_text));

            if (result.error) {
                throw new Error(result.error.errors[0].code);
            }

            return result.data;
        } catch (error) {
            console.log(error);
            return null;
        }
    }

    public async generateSubstance(payload: any, speechAnalysis: GeneratedSpeechAnalysisType | null): Promise<GeneratedSubstanceType | null> {
        try {
            const response = await openai.responses.create({
                model: "gpt-4.1",
                instructions: substanceGenerationPrompt,
                input: "caption: " + payload.caption + " classification: " + payload.classification + (speechAnalysis ? " summary: " + speechAnalysis?.summary : ""),
                text: {
                    format: zodTextFormat(GeneratedSubstance, "research_paper_extraction"),
                }
            });
            const result = GeneratedSubstance.safeParse(JSON.parse(response.output_text));

            if (result.error) {
                throw new Error(result.error.errors[0].code);
            }

            return result.data;
        } catch (error) {
            console.log(error);
            return null;
        }
    }

    public async generatePfp(payload: any): Promise<string | null> {
        try {
            const result = await openai.images.generate({
                model: "gpt-image-1",
                prompt: "description: " + payload.description + ", character: " + payload.character + ", visual_elements: " + payload.visual_elements + ", color_palette: " + payload.color_palette + ", style_notes: " + payload.style_notes + ", aspect_ratio: 1:1 (perfectly square)",
            });

            if (!result.data) {
                throw new Error("No data");
            }

            const image_base64 = result.data[0].b64_json;

            if (!image_base64) {
                throw new Error("No image base64");
            }

            const image_bytes = Buffer.from(image_base64, "base64");
            const imageUrl = await this.cloudflareImageService.createImageUrl(image_bytes);
            return imageUrl;
        } catch (error) {
            console.log(error);
            return null;
        }
    }
}


