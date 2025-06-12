export interface DeployTokenRequest {
    name: string;
    symbol: string;
    image: string;
    requestorAddress: string;
    requestKey: string;
    creatorRewardsPercentage: number;
    socialMediaUrls: string[];
    platform: string;
    creatorRewardsAdmin: string;
    initialMarketCap: number;
    vaultPercentage?: number;
    vaultUnlockTimestamp?: number;
}