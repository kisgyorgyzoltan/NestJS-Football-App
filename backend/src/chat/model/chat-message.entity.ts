import { Match } from 'src/football-data/model/match.entity';
import { User } from 'src/users/user.entity';
import { Entity, ManyToOne, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class ChatMessage {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Match, (match) => match.eventId, { eager: false })
  match: Match;

  @ManyToOne(() => User, (user) => user.id, { eager: false })
  user: User;

  @Column()
  username: string;

  @Column()
  createdAt: Date;

  @Column()
  content: string;
}
