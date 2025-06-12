import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { SentryGlobalFilter, SentryModule } from '@sentry/nestjs/setup';
import { ApiModule } from './api/api.module.js';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { ProcessCron } from './cron/process/process.cron.js';
import { TokenCron } from './cron/token/token.cron.js';
import { DatabaseModule } from './database/database.module.js';
import { BoxController } from './modules/box/box.controller.js';
import { BoxModule } from './modules/box/box.module.js';
import { BoxService } from './modules/box/services/box.service.js';
import { CreateController } from './modules/create/create.controller.js';
import { TokenService } from './modules/token/services/token.service.js';
import { ConversationModule } from './modules/conversations/conversation.module.js';
import { XmtpModule } from './xmtp/xmtp.module.js';
import { AgentService } from './agent/agent.service.js';
import { AgentModule } from './agent/agent.module.js';
import { AIService } from './ai/ai.service.js';
@Module({
  imports: [
    SentryModule.forRoot(),
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV == "production" ? '.env' : ".env.development",
    }),
    CacheModule.register({
      ttl: 5,
      max: 100,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 40,
      },
    ]),
    DatabaseModule,
    BoxModule,
    ApiModule,
    XmtpModule,
    ConversationModule,
    AgentModule
  ],
  controllers: [
    AppController,
    BoxController,
    CreateController,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_FILTER,
      useClass: SentryGlobalFilter,
    },
    //Cron Jobs
    TokenCron,
    ProcessCron,
    //Services
    AppService,
    BoxService,
    TokenService,
  ]
})

export class AppModule { }
