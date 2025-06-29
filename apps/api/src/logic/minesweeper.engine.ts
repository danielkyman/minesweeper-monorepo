import { GameCell } from '../entities/game-cell.entity';
import { GameStatus } from '../types/game-status.enum';
import { CellStatus } from '../types/cell-status.enum';

export class MinesweeperEngine {
  static createBoard(rows: number, cols: number, mines: number): GameCell[] {
    const totalCells = rows * cols;
    if (mines >= totalCells) throw new Error('Too many mines');

    // Generate empty board
    const cells: GameCell[] = [];
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const cell = new GameCell();
        cell.xCoordinate = x;
        cell.yCoordinate = y;
        cell.isMine = false;
        cell.neighboringBombCount = 0;
        cell.status = CellStatus.HIDDEN;
        cells.push(cell);
      }
    }

    // Place mines randomly
    const minePositions = new Set<number>();
    while (minePositions.size < mines) {
      minePositions.add(Math.floor(Math.random() * totalCells));
    }
    for (const index of minePositions) {
      cells[index].isMine = true;
    }

    // Calculate neighboring mine counts
    for (const cell of cells) {
      if (cell.isMine) continue;
      cell.neighboringBombCount = this.getNeighbors(
        cell,
        cells,
        rows,
        cols,
      ).filter((n) => n.isMine).length;
    }

    return cells;
  }

  static revealCell(
    cells: GameCell[],
    row: number,
    col: number,
    rows: number,
    cols: number,
  ): { updatedCells: GameCell[]; statusUpdate: GameStatus | null } {
    const cell = this.getCell(cells, row, col);
    if (!cell || cell.status !== CellStatus.HIDDEN)
      return { updatedCells: [], statusUpdate: null };

    if (cell.isMine) {
      cell.status = CellStatus.DETONATED;
      return { updatedCells: [cell], statusUpdate: GameStatus.LOST };
    }

    const revealed = this.floodReveal(cell, cells, rows, cols);
    const status = this.checkGameStatus(cells);

    return { updatedCells: revealed, statusUpdate: status };
  }

  static toggleFlag(cell: GameCell) {
    if (cell.status === CellStatus.HIDDEN) {
      cell.status = CellStatus.FLAGGED;
    } else if (cell.status === CellStatus.FLAGGED) {
      cell.status = CellStatus.HIDDEN;
    }
  }

  static checkGameStatus(cells: GameCell[]): GameStatus {
    const unrevealedSafeCells = cells.filter(
      (c) => !c.isMine && c.status === CellStatus.HIDDEN,
    );

    const detonated = cells.find((c) => c.status === CellStatus.DETONATED);

    if (detonated) return GameStatus.LOST;
    if (unrevealedSafeCells.length === 0) return GameStatus.WON;

    return GameStatus.IN_PROGRESS;
  }

  // === Helpers ===

  private static getCell(
    cells: GameCell[],
    row: number,
    col: number,
  ): GameCell | undefined {
    return cells.find((c) => c.xCoordinate === col && c.yCoordinate === row);
  }

  private static getNeighbors(
    cell: GameCell,
    cells: GameCell[],
    rows: number,
    cols: number,
  ): GameCell[] {
    const deltas = [-1, 0, 1];
    const neighbors: GameCell[] = [];

    for (const dx of deltas) {
      for (const dy of deltas) {
        if (dx === 0 && dy === 0) continue;

        const x = cell.xCoordinate + dx;
        const y = cell.yCoordinate + dy;

        if (x >= 0 && x < cols && y >= 0 && y < rows) {
          const neighbor = this.getCell(cells, y, x);
          if (neighbor) neighbors.push(neighbor);
        }
      }
    }

    return neighbors;
  }

  private static floodReveal(
    cell: GameCell,
    cells: GameCell[],
    rows: number,
    cols: number,
  ): GameCell[] {
    const stack: GameCell[] = [cell];
    const revealed: Set<GameCell> = new Set();

    while (stack.length > 0) {
      const current = stack.pop();
      if (!current || current.status !== CellStatus.HIDDEN) continue;

      current.status = CellStatus.REVEALED;
      revealed.add(current);

      if (current.neighboringBombCount === 0) {
        const neighbors = this.getNeighbors(current, cells, rows, cols);
        for (const neighbor of neighbors) {
          if (neighbor.status === CellStatus.HIDDEN && !neighbor.isMine) {
            stack.push(neighbor);
          }
        }
      }
    }

    return Array.from(revealed);
  }
}
