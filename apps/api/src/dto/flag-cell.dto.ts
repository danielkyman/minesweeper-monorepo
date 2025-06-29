import { IsInt, Min } from 'class-validator';

export class FlagCellDto {
  @IsInt()
  @Min(0)
  row: number;

  @IsInt()
  @Min(0)
  col: number;
}
