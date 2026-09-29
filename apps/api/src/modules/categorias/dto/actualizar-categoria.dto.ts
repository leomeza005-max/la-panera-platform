import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class ActualizarCategoriaDto {
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString({
    message: 'El nombre de la categoría debe ser texto',
  })
  @IsNotEmpty({
    message: 'El nombre de la categoría no puede estar vacío',
  })
  @MaxLength(50, {
    message: 'El nombre de la categoría no puede superar 50 caracteres',
  })
  nombreCategoria?: string;

  @IsOptional()
  @IsBoolean({
    message: 'El estado debe ser verdadero o falso',
  })
  estado?: boolean;
}