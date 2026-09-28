export type RolOperador = 'CAJERO' | 'ADMIN';

export interface LoginCredentials {
  correo: string;
  contrasena: string;
}

export interface OperadorAutenticado {
  operadorId: string;
  sucursalId: number;
  nombre: string;
  apellido1: string;
  apellido2: string | null;
  correo: string;
  rol: RolOperador;
}

export interface LoginResponse {
  accessToken: string;
  tokenType: 'Bearer';
  operador: OperadorAutenticado;
}

export interface PerfilOperadorResponse {
  operador: OperadorAutenticado;
}