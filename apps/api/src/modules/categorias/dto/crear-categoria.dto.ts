import { Transform } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
  MaxLength,
} from 'class-validator';

export class CrearCategoriaDto {
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString({
    message: 'El nombre de la categoría debe ser texto',
  })
  @IsNotEmpty({
    message: 'El nombre de la categoría es obligatorio',
  })
  @MaxLength(50, {
    message: 'El nombre de la categoría no puede superar 50 caracteres',
  })
  nombreCategoria: string;
}