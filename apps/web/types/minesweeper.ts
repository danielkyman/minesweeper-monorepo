export enum CellStatus {
  HIDDEN = "HIDDEN",
  REVEALED = "REVEALED",
  FLAGGED = "FLAGGED",
  DETONATED = "DETONATED",
}

export enum GameStatus {
  IN_PROGRESS = "IN_PROGRESS",
  WON = "WON",
  LOST = "LOST",
}

export interface Cell {
  x: number;
  y: number;
  status: CellStatus;
  neighboringBombCount?: number;
  isMine?: boolean;
}

export interface Game {
  id: string;
  status: GameStatus;
  rows: number;
  cols: number;
  createdAt: string | Date;
  board: Cell[][];
  mines?: number;
  flagsUsed?: number;
  timeElapsed?: number;
}

export interface GameConfig {
  name: string;
  rows: number;
  cols: number;
  mines: number;
}
