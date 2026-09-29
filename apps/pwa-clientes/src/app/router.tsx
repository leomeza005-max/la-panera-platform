import { Navigate, createBrowserRouter } from 'react-router-dom';
import {
  haySesion,
  obtenerTipoUsuario,
} from '../features/auth/auth.storage';
import { LoginPage } from '../features/auth/pages/LoginPage';
import { PanelOperadorPage } from '../features/operadores/pages/PanelOperadorPage';
import { CrearPedidoPage } from '../features/pedidos/pages/CrearPedidoPage';
import { DetallePedidoPage } from '../features/pedidos/pages/DetallePedidoPage';
import { MisPedidosPage } from '../features/pedidos/pages/MisPedidosPage';
import { AppLayout } from './AppLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { CatalogoPage } from '../features/catalogo/pages/CatalogoPage';

function RutaInicial() {
  const tipoUsuario = obtenerTipoUsuario();

  if (!haySesion() || !tipoUsuario) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Navigate
      to={
        tipoUsuario === 'CLIENTE'
          ? '/pedidos'
          : '/operador'
      }
      replace
    />
  );
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RutaInicial />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  // Rutas exclusivas de clientes
  {
    element: (
      <ProtectedRoute rolesPermitidos={['CLIENTE']} />
    ),
    children: [
      {
        element: <AppLayout />,
        children: [
          {
            path: '/productos',
            element: <CatalogoPage />,
          },
          {
            path: '/pedidos',
            element: <MisPedidosPage />,
          },
          {
            path: '/pedidos/nuevo',
            element: <CrearPedidoPage />, // ¡Tu pantalla ya está perfectamente enlazada aquí!
          },
          {
            path: '/pedidos/:pedidoId',
            element: <DetallePedidoPage />,
          },
        ],
      },
    ],
  },
  // Rutas exclusivas de cajeros y administradores
  {
    element: (
      <ProtectedRoute
        rolesPermitidos={['CAJERO', 'ADMIN']}
      />
    ),
    children: [
      {
        path: '/operador',
        element: <PanelOperadorPage />,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);