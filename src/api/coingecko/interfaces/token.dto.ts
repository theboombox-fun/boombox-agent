import { BigIntString, NumberString } from "../../../common/types/convert.js";

export interface TokenInfoResponse {
    attributes: {
        address: string;
        name: string;
        symbol: string;
        decimals: number;
        image_url: string;
        coingecko_coin_id: string;
        total_supply: BigIntString;
        price_usd: NumberString;
        fdv_usd: NumberString;
        total_reserve_in_usd: NumberString;
        volume_usd: {
            h24: NumberString;
        };
        market_cap_usd: NumberString;
    }
}

export interface MultipleTokenInfoResponse {
    data: {
        id: string;
        type: string;
        attributes: TokenInfoResponse["attributes"],
        relationships: any;
    }[];
}
