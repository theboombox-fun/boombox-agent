import {
  AgentKit,
  CdpWalletProvider,
} from "@coinbase/agentkit";
import { Injectable } from '@nestjs/common';
import { getVercelAITools } from '@coinbase/agentkit-vercel-ai-sdk';
import { createBoxActionProvider } from "./actions/create-box.action";

@Injectable()
export class AgentService {
  public AGENTKIT_API_KEY = process.env.AGENTKIT_API_KEY as string;
  public AGENTKIT_API_SECRET = process.env.AGENTKIT_API_SECRET as string;
  public OPENAI_API_KEY = process.env.OPENAI_API_KEY;

  async createAITools(address?: string) {
    const wallet_provider = await this.createWalletProvider(address);
    const agentKit = await AgentKit.from({
      cdpApiKeyId: this.AGENTKIT_API_KEY,
      cdpApiKeySecret: this.AGENTKIT_API_SECRET,
      walletProvider: wallet_provider,
      actionProviders: [
        createBoxActionProvider()
      ],
    });
    const tools = getVercelAITools(agentKit);
    return tools;
  }

  async createWalletProvider(address?: string) {
    const walletProvider = await CdpWalletProvider.configureWithWallet({
      apiKeyId: this.AGENTKIT_API_KEY,
      apiKeySecret: this.AGENTKIT_API_SECRET,
      networkId: 'base-mainnet',
      address: address,
    });
    return walletProvider;
  }
}