import { Injectable } from "@nestjs/common";
import { BoxPlay, Prisma } from "@prisma/client";
import { DatabaseService } from "../../../database/database.service.js";

@Injectable()
export class BoxPlaysDatabaseService {
    constructor(private readonly databaseService: DatabaseService) {}

    async find(
        id: number | bigint | Prisma.BigIntFilter<"BoxPlay">,
        ip?: string
    ) : Promise<BoxPlay | null> {
        return await this.databaseService.boxPlay.findFirst({
            where: {
                box_id: id,
                user_ip: ip,
                played_at: {
                    gte: new Date(Date.now() - 1000 * 60)
                }
            }
        });
    }

    async count(
        id: number | bigint | Prisma.BigIntFilter<"BoxPlay">
    ) : Promise<number> {
        return await this.databaseService.boxPlay.count({
            where: { id: id }
        });
    }

    async create(
        data: Prisma.BoxPlayCreateInput
    ) : Promise<BoxPlay> {
        return await this.databaseService.boxPlay.create({
            data: data
        });
    }
}