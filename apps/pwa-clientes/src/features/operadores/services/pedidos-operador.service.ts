import { apiRequest } from '../../../shared/services/api';
import type {
  EstadoPedidoActualizable,
  RespuestaPedidoOperador,
  RespuestaPedidosOperador,
} from '../types/pedidos-operador.types';

export function listarPedidosOperador():
  Promise<RespuestaPedidosOperador> {
  return apiRequest<RespuestaPedidosOperador>(
    '/operadores/pedidos',
    {
      requiereAutenticacion: true,
    },
  );
}

export function obtenerPedidoOperador(
  pedidoId: string,
): Promise<RespuestaPedidoOperador> {
  return apiRequest<RespuestaPedidoOperador>(
    `/operadores/pedidos/${pedidoId}`,
    {
      requiereAutenticacion: true,
    },
  );
}

export function actualizarEstadoPedidoOperador(
  pedidoId: string,
  estado: EstadoPedidoActualizable,
): Promise<RespuestaPedidoOperador> {
  return apiRequest<RespuestaPedidoOperador>(
    `/operadores/pedidos/${pedidoId}/estado`,
    {
      method: 'PATCH',
      requiereAutenticacion: true,
      body: JSON.stringify({ estado }),
    },
  );
}