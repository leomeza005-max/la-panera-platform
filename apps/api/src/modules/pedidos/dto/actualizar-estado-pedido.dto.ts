import { IsEnum } from 'class-validator';

export enum EstadoPedidoActualizable {
  PREPARANDO = 'PREPARANDO',
  LISTO_PICKUP = 'LISTO_PICKUP',
  ENTREGADO = 'ENTREGADO',
  CANCELADO = 'CANCELADO',
}

export class ActualizarEstadoPedidoDto {
  @IsEnum(EstadoPedidoActualizable, {
    message:
      'estado debe ser PREPARANDO, LISTO_PICKUP, ENTREGADO o CANCELADO',
  })
  estado!: EstadoPedidoActualizable;
}