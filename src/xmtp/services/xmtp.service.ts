import { Injectable } from "@nestjs/common";
import * as Xmtp from '@xmtp/node-sdk';
import { AppConfigService } from "../../config/app.config.service.js";
import { createSigner, getDbPath, getEncryptionKeyFromHex, logAgentDetails } from "../xmtp.helper.js";
import { XmtpMessage } from "../interfaces/xmtp.interfaces.js";

@Injectable()
export class XmtpService {
    private xmtp: Xmtp.Client | null = null;
    private messageHandler: ((conversation: Xmtp.Dm | Xmtp.Group | null, message: XmtpMessage, address: string) => void) | null = null;

    constructor(
        private readonly appConfigService: AppConfigService,
    ) {
        this.initializeClient();
    }

    setMessageHandler(handler: (conversation: Xmtp.Dm | Xmtp.Group | null, message: XmtpMessage, address: string) => void) {
        this.messageHandler = handler;
    }

    async initializeClient(): Promise<void> {
        if (this.xmtp) {
            return;
        }

        const signer = createSigner(this.appConfigService.botWalletPrivateKey);

        this.xmtp = await Xmtp.Client.create(signer, {
            env: this.appConfigService.xmtpEnv as "local" | "dev" | "production",
        });

        logAgentDetails(this.xmtp);

        await this.xmtp.conversations.sync();

        this.startListening(this.xmtp);
    }

    async startListening(xmtp: Xmtp.Client) {
        const stream = await xmtp.conversations.streamAllMessages();

        for await (const message of stream) {
            const xmtpMessage = message as unknown as XmtpMessage;

            if (xmtpMessage.senderInboxId == xmtp.inboxId ||
                message?.contentType?.typeId !== "text"
            ) continue;

            const inboxState = await xmtp.preferences.inboxStateFromInboxIds([
                xmtpMessage.senderInboxId,
            ]);
            const addressFromInboxId = inboxState[0].identifiers[0].identifier;

            const conversation = await this.getConversation(xmtpMessage.conversationId);
            if (!conversation) {
                throw new Error("Conversation not found");
            }

            if (this.messageHandler) {
                this.messageHandler(conversation, xmtpMessage, addressFromInboxId);
            }
        }
    }

    async sendMessage(conversation: Xmtp.Dm | Xmtp.Group | null, message: string) {
        try {
            if (!conversation) {
                throw new Error("Conversation not found");
            }

            await conversation.send(message);
        } catch (e) {
            console.log("Error sending message, ", e);
        }
    }

    async getClient(): Promise<Xmtp.Client> {
        if (!this.xmtp) {
            await this.initializeClient();
        }
        return this.xmtp!;
    }

    async getConversation(conversationId: string) {
        const client = await this.getClient();
        return await client.conversations.getConversationById(conversationId);
    }
}
