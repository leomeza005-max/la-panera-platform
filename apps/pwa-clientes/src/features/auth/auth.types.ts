export interface LoginCredentials {
  correo: string;
  contrasena: string;
}

export interface ClienteAutenticado {
  clienteId: string;
  nombre: string;
  apellido1: string;
  apellido2?: string | null;
  correo: string;
}

export interface LoginResponse {
  accessToken: string;
  cliente: ClienteAutenticado;
}