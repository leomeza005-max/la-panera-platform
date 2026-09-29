import type {
  ClienteAutenticado,
  LoginClienteResponse,
  LoginOperadorResponse,
  OperadorAutenticado,
  Sesion,
  TipoUsuario,
} from './types/auth.types';

const SESION_KEY = 'la_panera_sesion';

const CLAVES_ANTERIORES = [
  'la_panera_access_token',
  'la_panera_cliente',
  'la_panera_operador_token',
  'la_panera_operador',
];

export function guardarSesion(
  respuesta: LoginClienteResponse | LoginOperadorResponse | Sesion,
): void {
  let sesion: Sesion;

  if ('tipoUsuario' in respuesta) {
    sesion = respuesta;
  } else if ('cliente' in respuesta) {
    sesion = {
      tipoUsuario: 'CLIENTE',
      accessToken: respuesta.accessToken,
      usuario: respuesta.cliente,
    };
  } else {
    sesion = {
      tipoUsuario: respuesta.operador.rol,
      accessToken: respuesta.accessToken,
      usuario: respuesta.operador,
    };
  }

  localStorage.setItem(SESION_KEY, JSON.stringify(sesion));
  limpiarClavesAnteriores();
}

export function obtenerSesion(): Sesion | null {
  const contenido = localStorage.getItem(SESION_KEY);

  if (!contenido) {
    return null;
  }

  try {
    const sesion = JSON.parse(contenido) as Sesion;

    if (
      !sesion.accessToken ||
      !sesion.tipoUsuario ||
      !sesion.usuario
    ) {
      cerrarSesion();
      return null;
    }

    return sesion;
  } catch {
    cerrarSesion();
    return null;
  }
}

export function obtenerToken(): string | null {
  return obtenerSesion()?.accessToken ?? null;
}

export function obtenerTipoUsuario(): TipoUsuario | null {
  return obtenerSesion()?.tipoUsuario ?? null;
}

export function obtenerCliente(): ClienteAutenticado | null {
  const sesion = obtenerSesion();

  if (!sesion || sesion.tipoUsuario !== 'CLIENTE') {
    return null;
  }

  return sesion.usuario;
}

export function obtenerOperador(): OperadorAutenticado | null {
  const sesion = obtenerSesion();

  if (!sesion || sesion.tipoUsuario === 'CLIENTE') {
    return null;
  }

  return sesion.usuario;
}

export function haySesion(): boolean {
  const sesion = obtenerSesion();
  return Boolean(sesion?.accessToken);
}

export function cerrarSesion(): void {
  localStorage.removeItem(SESION_KEY);
  limpiarClavesAnteriores();
}

function limpiarClavesAnteriores(): void {
  for (const clave of CLAVES_ANTERIORES) {
    localStorage.removeItem(clave);
  }
}