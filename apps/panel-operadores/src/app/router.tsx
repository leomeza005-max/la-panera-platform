import {
  Navigate,
  createBrowserRouter,
} from 'react-router-dom';
import { haySesion } from '../features/auth/auth.storage';
import { LoginOperadorPage } from '../features/auth/pages/LoginOperadorPage';
import { PanelOperadorPage } from '../features/operadores/pages/PanelOperadorPage';
import { ProtectedRoute } from './ProtectedRoute';

function RutaInicial() {
  return (
    <Navigate
      to={haySesion() ? '/panel' : '/login'}
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
    element: <LoginOperadorPage />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: '/panel',
        element: <PanelOperadorPage />,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);