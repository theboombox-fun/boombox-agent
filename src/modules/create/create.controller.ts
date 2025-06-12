import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import { SkipThrottle } from "@nestjs/throttler";
import { BoxEventStatusType } from "@prisma/client";
import { CloudflareR2Service } from "../../api/cloudflare/cloudflare-r2.service.js";
import { CreateBoxRequestDto } from "../box/interfaces/create-box.interface.js";
import { BoxProcessorService } from "../box/services/box.processor.service.js";

@Controller('create')
export class CreateController {
    constructor(private readonly boxProcessorService: BoxProcessorService,
        private readonly cloudflareR2Service: CloudflareR2Service,
    ) { }

    @Post('process')
    async createBox(@Body() request: CreateBoxRequestDto): Promise<String | null> {
        const processId = await this.boxProcessorService.register({
            status: BoxEventStatusType.CREATION,
            creator_source: request.sound_url,
            creator_inbox_id: request.creator_wallet_address,
            conversation_id: "0x0000000000000000000000000000000000000000",
            creator_wallet_address: request.creator_wallet_address,
        });

        return processId;
    }

    @SkipThrottle()
    @Get('process')
    async processBox(@Query('id') processId: string): Promise<{ event: string, data: any | null }> {
        const process = await this.boxProcessorService.getProcess(processId);
        if (!process) {
            return { event: "ERROR", data: null };
        }
        return { event: process.process_state, data: { address: process.box_contract_address } };
    }

    @Get('convert')
    async convertBox(@Query('url') url: string): Promise<{ url: string, error: string | null }> {
        return await this.cloudflareR2Service.extractAndUploadAudio(url);
    }

    @Get('is_silent')
    async isSilent(@Query('url') url: string): Promise<boolean> {
        return await this.cloudflareR2Service.isSilent(url);
    }
}

