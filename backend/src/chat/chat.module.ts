import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { DatabaseModule } from 'src/db/database.module';
import { chatProviders } from './chat.providers';
import { footballProviders } from 'src/football-data/football-data.providers';
import { userProviders } from 'src/users/user.providers';
import { ChatController } from './chat.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [ChatController],
  providers: [
    ChatGateway,
    ChatService,
    ...chatProviders,
    ...footballProviders,
    ...userProviders,
  ],
})
export class ChatModule {}
