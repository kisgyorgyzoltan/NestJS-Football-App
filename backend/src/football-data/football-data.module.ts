import { Module } from '@nestjs/common';
import { FootballDataService } from './football-data.service';
import { FootballDataController } from './football-data.controller';
import { FootballGateway } from './football-data.gateway';
import { DatabaseModule } from 'src/db/database.module';
import { footballProviders } from './football-data.providers';

@Module({
  imports: [DatabaseModule],
  controllers: [FootballDataController],
  providers: [FootballDataService, FootballGateway, ...footballProviders],
  exports: [FootballDataService],
})
export class FootballDataModule {}
