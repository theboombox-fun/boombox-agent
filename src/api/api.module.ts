import { Module } from "@nestjs/common";
import { CoingeckoApiService } from "./coingecko/coingecko-api.service.js";
import { ApiService } from "./api.service.js";
import { CloudflareImageService } from "./cloudflare/cloudflare-image.service.js";
import { AnalyzerService } from "./analyzer/analyzer.service.js";
import { CloudflareR2Service } from "./cloudflare/cloudflare-r2.service.js";
import { ClankerApiService } from "./clanker/clanker-api.service.js";
import { BoomboxInterfaceService } from "./boombox-interface/boombox-interface.service.js";
@Module({
    providers: [
        ApiService,
        CoingeckoApiService,
        CloudflareImageService,
        CloudflareR2Service,
        AnalyzerService,
        ClankerApiService,
        BoomboxInterfaceService,
    ],
    exports: [
        ApiService,
        CoingeckoApiService,
        CloudflareImageService,
        CloudflareR2Service,
        AnalyzerService,
        ClankerApiService,
        BoomboxInterfaceService,
    ],
})
export class ApiModule {}

