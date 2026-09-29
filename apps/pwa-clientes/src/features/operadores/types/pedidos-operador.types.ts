export type EstadoPedido =
  | 'PENDIENTE'
  | 'PREPARANDO'
  | 'LISTO_PICKUP'
  | 'ENTREGADO'
  | 'CANCELADO';

export type EstadoPedidoActualizable =
  | 'PREPARANDO'
  | 'LISTO_PICKUP'
  | 'ENTREGADO'
  | 'CANCELADO';

export interface PedidoOperadorResumen {
  pedidoId: string;
  clienteId: string;
  clienteNombre: string;
  clienteCorreo: string;
  sucursalId: number;
  sucursalNombre: string;
  fechaHora: string;
  estado: EstadoPedido;
  totalFinal: number;
}

export interface DetallePedidoOperador {
  detalleId: string;
  productoId: string;
  productoDescripcion: string;
  cantidad: number;
  precioUnitario: number;
  descuentoAplicado: number;
}

export interface PedidoOperadorDetalle
  extends PedidoOperadorResumen {
  detalles: DetallePedidoOperador[];
}

export interface RespuestaPedidosOperador {
  pedidos: PedidoOperadorResumen[];
}

export interface RespuestaPedidoOperador {
  pedido: PedidoOperadorDetalle;
}