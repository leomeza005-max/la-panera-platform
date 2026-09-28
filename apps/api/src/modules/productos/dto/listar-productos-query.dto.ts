import { IsOptional, IsInt, IsBooleanString } from 'class-validator';
import { Type } from 'class-transformer';

export class ListarProductosQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  categoriaId?: number;

  @IsOptional()
  @IsBooleanString()
  estado?: string;
}