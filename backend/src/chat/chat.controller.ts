import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import {
  Controller,
  UseInterceptors,
  Get,
  Param,
  Logger,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ChatService } from './chat.service';

@ApiBearerAuth()
@Controller('chat')
@UseInterceptors(CacheInterceptor)
@CacheTTL(10)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('messages/:matchId')
  async getChatMessageByMatchId(
    @Param('matchId') matchId: number,
    @Query('threshold') threshold: number,
  ) {
    if (threshold) {
      Logger.debug(`Getting messages for match ${matchId} after ${threshold}`);
      const messages = await this.chatService.getMessagesByMatchIdAndThreshold(
        matchId,
        new Date(Date.now() - threshold * 60 * 1000),
      );
      return messages;
    }
    Logger.debug(`Getting all messages for match ${matchId}`);
    const messages = await this.chatService.getMessagesByMatchId(matchId);
    return messages;
  }

  @Get('votes/:matchId')
  async getVotesByMatchId(@Param('matchId') matchId: number) {
    Logger.debug(`Getting votes for match ${matchId}`);
    const votes = await this.chatService.getVotesByMatchId(matchId);
    return votes;
  }
}
