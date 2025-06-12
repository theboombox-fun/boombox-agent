import { Injectable } from "@nestjs/common";
import { BoxEvent, BoxEventProcessType, BoxEventStatusType, Prisma, BoxEventProcessState } from "@prisma/client";
import { DatabaseService } from "../../../database/database.service.js";

@Injectable()
export class BoxEventDatabaseService {
    constructor(private readonly databaseService: DatabaseService) { }

    async findForMessage(): Promise<BoxEvent[]> {
        return await this.databaseService.boxEvent.findMany({
            where: {
                OR: [
                    {
                        process_type: BoxEventProcessType.PLANNED,
                        status: BoxEventStatusType.CONVERSATION,
                    },
                    {
                        process_type: BoxEventProcessType.ANALYZED,
                        status: BoxEventStatusType.CREATION,
                    },
                    {
                        process_type: BoxEventProcessType.PLANNED,
                        process_state: BoxEventProcessState.ERROR,
                    },
                ]
            }
        });
    }

    async findWithProcessType(processType: BoxEventProcessType, testMode: boolean = false): Promise<BoxEvent[]> {
        return await this.databaseService.boxEvent.findMany({
            where: {
                process_type: processType,
                is_test: testMode,
            },
            take: 10,
            orderBy: {
                id: 'desc',
            },
        });
    }

    async findWithProcessTypeAndStatusType(processType: BoxEventProcessType, statusType: BoxEventStatusType): Promise<BoxEvent[]> {
        return await this.databaseService.boxEvent.findMany({
            where: {
                process_type: processType,
                status: statusType,
                process_started_at: null
            }
        });
    }

    async find(id: number): Promise<BoxEvent | null> {
        return await this.databaseService.boxEvent.findUnique({
            where: {
                id: id,
            }
        });
    }

    async findByInboxId(inboxId: string): Promise<BoxEvent | null> {
        return await this.databaseService.boxEvent.findFirst({
            where: {
                creator_inbox_id: inboxId,
            }
        });
    }

    async findByProcessId(processId: string): Promise<BoxEvent | null> {
        return await this.databaseService.boxEvent.findFirst({
            where: {
                process_id: processId,
            }
        });
    }

    async create(data: Prisma.BoxEventCreateInput): Promise<BoxEvent> {
        return await this.databaseService.boxEvent.create({ data });
    }

    async update(id: number, data: Prisma.BoxEventUpdateInput): Promise<BoxEvent> {
        return await this.databaseService.boxEvent.update({
            where: { id },
            data,
        });
    }

    async countCreatedInLast24HoursByInboxId(inboxId: string): Promise<number> {
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        return await this.databaseService.boxEvent.count({
            where: {
                creator_inbox_id: inboxId,
                created_at: {
                    gte: twentyFourHoursAgo,
                },
            },
        });
    }
}
