import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';

export class CrearDetallePedidoDto {
  @IsUUID('4')
  productoId: string;

  @IsInt()
  @Min(1)
  cantidad: number;
}

export class CrearPedidoDto {
  @IsInt()
  @Min(1)
  sucursalId: number;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CrearDetallePedidoDto)
  productos: CrearDetallePedidoDto[];
}