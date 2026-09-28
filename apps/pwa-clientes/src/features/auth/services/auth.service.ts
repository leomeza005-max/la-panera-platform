import { apiRequest } from '../../../shared/services/api';
import type { LoginCredentials, LoginResponse } from '../types/auth.types';

export function iniciarSesion(
  credenciales: LoginCredentials,
): Promise<LoginResponse> {
  return apiRequest<LoginResponse>('/auth/clientes/login', {
    method: 'POST',
    body: JSON.stringify(credenciales),
  });
}
