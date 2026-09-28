import { cerrarSesion, obtenerToken } from '../../features/auth/auth.storage';

const API_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

interface ApiRequestOptions extends RequestInit {
  requiereAutenticacion?: boolean;
}

interface ApiErrorBody {
  message?: string | string[];
  error?: string;
}

export async function apiRequest<T>(
  ruta: string,
  opciones: ApiRequestOptions = {},
): Promise<T> {
  const { requiereAutenticacion = false, headers, ...requestInit } = opciones;
  const encabezados = new Headers(headers);

  encabezados.set('Accept', 'application/json');

  if (requestInit.body) {
    encabezados.set('Content-Type', 'application/json');
  }

  if (requiereAutenticacion) {
    const token = obtenerToken();

    if (!token) {
      throw new Error('Debes iniciar sesión para continuar');
    }

    encabezados.set('Authorization', `Bearer ${token}`);
  }

  let respuesta: Response;

  try {
    respuesta = await fetch(`${API_URL}${ruta}`, {
      ...requestInit,
      headers: encabezados,
    });
  } catch {
    throw new Error(
      'No fue posible conectar con la API. Verifica que el backend esté ejecutándose en el puerto 3000.',
    );
  }

  const texto = await respuesta.text();
  const contenido = texto ? (JSON.parse(texto) as T | ApiErrorBody) : undefined;

  if (!respuesta.ok) {
    if (respuesta.status === 401 && requiereAutenticacion) {
      cerrarSesion();
    }

    const mensaje = (contenido as ApiErrorBody | undefined)?.message;
    throw new Error(
      Array.isArray(mensaje)
        ? mensaje.join(', ')
        : mensaje || `Error HTTP ${respuesta.status}`,
    );
  }

  return contenido as T;
}
