import { IsInt, Min, Max } from 'class-validator';

export class CreateGameDto {
  @IsInt()
  @Min(5)
  @Max(30)
  rows: number;

  @IsInt()
  @Min(5)
  @Max(30)
  cols: number;

  @IsInt()
  @Min(1)
  mines: number;
}
