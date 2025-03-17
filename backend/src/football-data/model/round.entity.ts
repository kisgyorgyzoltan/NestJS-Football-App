import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Match } from './match.entity';

@Entity()
export class Round {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  roundId: string;

  @OneToMany(() => Match, (match) => match.round, {
    cascade: true,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  matches: Match[];
}
