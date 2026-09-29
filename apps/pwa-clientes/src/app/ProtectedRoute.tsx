import { Navigate, Outlet, useLocation } from 'react-router-dom';
import {
  haySesion,
  obtenerTipoUsuario,
} from '../features/auth/auth.storage';
import type { TipoUsuario } from '../features/auth/types/auth.types';

interface ProtectedRouteProps {
  rolesPermitidos?: TipoUsuario[];
}

function obtenerRutaPrincipal(tipoUsuario: TipoUsuario): string {
  return tipoUsuario === 'CLIENTE'
    ? '/pedidos'
    : '/operador';
}

export function ProtectedRoute({
  rolesPermitidos,
}: ProtectedRouteProps) {
  const location = useLocation();
  const tipoUsuario = obtenerTipoUsuario();

  if (!haySesion() || !tipoUsuario) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  if (
    rolesPermitidos &&
    !rolesPermitidos.includes(tipoUsuario)
  ) {
    return (
      <Navigate
        to={obtenerRutaPrincipal(tipoUsuario)}
        replace
      />
    );
  }

  return <Outlet />;
}