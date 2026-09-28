import { Navigate, createBrowserRouter } from 'react-router-dom';
import { haySesion } from '../features/auth/auth.storage';
import { LoginPage } from '../features/auth/pages/LoginPage';
import { CrearPedidoPage } from '../features/pedidos/pages/CrearPedidoPage';
import { DetallePedidoPage } from '../features/pedidos/pages/DetallePedidoPage';
import { MisPedidosPage } from '../features/pedidos/pages/MisPedidosPage';
import { AppLayout } from './AppLayout';
import { ProtectedRoute } from './ProtectedRoute';

function RutaInicial() {
  return (
    <Navigate
      to={haySesion() ? '/pedidos' : '/login'}
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
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          {
            path: '/pedidos',
            element: <MisPedidosPage />,
          },
          {
            path: '/pedidos/nuevo',
            element: <CrearPedidoPage />,
          },
          {
            path: '/pedidos/:pedidoId',
            element: <DetallePedidoPage />,
          },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);