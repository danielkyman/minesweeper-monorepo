import { IsOptional, IsEnum, IsInt, Min } from 'class-validator';
import { GameStatus } from '../types/game-status.enum';

export class GetAllGamesDto {
  @IsOptional()
  @IsEnum(GameStatus)
  status?: GameStatus;

  @IsOptional()
  @IsInt()
  @Min(0)
  limit?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  offset?: number;
}
