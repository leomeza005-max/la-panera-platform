import type {
  LoginResponse,
  OperadorAutenticado,
} from './types/auth.types';

const TOKEN_KEY = 'la_panera_operador_token';
const OPERADOR_KEY = 'la_panera_operador';

export function guardarSesion(respuesta: LoginResponse): void {
  localStorage.setItem(TOKEN_KEY, respuesta.accessToken);
  localStorage.setItem(
    OPERADOR_KEY,
    JSON.stringify(respuesta.operador),
  );
}

export function obtenerToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function obtenerOperador(): OperadorAutenticado | null {
  const contenido = localStorage.getItem(OPERADOR_KEY);

  if (!contenido) {
    return null;
  }

  try {
    return JSON.parse(contenido) as OperadorAutenticado;
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
  localStorage.removeItem(OPERADOR_KEY);
}