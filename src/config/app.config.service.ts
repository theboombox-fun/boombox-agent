import { ConfigService } from "@nestjs/config";
import { Injectable } from "@nestjs/common";

@Injectable()
export class AppConfigService {
  constructor(private readonly configService: ConfigService) {}

  get nodeEnv(): string {
    return this.configService.get<string>('NODE_ENV') || '';
  }

  get botWalletPrivateKey(): string {
    return this.configService.get<string>('BOT_PRIVATE_KEY') || '';
  }

  get xmtpEnv(): string {
    return this.configService.get<string>('XMTP_ENV') || 'dev';
  }
}
