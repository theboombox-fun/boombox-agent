import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { ApiHost } from './common/api-hosts.js';

@Injectable()
export class ApiService {
  private readonly logger = new Logger(ApiService.name);

  private createClient(baseURL: string): AxiosInstance {
    return axios.create({
      baseURL,
      timeout: 50000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async get<T>(
    host: ApiHost,
    endpoint: string,
    config?: AxiosRequestConfig
  ): Promise<T> {
    try {
      const client = this.createClient(host);
      const res: AxiosResponse<T> = await client.get(endpoint, config);
      return res.data;
    } catch (error) {
      this.handleError(error, 'GET', `${host}${endpoint}`);
    }
  }

  async post<T>(
    host: ApiHost,
    endpoint: string,
    data: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    try {
      const client = this.createClient(host);
      const res: AxiosResponse<T> = await client.post(endpoint, data, config);
      return res.data;
    } catch (error) {
      this.handleError(error, 'POST', `${host}${endpoint}`);
    }
  }

  private handleError(error: any, method: string, url: string): never {
    const msg = error?.response?.data?.message || error.message;
    const status = error?.response?.status || 500;
    this.logger.error(`[${method}] ${url} -> ${status}: ${msg}`);
    throw new Error(`[${method}] ${url} hatası: ${msg}`);
  }
}
