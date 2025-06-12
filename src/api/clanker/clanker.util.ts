import { BoxEvent } from "@prisma/client";
import { DeployTokenRequest } from "./interfaces/request.dto.js";
import { v4 as uuidv4 } from 'uuid';

export const prepareDeployTokenRequest = (name: string, ticker: string, pfpUrl: string, boxEvent: BoxEvent, creatorWalletAddress: string): DeployTokenRequest => {
    const socialMediaUrls = [
        "https://theboombox.fun/" + ticker.toLowerCase() + "_" + boxEvent.id,
    ].filter(url => url) as string[];

    return {
        name: name,
        symbol: ticker,
        image: pfpUrl,
        requestorAddress: creatorWalletAddress,
        requestKey: uuidv4(),
        creatorRewardsPercentage: 50,
        socialMediaUrls: socialMediaUrls,
        platform: "Boombox",
        creatorRewardsAdmin: creatorWalletAddress,
        initialMarketCap: 10,
    };
};

export const prepareDeployTokenRequestWithoutEvent = (name: string, ticker: string, pfpUrl: string, creatorWalletAddress: string, vaultPercentage?: number, vaultUnlockTimestamp?: number): DeployTokenRequest => {
    const socialMediaUrls = [
        "https://theboombox.fun/" + ticker.toLowerCase(),
    ].filter(url => url) as string[];

    return {
        name: name,
        symbol: ticker,
        image: pfpUrl,
        requestorAddress: creatorWalletAddress,
        requestKey: uuidv4(),
        creatorRewardsPercentage: 50,
        socialMediaUrls: socialMediaUrls,
        platform: "Boombox",
        creatorRewardsAdmin: creatorWalletAddress,
        initialMarketCap: 10,
        vaultPercentage: vaultPercentage,
        vaultUnlockTimestamp: vaultUnlockTimestamp,
    };
};