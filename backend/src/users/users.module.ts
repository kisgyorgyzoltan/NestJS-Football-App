import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { userProviders } from './user.providers';
import { DatabaseModule } from 'src/db/database.module';

@Module({
  imports: [DatabaseModule],
  providers: [UsersService, ...userProviders],
  exports: [UsersService],
})
export class UsersModule {}
