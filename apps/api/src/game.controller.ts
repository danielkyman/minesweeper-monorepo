import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { GameService } from './game.service';
import { CreateGameDto } from './dto/create-game.dto';
import { RevealCellDto } from './dto/reveal-cell.dto';
import { FlagCellDto } from './dto/flag-cell.dto';
import { GetAllGamesDto } from './dto/get-all-games.dto';

@Controller('game')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @Post()
  create(@Body() dto: CreateGameDto) {
    return this.gameService.create(dto);
  }

  @Get()
  getAll(@Query() query: GetAllGamesDto) {
    return this.gameService.findAll(query);
  }

  @Get(':id')
  getGame(@Param('id') id: string) {
    return this.gameService.getMaskedGame(id);
  }

  @Patch(':id/reveal')
  reveal(@Param('id') id: string, @Body() dto: RevealCellDto) {
    return this.gameService.reveal(id, dto);
  }

  @Patch(':id/flag')
  flag(@Param('id') id: string, @Body() dto: FlagCellDto) {
    return this.gameService.flag(id, dto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.gameService.delete(id);
  }
}
