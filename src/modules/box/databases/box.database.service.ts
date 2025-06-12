import { Injectable } from "@nestjs/common";
import { Box, Prisma } from "@prisma/client";
import { DatabaseService } from "../../../database/database.service.js";

@Injectable()
export class BoxDatabaseService {
    constructor(private readonly databaseService: DatabaseService) {}

    async find(id: number) : Promise<Box | null> {
        return await this.databaseService.box.findUnique({
            where: {
                id: id,
                is_suspended: false,
            }
        });
    }

    async findByContractAddress(contractAddress: string) : Promise<Box | null> {
        return await this.databaseService.box.findFirst({
            where: {
                contract_address: contractAddress,
                is_suspended: false,
            }
        });
    }

    async count(isTest: boolean = false): Promise<number> {
        return await this.databaseService.box.count({
            where: {
                is_test: isTest,
            }
        });
    }

    async findAll(): Promise<Box[]> {
        return await this.databaseService.box.findMany();
    }

    async findAllWithContractAddress(contract_address: string): Promise<Box[]> {
        return await this.databaseService.box.findMany({
            where: {
                contract_address: {
                    equals: contract_address,
                    mode: 'insensitive'
                },
                is_suspended: false,
            }
        });
    }

    async findAllWithNoneContractAddress(): Promise<Box[]> {
        return await this.databaseService.box.findMany({
            where: {
                contract_address: {
                    not: null
                }
            }
        });
    }

    async create(data: Prisma.BoxCreateInput): Promise<Box> {
        return await this.databaseService.box.create({data});
    }

    async update(id: number, data: Prisma.BoxUpdateInput): Promise<Box> {
        return await this.databaseService.box.update({
            where: { id },
            data,
        });
    }
}
