
import { apiRequest } from '../../../shared/services/api';

// SUCURSALES
export interface SucursalAdmin {
  sucursalId: number;
  nombre: string;
  direccion: string | null;
}

// OPERADORES
export interface OperadorAdmin {
  operadorId: string;
  sucursalId: number;
  sucursalNombre: string;
  nombre: string;
  apellido1: string;
  apellido2: string | null;
  correo: string;
  rol: 'CAJERO' | 'ADMIN';
}

// FORMULARIO DE OPERADORES
export interface FormOperador {
  sucursalId: number;
  nombre: string;
  apellido1: string;
  apellido2: string;
  correo: string;
  rol: 'CAJERO' | 'ADMIN';
  contrasena: string;
}

// Usar JWT del operador
const autorizado = {
  requiereAutenticacion: true,
};

// CONSULTAR SUCURSALES
export function listarSucursalesAdmin() {
  return apiRequest<SucursalAdmin[]>(
    '/administracion/sucursales',
    autorizado,
  );
}

// CREAR O EDITAR SUCURSAL
export function guardarSucursalAdmin(
  id: number | null,
  nombre: string,
  direccion: string,
) {
  return apiRequest<{
    ok?: boolean;
    sucursalId?: number;
  }>(
    id === null
      ? '/administracion/sucursales'
      : `/administracion/sucursales/${id}`,
    {
      ...autorizado,
      method: id === null ? 'POST' : 'PATCH',
      body: JSON.stringify({
        nombre,
        direccion,
      }),
    },
  );
}

// CONSULTAR OPERADORES
export function listarOperadoresAdmin() {
  return apiRequest<OperadorAdmin[]>(
    '/administracion/operadores',
    autorizado,
  );
}

// CREAR O EDITAR OPERADOR
export function guardarOperadorAdmin(
  id: string | null,
  datos: FormOperador,
) {
  return apiRequest<{
    ok?: boolean;
    operadorId?: string;
  }>(
    id === null
      ? '/administracion/operadores'
      : `/administracion/operadores/${id}`,
    {
      ...autorizado,
      method: id === null ? 'POST' : 'PATCH',
      body: JSON.stringify({
        ...datos,
        ...(id !== null && !datos.contrasena
          ? { contrasena: undefined }
          : {}),
      }),
    },
  );
}

