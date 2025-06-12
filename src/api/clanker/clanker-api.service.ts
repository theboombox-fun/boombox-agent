import { Injectable } from "@nestjs/common";
import { ApiHost, ApiService, ClankerEndpoints } from "../index.js";
import { ConfigService } from "@nestjs/config";
import { DeployTokenRequest } from "./interfaces/request.dto.js";
@Injectable()
export class ClankerApiService {
    constructor(private readonly apiService: ApiService,
        private readonly configService: ConfigService) { }

    async deployToken(request: DeployTokenRequest): Promise<any> {
        console.log("Request: ", request);
        console.log(this.configService.get("CLANKER_API_KEY"));
        return this.apiService.post(
            ApiHost.CLANKER,
            ClankerEndpoints.DEPLOY_TOKEN(),
            request,
            {
                headers: {
                    "x-api-key": this.configService.get("CLANKER_API_KEY")
                }
            }
        );
    }
}

