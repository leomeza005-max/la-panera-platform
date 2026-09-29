export type RolOperador = 'CAJERO' | 'ADMIN';

export type TipoUsuario = 'CLIENTE' | RolOperador;

export type TipoAcceso = 'CLIENTE' | 'PERSONAL';

export interface LoginCredentials {
  correo: string;
  contrasena: string;
}

export interface ClienteAutenticado {
  clienteId: string;
  nombre: string;
  apellido1: string;
  apellido2: string | null;
  correo: string;
  numeroTelefonico: string | null;
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

export interface LoginClienteResponse {
  accessToken: string;
  tokenType: 'Bearer';
  cliente: ClienteAutenticado;
}

export interface LoginOperadorResponse {
  accessToken: string;
  tokenType: 'Bearer';
  operador: OperadorAutenticado;
}

/**
 * Se conserva temporalmente para que el login de clientes
 * actual continúe funcionando durante la migración.
 */
export type LoginResponse = LoginClienteResponse;

export interface SesionCliente {
  tipoUsuario: 'CLIENTE';
  accessToken: string;
  usuario: ClienteAutenticado;
}

export interface SesionOperador {
  tipoUsuario: RolOperador;
  accessToken: string;
  usuario: OperadorAutenticado;
}

export type Sesion = SesionCliente | SesionOperador;

export interface PerfilOperadorResponse {
  operador: OperadorAutenticado;
}