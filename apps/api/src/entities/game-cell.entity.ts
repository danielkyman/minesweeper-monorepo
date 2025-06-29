import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Game } from './game.entity';
import { CellStatus } from '../types/cell-status.enum';

@Entity()
export class GameCell {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Game, (game) => game.cells, { onDelete: 'CASCADE' })
  game: Game;

  @Column()
  xCoordinate: number;

  @Column()
  yCoordinate: number;

  @Column({ default: false })
  isMine: boolean;

  @Column({ default: 0 })
  neighboringBombCount: number;

  @Column({ type: 'enum', enum: CellStatus, default: CellStatus.HIDDEN })
  status: CellStatus;
}
