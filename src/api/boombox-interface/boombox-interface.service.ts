import { Injectable } from '@nestjs/common';
import { ApiService } from '../api.service.js';
import { ApiHost } from '../common/api-hosts.js';
import { BoomboxEndpoints } from '../common/api-endpoints.js';
import { CreateXmtpRequestDto } from './interfaces/request.dto.js';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class BoomboxInterfaceService {
    constructor(private readonly apiService: ApiService, private readonly configService: ConfigService) { }

    async createBox(request: CreateXmtpRequestDto): Promise<boolean> {
        try {

            const response = await this.apiService.post(
                ApiHost.BOOMBOX,
                BoomboxEndpoints.CREATE_BOX(),
                request,
                {
                    headers: {
                        "x-api-key" : this.configService.get<string>('BOOMBOX_API_KEY')
                    }
                }
            );

            console.log("Boombox api response: ", response);

            if (!response) {
                return false;
            }

            return (response as any).data != "INVALID_API_KEY";

        } catch (error) {
            console.error(error);
            return false;
        }
    }
}
