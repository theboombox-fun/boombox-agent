import { Injectable } from '@nestjs/common';
import FormData from 'form-data';
import { v4 as uuidv4 } from 'uuid';
import { ApiService } from '../api.service.js';
import { CloudflareEndpoints } from '../common/api-endpoints.js';
import { ApiHost } from '../common/api-hosts.js';
import { CloudflareImageResponse } from './interfaces/response.dto.js';

@Injectable()
export class CloudflareImageService {
    private readonly ACCOUNT_ID = process.env.CF_ACCOUNT_ID;
    private readonly API_TOKEN = process.env.CF_API_TOKEN;

    constructor(private readonly apiService: ApiService) { }

    async createImageUrl(buffer: Buffer<ArrayBuffer>): Promise<string | null> {
        const response = await this.uploadImage(buffer);
        if (response && response.success) {
            return response.result.variants[0];
        }
        return null;
    }

    async uploadImage(buffer: Buffer<ArrayBuffer>): Promise<CloudflareImageResponse | null> {
        try {
            const fileName = uuidv4();
            const form = new FormData();
            form.append('file', buffer, fileName);

            return this.apiService.post(
                ApiHost.CLOUDFLARE,
                CloudflareEndpoints.UPLOAD_IMAGE(this.ACCOUNT_ID!),
                form,
                {
                    headers: {
                        Authorization: `Bearer ${this.API_TOKEN}`,
                        ...form.getHeaders(),
                    }
                }
            ) as Promise<CloudflareImageResponse>;
        } catch (error) {
            console.error(error);
            return null;
        }
    }
}
