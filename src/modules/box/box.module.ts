import { forwardRef, Module } from "@nestjs/common";
import { BoxProcessorService } from "./services/box.processor.service.js";
import { BoxService } from "./services/box.service.js";
import { DatabaseModule } from "../../database/database.module.js";
import { AIService } from "../../ai/ai.service.js";
import { AnalyzerService } from "../../api/analyzer/analyzer.service.js";
import { CloudflareR2Service } from "../../api/cloudflare/cloudflare-r2.service.js";
import { CloudflareImageService } from "../../api/cloudflare/cloudflare-image.service.js";
import { ApiService } from "../../api/api.service.js";
import { AppConfigService } from "../../config/app.config.service.js";
import { ClankerApiService } from "../../api/clanker/clanker-api.service.js";
import { XmtpService } from "../../xmtp/services/xmtp.service.js";
import { ConversationService } from "../conversations/services/conversation.service.js";
import { BoomboxInterfaceService } from "../../api/boombox-interface/boombox-interface.service.js";
import { AgentModule } from "../../agent/agent.module.js";
@Module({
    imports: [
        DatabaseModule,
        AgentModule
    ],
    providers: [
        BoxProcessorService,
        BoxService,
        AIService,
        AnalyzerService,
        CloudflareR2Service,
        CloudflareImageService,
        ApiService,
        AppConfigService,
        ClankerApiService,
        XmtpService,
        ConversationService,
        BoomboxInterfaceService,
    ],
    exports: [
        BoxProcessorService,
        AIService,
        AnalyzerService,
        CloudflareR2Service,
        CloudflareImageService,
        ApiService,
        AppConfigService,
        ClankerApiService,
        XmtpService,
        ConversationService,
        BoomboxInterfaceService,
    ],
})
export class BoxModule { }
