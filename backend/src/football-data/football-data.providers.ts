import { DataSource } from 'typeorm';
import { Match } from './model/match.entity';
import { Round } from './model/round.entity';

export const footballProviders = [
  {
    provide: 'MATCH_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Match),
    inject: ['DATA_SOURCE'],
  },
  {
    provide: 'ROUND_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Round),
    inject: ['DATA_SOURCE'],
  },
];
