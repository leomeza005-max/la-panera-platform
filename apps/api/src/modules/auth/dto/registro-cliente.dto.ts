import {
  IsEmail,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegistroClienteDto {
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  nombre!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  apellido1!: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  apellido2?: string;

  @IsEmail()
  @MaxLength(100)
  correo!: string;

  @IsOptional()
  @IsString()
  @Matches(/^\+?[0-9\s-]{7,20}$/, {
    message: 'El número telefónico no tiene un formato válido',
  })
  numeroTelefonico?: string;

  @IsString()
  @MinLength(8)
  @MaxLength(72)
  contrasena!: string;
}