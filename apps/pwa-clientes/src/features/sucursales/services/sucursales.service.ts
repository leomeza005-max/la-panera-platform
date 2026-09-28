    
import { apiRequest } from '../../../shared/services/api';

// Estructura de una sucursal devuelta por el backend
export interface Sucursal {
  sucursalId: number;
  nombre: string;
  direccion: string | null;
}

// Obtener todas las sucursales
export function obtenerSucursales(): Promise<Sucursal[]> {
  return apiRequest<Sucursal[]>('/sucursales', {
    method: 'GET',
  });
}

// Obtener una sucursal por su ID
export function obtenerSucursalPorId(
  sucursalId: number,
): Promise<Sucursal> {
  return apiRequest<Sucursal>(`/sucursales/${sucursalId}`, {
    method: 'GET',
  });
}
