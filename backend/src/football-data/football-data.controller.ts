import { Controller, Delete, Get, Post, UseInterceptors } from '@nestjs/common';
import { FootballDataService } from './football-data.service';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Public } from 'src/auth/public-auth.guard';

@ApiBearerAuth()
@Controller('football-data')
@UseInterceptors(CacheInterceptor)
@CacheTTL(10)
export class FootballDataController {
  constructor(private readonly footballDataService: FootballDataService) {}

  @Get()
  async getFootballData() {
    const data = await this.footballDataService.getData();
    return data;
  }

  @Public()
  @Post('demo')
  async getDemoData() {
    await this.footballDataService.addDemoJob();
  }

  @Public()
  @Delete('demo')
  async deleteDemoData() {
    await this.footballDataService.removeDemoJob();
  }
}
