import type { ClienteAutenticado, LoginResponse } from './types/auth.types';

const TOKEN_KEY = 'la_panera_access_token';
const CLIENTE_KEY = 'la_panera_cliente';

export function guardarSesion(respuesta: LoginResponse): void {
  localStorage.setItem(TOKEN_KEY, respuesta.accessToken);
  localStorage.setItem(CLIENTE_KEY, JSON.stringify(respuesta.cliente));
}

export function obtenerToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function obtenerCliente(): ClienteAutenticado | null {
  const contenido = localStorage.getItem(CLIENTE_KEY);

  if (!contenido) return null;

  try {
    return JSON.parse(contenido) as ClienteAutenticado;
  } catch {
    cerrarSesion();
    return null;
  }
}

export function haySesion(): boolean {
  return Boolean(obtenerToken());
}

export function cerrarSesion(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(CLIENTE_KEY);
}
