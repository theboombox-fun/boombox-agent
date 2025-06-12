import { Injectable } from "@nestjs/common";
import { CoingeckoApiService } from "../../../api/coingecko/coingecko-api.service.js";
import { BoxDatabaseService } from "../../box/databases/box.database.service.js";
@Injectable()
export class TokenService {
    constructor(
        private readonly coingeckoApiService: CoingeckoApiService,
        private readonly boxDatabaseService: BoxDatabaseService
    ) { }

    async fetchTokenDatas() {
        const boxes = await this.boxDatabaseService.findAllWithNoneContractAddress();

        const token_contract_addresses = Array.from(
            new Set([
                ...boxes.map((token) => token.contract_address),
            ])
        ) as string[];

        if (token_contract_addresses.length === 0) {
            return;
        }

        try {
            const tokens = await this.coingeckoApiService.getMultipleTokenInfo(token_contract_addresses.join(","));
            
            tokens.data.forEach(async (token) => {
                const boxes = await this.boxDatabaseService.findAllWithContractAddress(token.attributes.address);
                
                const updateDatas = {
                    token_volume: Number(token.attributes.volume_usd.h24),
                    token_market_cap: Number(token.attributes.market_cap_usd ?? token.attributes.fdv_usd),
                    token_usd_price: Number(token.attributes.price_usd),
                }

                boxes.forEach(async (box) => {
                    await this.boxDatabaseService.update(Number(box.id), updateDatas);
                });
            });

        } catch (err) {
            console.log("COINGECKO ERROR: " + err);
        }
    }
}

