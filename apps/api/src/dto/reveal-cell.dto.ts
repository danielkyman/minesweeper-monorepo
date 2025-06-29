import { IsInt, Min } from 'class-validator';

export class RevealCellDto {
  @IsInt()
  @Min(0)
  row: number;

  @IsInt()
  @Min(0)
  col: number;
}
