export interface ApiEndpoints {
    [key: string]: string;
}

export const CoingeckoEndpoints = {
    TOKEN_INFO: (address: string) => `/onchain/networks/base/tokens/${address}`,
    TOKEN_INFO_MULTIPLE: (addresses: string) => `/onchain/networks/base/tokens/multi/${addresses}`,
};

export const CloudflareEndpoints = {
    UPLOAD_IMAGE: (accountId: string) => `/${accountId}/images/v1`,
};

export const AnalyzerEndpoints = {
    ANALYZE: () => `/analyze`,
};

export const ClankerEndpoints = {
    DEPLOY_TOKEN: () => `/tokens/deploy`,
};

export const BoomboxEndpoints = {
    CREATE_BOX: () => `/create/xmtp`,
};