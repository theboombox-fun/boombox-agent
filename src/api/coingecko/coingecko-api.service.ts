import { Injectable } from "@nestjs/common";
import { ApiHost, ApiService, CoingeckoEndpoints } from "../index.js";
import { ConfigService } from "@nestjs/config";
import { TokenInfoResponse, MultipleTokenInfoResponse } from "./interfaces/token.dto.js";
@Injectable()
export class CoingeckoApiService {
    constructor(private readonly apiService: ApiService,
        private readonly configService: ConfigService) { }

    async getTokenInfo(address: string): Promise<TokenInfoResponse> {
        console.log(this.configService.get("COINGECKO_API_KEY"));
        return this.apiService.get(
            ApiHost.COINGECKO,
            CoingeckoEndpoints.TOKEN_INFO(address),
            {
                headers: {
                    "X-CG-Pro-API-Key": this.configService.get("COINGECKO_API_KEY")
                }
            }
        ) as Promise<TokenInfoResponse>;
    }

    async getMultipleTokenInfo(addresses: string): Promise<MultipleTokenInfoResponse> {
        return this.apiService.get(
            ApiHost.COINGECKO,
            CoingeckoEndpoints.TOKEN_INFO_MULTIPLE(addresses),
            {
                headers: {
                    "X-CG-Pro-API-Key": this.configService.get("COINGECKO_API_KEY")
                }
            }
        ) as Promise<MultipleTokenInfoResponse>;
    }
}

