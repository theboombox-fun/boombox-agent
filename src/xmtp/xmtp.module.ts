import { forwardRef, Module } from "@nestjs/common";
import { XmtpService } from "./services/xmtp.service.js";
import { AppConfigService } from "../config/app.config.service.js";
import { ConversationModule } from "../modules/conversations/conversation.module.js";
@Module({
  imports: [
    forwardRef(() => ConversationModule)
  ],
  providers: [
    XmtpService,
    AppConfigService,
  ],
  exports: [
    XmtpService,
  ],
})
export class XmtpModule { }
