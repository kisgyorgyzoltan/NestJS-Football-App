import { ChatMessage } from 'src/chat/model/chat-message.entity';
import { Vote } from 'src/chat/model/vote.entity';
import { Match } from 'src/football-data/model/match.entity';
import { Round } from 'src/football-data/model/round.entity';
import { User } from 'src/users/user.entity';
import { DataSource } from 'typeorm';

export const databaseProviders = [
  {
    provide: 'DATA_SOURCE',
    useFactory: async () => {
      const dataSource = new DataSource({
        type: 'mysql',
        host: 'localhost',
        port: 3306,
        username: 'root',
        password: '',
        database: 'rtwebprojekt',
        entities: [Round, Match, User, ChatMessage, Vote], // entites: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true, // can lead to data loss
      });

      return dataSource.initialize();
    },
  },
];
