export interface PedidoResumen {
  pedidoId: string;
  sucursalId: number;
  fechaHora: string;
  estado: string;
  totalFinal: number;
}

export interface DetallePedido {
  detalleId: string;
  productoId: string;
  productoDescripcion: string;
  cantidad: number;
  precioUnitario: number;
  descuentoAplicado: number;
}

export interface PedidoDetalle extends PedidoResumen {
  detalles: DetallePedido[];
}

export interface RespuestaMisPedidos {
  pedidos: PedidoResumen[];
}

export interface RespuestaPedido {
  pedido: PedidoDetalle;
}

export interface CrearPedidoProducto {
  productoId: string;
  cantidad: number;
}

export interface CrearPedidoRequest {
  sucursalId: number;
  productos: CrearPedidoProducto[];
}
