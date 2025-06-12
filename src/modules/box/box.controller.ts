import { CacheInterceptor } from '@nestjs/cache-manager';
import { Controller, Get, Param, UseInterceptors } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { BoxDto } from './interfaces/box.interface.js';
import { BoxService } from './services/box.service.js';

@SkipThrottle()
@Controller('box')
@UseInterceptors(CacheInterceptor)
export class BoxController {
  constructor(
    private readonly boxService: BoxService,
  ) { }

  @Get('get/:address')
  async findOne(@Param('address') address: string): Promise<BoxDto> {
    return await this.boxService.findOneWithContractAddress(address);
  }
}
