import { Injectable } from "@nestjs/common";
import { BotConversation, BoxEventProcessType, BoxEventStatusType, Prisma } from "@prisma/client";
import { Dm, Group } from "@xmtp/node-sdk";
import { GeneratedResponseType } from "src/ai/interfaces/ai.interfaces.js";
import { AIService } from "../../../ai/ai.service.js";
import { CloudflareR2Service } from "../../../api/cloudflare/cloudflare-r2.service.js";
import { BIG_FILE, UNKNOWN_ERROR } from "../../../common/utils/statics.js";
import { BoxRegisterProcessDto } from "../../../modules/box/interfaces/box-processor.interfaces.js";
import { BoxProcessorService } from "../../../modules/box/services/box.processor.service.js";
import { XmtpMessage } from "../../../xmtp/interfaces/xmtp.interfaces.js";
import { XmtpService } from "../../../xmtp/services/xmtp.service.js";
import { ConversationDatabaseService } from "../databases/conversation.database.service.js";

@Injectable()
export class ConversationService {

    constructor(
        private readonly xmtpService: XmtpService,
        private readonly boxProcessorService: BoxProcessorService,
        private readonly conversationDatabaseService: ConversationDatabaseService,
        private readonly cloudflareR2Service: CloudflareR2Service,
        private readonly aiService: AIService
    ) {
        this.xmtpService.setMessageHandler(this.handleMessage.bind(this));
    }

    async handleMessage(conversation: Dm | Group | null, message: XmtpMessage, address: string) {
        console.log("Handling message", message.deliveryStatus);

        const entityPayload = {
            conversation_id: message.conversationId,
            content: message.content,
            bot_message: "",
            authority_id: message.contentType.authorityId,
            content_type: message.contentType.typeId,
            version_major: message.contentType.versionMajor,
            version_minor: message.contentType.versionMinor,
            delivery_status: message.deliveryStatus,
            fallback: message.fallback,
            compression: message.compression,
            message_id: message.id,
            kind: message.kind,
            sender_inbox_id: message.senderInboxId,
            sent_at: message.sentAt,
        };

        const conversationEntities = (await this.conversationDatabaseService.findAllByConversationId(message.conversationId)).reverse();

        const history: { role: string, content: string }[] = [];

        conversationEntities.forEach(entity => {
            history.push({
                role: "user",
                content: entity.content
            });
            if (entity.bot_message) {
                history.push({
                    role: "assistant",
                    content: entity.bot_message!
                });
            }
        });

        const response = await this.aiService.generateResponse(message.content, address, history);

        if (!response) {
            this.xmtpService.sendMessage(conversation, "Unknown error");
            await this.createConversation(entityPayload);
            return;
        }

        entityPayload.bot_message = response.response;

        const conversationEntity = await this.createConversation(entityPayload);
        
        if (response.event_type == "2" && response.event_message != "WAITING_DATA") {
            this.xmtpService.sendMessage(conversation, "Creating box...");
            this.creationMessage(conversation, conversationEntity, response, address);
            return;
        }

        this.xmtpService.sendMessage(conversation, response.response);
    }

    async creationMessage(conversation: Dm | Group | null, conversationEntity: BotConversation, response: GeneratedResponseType, address: string) {
        let payload: BoxRegisterProcessDto = {
            status: BoxEventStatusType.CREATION,
            type: BoxEventProcessType.PLANNED,
            conversation_id: conversationEntity.conversation_id,
            creator_inbox_id: conversationEntity.sender_inbox_id,
            creator_wallet_address: address,
            creator_source: ""
        };

        const youtubeUrl = response.new_box_info.sound_url;
        if (!youtubeUrl) {
            this.xmtpService.sendMessage(conversation, "No youtube url found");
            return;
        }
        const { url, error } = await this.cloudflareR2Service.extractAndUploadAudioForYoutube(youtubeUrl);

        if (error) {
            if (error.includes("Big file")) {
                this.xmtpService.sendMessage(conversation, BIG_FILE);
                return;
            }
            this.xmtpService.sendMessage(conversation, UNKNOWN_ERROR);
            return;
        }

        payload.creator_source = url;
        await this.boxProcessorService.register(payload);
        return;
    }

    async createConversation(payload: Prisma.BotConversationCreateInput) {
        return await this.conversationDatabaseService.create(payload);
    }
}
