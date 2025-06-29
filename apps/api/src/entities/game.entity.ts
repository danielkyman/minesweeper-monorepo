import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { GameCell } from './game-cell.entity';
import { GameStatus } from '../types/game-status.enum';

@Entity()
export class Game {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  rows: number;

  @Column()
  cols: number;

  @Column()
  mines: number;

  @Column({ type: 'enum', enum: GameStatus, default: GameStatus.IN_PROGRESS })
  status: GameStatus;

  @Column()
  createdAt: Date;

  @OneToMany(() => GameCell, (cell) => cell.game, {
    cascade: true,
    eager: true,
  })
  cells: GameCell[];
}
