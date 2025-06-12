import { Injectable } from "@nestjs/common";
import { Cron } from '@nestjs/schedule';
import { BoxProcessorService } from "../../modules/box/services/box.processor.service.js";
@Injectable()
export class ProcessCron {
    constructor(
        private readonly boxProcessorService: BoxProcessorService
    ) { }

    @Cron('*/10 * * * * *')
    async handleMessageProcessCron() {
        await this.boxProcessorService.messageProcess();
    }
}
