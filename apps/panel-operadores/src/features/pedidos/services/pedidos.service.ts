import { apiRequest } from '../../../shared/services/api';
import type {
  CrearPedidoRequest,
  RespuestaMisPedidos,
  RespuestaPedido,
} from '../types/pedidos.types';

export function obtenerMisPedidos(): Promise<RespuestaMisPedidos> {
  return apiRequest<RespuestaMisPedidos>('/pedidos/mis-pedidos', {
    method: 'GET',
    requiereAutenticacion: true,
  });
}

export function obtenerPedidoPorId(pedidoId: string): Promise<RespuestaPedido> {
  return apiRequest<RespuestaPedido>(`/pedidos/${pedidoId}`, {
    method: 'GET',
    requiereAutenticacion: true,
  });
}

export function crearPedido(
  datos: CrearPedidoRequest,
): Promise<RespuestaPedido> {
  return apiRequest<RespuestaPedido>('/pedidos', {
    method: 'POST',
    requiereAutenticacion: true,
    body: JSON.stringify(datos),
  });
}
