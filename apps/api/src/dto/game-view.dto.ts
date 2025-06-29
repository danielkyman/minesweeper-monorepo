import { GameStatus } from '../types/game-status.enum';
import { CellStatus } from '../types/cell-status.enum';

export class CellViewDto {
  x: number;
  y: number;
  status: CellStatus;
  neighboringBombCount?: number;
  isMine?: boolean;
}

export class GameViewDto {
  id: string;
  status: GameStatus;
  rows: number;
  cols: number;
  createdAt: Date;
  board: CellViewDto[][];
}
