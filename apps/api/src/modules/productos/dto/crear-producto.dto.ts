
import { Type, Transform } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CrearProductoDto {

  // CATEGORÍA A LA QUE PERTENECE
  @Type(() => Number)
  @IsInt()
  @Min(1)
  categoriaId: number;

  // DESCRIPCIÓN DEL PRODUCTO
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  descripcion: string;

  // PRECIO DEL PRODUCTO
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  precioBase: number;
}
