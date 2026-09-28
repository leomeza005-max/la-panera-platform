import type { RolOperador } from '../../operadores/operadores.repository';

export interface OperadorJwtPayload {
  sub: string;
  correo: string;
  tipo: 'operador';
  sucursalId: number;
  rol: RolOperador;
  iat?: number;
  exp?: number;
}

export interface UsuarioOperadorAutenticado {
  operadorId: string;
  correo: string;
  tipo: 'operador';
  sucursalId: number;
  rol: RolOperador;
}
