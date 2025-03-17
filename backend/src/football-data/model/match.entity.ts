import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Round } from './round.entity';

@Entity()
export class Match {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  eventId: number;

  @Column()
  homeTeamImageUrl: string;

  @Column()
  awayTeamImageUrl: string;

  @Column()
  homeTeamName: string;

  @Column()
  awayTeamName: string;

  @Column({ nullable: true })
  homeScore: number;

  @Column({ nullable: true })
  awayScore: number;

  @Column()
  matchStatus: string;

  @Column()
  timeDate: string;

  @ManyToOne(() => Round, (round) => round.matches)
  round: Round;
}
