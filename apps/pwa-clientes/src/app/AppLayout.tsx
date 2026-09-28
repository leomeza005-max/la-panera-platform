import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  cerrarSesion,
  obtenerCliente,
} from '../features/auth/auth.storage';

export function AppLayout() {
  const navigate = useNavigate();
  const cliente = obtenerCliente();

  function salir() {
    cerrarSesion();
    navigate('/login', { replace: true });
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-marca">
          <div className="marca-icono">LP</div>

          <div>
            <strong>La Panera</strong>
            <small>Portal de clientes</small>
          </div>
        </div>

        <nav className="sidebar-menu">
          <NavLink
            to="/pedidos"
            end
            className={({ isActive }) =>
              isActive ? 'menu-enlace activo' : 'menu-enlace'
            }
          >
            <span className="menu-icono">01</span>
            Mis pedidos
          </NavLink>

          <NavLink
            to="/pedidos/nuevo"
            className={({ isActive }) =>
              isActive ? 'menu-enlace activo' : 'menu-enlace'
            }
          >
            <span className="menu-icono">02</span>
            Nuevo pedido
          </NavLink>
        </nav>

        <div className="sidebar-pie">
          <span>Sesión iniciada como</span>
          <strong>{cliente?.nombre ?? 'Cliente'}</strong>
          <small>{cliente?.correo}</small>

          <button
            type="button"
            className="boton-salir"
            onClick={salir}
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      <div className="app-area">
        <header className="barra-superior">
          <div>
            <span className="barra-etiqueta">LA PANERA</span>
            <strong>Sistema de pedidos</strong>
          </div>

          <div className="usuario-superior">
            <div className="usuario-avatar">
              {cliente?.nombre?.charAt(0).toUpperCase() ?? 'C'}
            </div>

            <div>
              <strong>
                {cliente?.nombre} {cliente?.apellido1}
              </strong>
              <small>Cliente</small>
            </div>
          </div>
        </header>

        <div className="area-contenido">
          <Outlet />
        </div>
      </div>
    </div>
  );
}