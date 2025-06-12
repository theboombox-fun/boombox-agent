import { Injectable } from "@nestjs/common";
import { BotConversation, Prisma } from "@prisma/client";
import { DatabaseService } from "../../../database/database.service.js";

@Injectable()
export class ConversationDatabaseService {
    constructor(private readonly databaseService: DatabaseService) {}

    async find(
        id: number,
    ) : Promise<BotConversation | null> {
        return await this.databaseService.botConversation.findFirst({
            where: {
                id: id
            }
        });
    }

    async findAllByConversationId(
        id: string,
    ) : Promise<BotConversation[]> {
        return await this.databaseService.botConversation.findMany({
            where: {
                conversation_id: id
            },
            orderBy: {
                sent_at: "desc"
            },
            take: 30,
        });
    }

    async create(
        data: Prisma.BotConversationCreateInput
    ) : Promise<BotConversation> {
        return await this.databaseService.botConversation.create({
            data: data
        });
    }

    async update(
        id: number,
        data: Prisma.BotConversationUpdateInput
    ) : Promise<BotConversation> {
        return await this.databaseService.botConversation.update({
            where: { id: id },
            data: data
        });
    }
}