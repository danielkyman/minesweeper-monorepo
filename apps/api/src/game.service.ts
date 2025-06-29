import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Game } from './entities/game.entity';
import { GameCell } from './entities/game-cell.entity';
import { CreateGameDto } from './dto/create-game.dto';
import { RevealCellDto } from './dto/reveal-cell.dto';
import { FlagCellDto } from './dto/flag-cell.dto';
import { GetAllGamesDto } from './dto/get-all-games.dto';
import { GameStatus } from './types/game-status.enum';
import { MinesweeperEngine } from './logic/minesweeper.engine';
import { GameViewTransformer } from './transformers/game-view.transformer';
import { GameViewDto } from './dto/game-view.dto';
import { v4 as uuid } from 'uuid';

@Injectable()
export class GameService {
  constructor(
    @InjectRepository(Game)
    private readonly gameRepo: Repository<Game>,

    @InjectRepository(GameCell)
    private readonly cellRepo: Repository<GameCell>,
  ) {}

  async create(dto: CreateGameDto): Promise<GameViewDto> {
    const id = uuid();
    const cells = MinesweeperEngine.createBoard(dto.rows, dto.cols, dto.mines);

    const game = this.gameRepo.create({
      id,
      rows: dto.rows,
      cols: dto.cols,
      mines: dto.mines,
      status: GameStatus.IN_PROGRESS,
      createdAt: new Date(),
      cells: [],
    });

    await this.gameRepo.save(game);

    for (const cell of cells) {
      cell.game = game;
    }

    await this.cellRepo.save(cells);

    return this.getMaskedGame(id);
  }

  private async findOne(id: string): Promise<Game> {
    const game = await this.gameRepo.findOne({
      where: { id },
      relations: ['cells'],
    });

    if (!game) throw new NotFoundException('Game not found');
    return game;
  }

  async getMaskedGame(id: string): Promise<GameViewDto> {
    const game = await this.findOne(id);
    return GameViewTransformer.transform(game);
  }

  async findAll(query: GetAllGamesDto): Promise<GameViewDto[]> {
    const { status, limit = 10, offset = 0 } = query;

    const qb = this.gameRepo
      .createQueryBuilder('game')
      .leftJoinAndSelect('game.cells', 'cell')
      .orderBy('game.createdAt', 'DESC')
      .take(limit)
      .skip(offset);

    if (status) {
      qb.andWhere('game.status = :status', { status });
    }

    const games = await qb.getMany();
    return games.map((game) => GameViewTransformer.transform(game));
  }

  async reveal(id: string, dto: RevealCellDto): Promise<GameViewDto> {
    const game = await this.findOne(id);

    if (game.status !== GameStatus.IN_PROGRESS) {
      return GameViewTransformer.transform(game);
    }

    const { updatedCells, statusUpdate } = MinesweeperEngine.revealCell(
      game.cells,
      dto.row,
      dto.col,
      game.rows,
      game.cols,
    );

    if (updatedCells.length > 0) {
      await this.cellRepo.save(updatedCells);
    }

    if (statusUpdate && statusUpdate !== game.status) {
      game.status = statusUpdate;
      await this.gameRepo.save(game);
    }

    return this.getMaskedGame(id);
  }

  async flag(id: string, dto: FlagCellDto): Promise<GameViewDto> {
    const game = await this.findOne(id);

    if (game.status !== GameStatus.IN_PROGRESS) {
      return GameViewTransformer.transform(game);
    }

    const cell = game.cells.find(
      (c) => c.xCoordinate === dto.col && c.yCoordinate === dto.row,
    );

    if (!cell) throw new NotFoundException('Cell not found');

    MinesweeperEngine.toggleFlag(cell);
    await this.cellRepo.save(cell);

    return this.getMaskedGame(id);
  }

  async delete(id: string): Promise<void> {
    await this.gameRepo.delete({ id });
  }
}
