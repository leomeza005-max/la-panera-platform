import { apiRequest } from '../../../shared/services/api';
import type {
  LoginClienteResponse,
  LoginCredentials,
  LoginOperadorResponse,
} from '../types/auth.types';

export function iniciarSesionCliente(
  credenciales: LoginCredentials,
): Promise<LoginClienteResponse> {
  return apiRequest<LoginClienteResponse>('/auth/clientes/login', {
    method: 'POST',
    body: JSON.stringify(credenciales),
  });
}

export function iniciarSesionOperador(
  credenciales: LoginCredentials,
): Promise<LoginOperadorResponse> {
  return apiRequest<LoginOperadorResponse>('/auth/operadores/login', {
    method: 'POST',
    body: JSON.stringify(credenciales),
  });
}

/**
 * Compatibilidad temporal con el formulario actual.
 * Actualmente equivale al login de clientes.
 */
export const iniciarSesion = iniciarSesionCliente;