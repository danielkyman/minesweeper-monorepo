import { Game } from '../entities/game.entity';
import { GameCell } from '../entities/game-cell.entity';
import { CellViewDto, GameViewDto } from '../dto/game-view.dto';
import { CellStatus } from '../types/cell-status.enum';

export class GameViewTransformer {
  static transform(game: Game): GameViewDto {
    return {
      id: game.id,
      status: game.status,
      rows: game.rows,
      cols: game.cols,
      createdAt: game.createdAt,
      board: this.groupToMatrix(game.cells, game.rows, game.cols),
    };
  }

  private static groupToMatrix(
    cells: GameCell[],
    rows: number,
    cols: number,
  ): CellViewDto[][] {
    const matrix: CellViewDto[][] = Array.from({ length: rows }, () =>
      Array(cols).fill(null),
    );

    for (const cell of cells) {
      matrix[cell.yCoordinate][cell.xCoordinate] = this.maskCell(cell);
    }

    return matrix;
  }

  private static maskCell(cell: GameCell): CellViewDto {
    const base = {
      x: cell.xCoordinate,
      y: cell.yCoordinate,
      status: cell.status,
    };

    if (
      cell.status === CellStatus.REVEALED ||
      cell.status === CellStatus.DETONATED
    ) {
      return {
        ...base,
        neighboringBombCount: cell.neighboringBombCount,
        isMine: cell.status === CellStatus.DETONATED ? cell.isMine : undefined,
      };
    }

    return base;
  }
}
