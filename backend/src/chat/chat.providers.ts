import { DataSource } from 'typeorm';
import { ChatMessage } from './model/chat-message.entity';
import { Vote } from './model/vote.entity';

export const chatProviders = [
  {
    provide: 'CHAT_MESSAGE_REPOSITORY',
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(ChatMessage),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'VOTE_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Vote),
    inject: ['DATA_SOURCE'],
  },
];
