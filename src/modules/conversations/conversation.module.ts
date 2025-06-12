import { Module } from '@nestjs/common';
import { CloudflareR2Service } from '../../api/cloudflare/cloudflare-r2.service.js';
import { AppConfigService } from '../../config/app.config.service.js';
import { DatabaseModule } from '../../database/database.module.js';
import { BoxModule } from '../box/box.module.js';
import { ConversationService } from './services/conversation.service.js';
@Module({
    imports: [DatabaseModule, BoxModule],
    providers: [
      ConversationService,
      AppConfigService,
      CloudflareR2Service,
    ],
    exports: [
      ConversationService,
      AppConfigService,
      CloudflareR2Service,
    ],
  })
  export class ConversationModule {}
