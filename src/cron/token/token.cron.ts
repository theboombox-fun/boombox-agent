import { Injectable } from "@nestjs/common";
import { Cron } from '@nestjs/schedule';
import { TokenService } from "../../modules/token/services/token.service.js";
@Injectable()
export class TokenCron {
    constructor(
        private readonly tokenService: TokenService
    ) { }

    @Cron('*/15 * * * * *')
    async handleCron() {
        await this.tokenService.fetchTokenDatas();
    }
}
