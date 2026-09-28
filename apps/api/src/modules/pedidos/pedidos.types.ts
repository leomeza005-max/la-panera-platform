export type EstadoPedido =
  | 'PENDIENTE'
  | 'PREPARANDO'
  | 'LISTO_PICKUP'
  | 'ENTREGADO'
  | 'CANCELADO';

export interface PedidoResumen {
  pedidoId: string;
  sucursalId: number;
  sucursalNombre: string;
  fechaHora: string;
  estado: EstadoPedido;
  totalFinal: number;
}

export interface RespuestaMisPedidos {
  pedidos: PedidoResumen[];
}