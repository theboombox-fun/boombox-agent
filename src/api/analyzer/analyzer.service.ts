import { Injectable } from '@nestjs/common';
import axios from 'axios';
import FormData from 'form-data';
import { ApiService } from '../api.service.js';
import { ApiHost } from '../common/api-hosts.js';
import { AnalyzerEndpoints } from '../common/api-endpoints.js';
import { AnalyzerResponse } from './interfaces/response.dto.js';

@Injectable()
export class AnalyzerService {
    constructor(private readonly apiService: ApiService) { }

    async analyze(buffer: Buffer<ArrayBufferLike>): Promise<AnalyzerResponse | null> {
        try {
            const form = new FormData();
            form.append('file', buffer, {
                filename: 'audio.wav',
                contentType: 'audio/wav',
            });

            return this.apiService.post(
                ApiHost.ANALYZER,
                AnalyzerEndpoints.ANALYZE(),
                form,
                {
                    headers: {
                        ...form.getHeaders(),
                    }
                }
            ) as Promise<AnalyzerResponse>;
        } catch (error) {
            console.error(error);
            return null;
        }
    }

    async downloadSound(url: string): Promise<Buffer | null> {
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        return response.data;
    }
}
