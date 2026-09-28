import { apiRequest } from '../../../shared/services/api';
import type { PerfilOperadorResponse } from '../../auth/types/auth.types';

export function obtenerPerfilOperador(): Promise<PerfilOperadorResponse> {
  return apiRequest<PerfilOperadorResponse>(
    '/operadores/perfil',
    {
      requiereAutenticacion: true,
    },
  );
}