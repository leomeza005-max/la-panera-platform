import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  cerrarSesion,
  obtenerOperador,
} from '../../auth/auth.storage';
import type { OperadorAutenticado } from '../../auth/types/auth.types';
import { obtenerPerfilOperador } from '../services/operadores.service';
import { AdministracionPage } from '../../administracion/pages/AdministracionPage';
import { PedidosOperadorPage } from './PedidosOperadorPage';

export function PanelOperadorPage() {
  const navigate = useNavigate();

const [seccion, setSeccion] = useState<
  'inicio' | 'pedidos' | 'sucursales' | 'operadores'
>('inicio');

  const [operador, setOperador] =
    useState<OperadorAutenticado | null>(
      obtenerOperador(),
    );

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    obtenerPerfilOperador()
      .then((respuesta) => {
        setOperador(respuesta.operador);
      })
      .catch((errorDesconocido) => {
        setError(
          errorDesconocido instanceof Error
            ? errorDesconocido.message
            : 'No fue posible cargar el perfil',
        );
      })
      .finally(() => setCargando(false));
  }, []);

  function salir() {
    cerrarSesion();
    navigate('/login', { replace: true });
  }

  const nombreCompleto = operador
    ? `${operador.nombre} ${operador.apellido1}`
    : 'Operador';

  return (
    <div className="operadores-layout">
      <aside className="operadores-sidebar">
        <div className="operadores-marca">
          <span>LP</span>

          <div>
            <strong>La Panera</strong>
            <small>Panel de operadores</small>
          </div>
        </div>

        <nav className="operadores-menu">
          <button
  className={
    seccion === 'inicio'
      ? 'activo'
      : undefined
  }
  type="button"
  onClick={() => setSeccion('inicio')}
>
            <span>01</span>
            Inicio
          </button>

         <button
  type="button"
  className={
    seccion === 'pedidos'
      ? 'activo'
      : undefined
  }
  onClick={() => setSeccion('pedidos')}
>
  <span>02</span>
  Pedidos
</button>

          
{operador?.rol === 'ADMIN' && (
  <>
    <button
      className={
        seccion === 'sucursales'
          ? 'activo'
          : undefined
      }
      type="button"
      onClick={() =>
        setSeccion('sucursales')
      }
    >
      <span>03</span>
      Sucursales
    </button>

    <button
      className={
        seccion === 'operadores'
          ? 'activo'
          : undefined
      }
      type="button"
      onClick={() =>
        setSeccion('operadores')
      }
    >
      <span>04</span>
      Operadores
    </button>
  </>
)}

        </nav>

        <div className="operadores-sesion">
          <small>Sesión iniciada como</small>
          <strong>{nombreCompleto}</strong>
          <span>{operador?.correo}</span>

          <button type="button" onClick={salir}>
            Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="operadores-contenido">
        <header className="operadores-header">
          <div>
            <p className="marca">La Panera</p>
            <strong>Sistema de operadores</strong>
          </div>

          <div className="operadores-usuario">
            <span>
              {operador?.nombre.charAt(0) || 'O'}
            </span>

            <div>
              <strong>{nombreCompleto}</strong>
              <small>{operador?.rol || 'Operador'}</small>
            </div>
          </div>
        </header>

{seccion === 'inicio' ? (
  <section className="operadores-dashboard">
    <p className="marca">Panel principal</p>

    <h1>
      Bienvenido, {operador?.nombre || 'operador'}
    </h1>

    <p>
      Consulta la información correspondiente a tu sucursal.
    </p>

    {cargando && <p>Cargando información…</p>}

    {error && (
      <p className="mensaje-error">{error}</p>
    )}

    {!cargando && !error && operador && (
      <div className="operadores-tarjetas">
        <article className="operador-tarjeta rosa">
          <span>Sucursal asignada</span>
          <strong>{operador.sucursalId}</strong>
          <small>Sucursal de trabajo</small>
        </article>

        <article className="operador-tarjeta beige">
          <span>Rol</span>
          <strong>{operador.rol}</strong>
          <small>Nivel de permisos</small>
        </article>

        <article className="operador-tarjeta cafe">
          <span>Estado</span>
          <strong>Activo</strong>
          <small>JWT verificado</small>
        </article>
      </div>
    )}
  </section>
) : seccion === 'pedidos' ? (
  <PedidosOperadorPage />
) : operador?.rol === 'ADMIN' ? (
  <AdministracionPage tipo={seccion} />
) : null}
      </main>
    </div>
  );
}