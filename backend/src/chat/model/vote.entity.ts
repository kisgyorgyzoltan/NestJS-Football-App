import { Match } from 'src/football-data/model/match.entity';
import { VoteOption } from 'src/types/chat.types';
import { User } from 'src/users/user.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Vote {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Match, (match) => match.id, { eager: false })
  match: Match;

  @ManyToOne(() => User, (user) => user.id, { eager: false })
  user: User;

  @Column()
  createdAt: Date;

  @Column()
  content: VoteOption;
}
