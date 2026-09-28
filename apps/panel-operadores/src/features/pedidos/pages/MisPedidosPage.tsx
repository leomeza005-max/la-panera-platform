import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PedidoCard } from '../components/PedidoCard';
import { obtenerMisPedidos } from '../services/pedidos.service';
import type { PedidoResumen } from '../types/pedidos.types';

export function MisPedidosPage() {
  const [pedidos, setPedidos] = useState<PedidoResumen[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    obtenerMisPedidos()
      .then((respuesta) => setPedidos(respuesta.pedidos))
      .catch((errorDesconocido) => {
        setError(
          errorDesconocido instanceof Error
            ? errorDesconocido.message
            : 'No fue posible cargar tus pedidos',
        );
      })
      .finally(() => setCargando(false));
  }, []);

  const pedidosPendientes = useMemo(
    () =>
      pedidos.filter(
        (pedido) => pedido.estado === 'PENDIENTE',
      ).length,
    [pedidos],
  );

  const totalPedidos = useMemo(
    () =>
      pedidos.reduce(
        (total, pedido) => total + Number(pedido.totalFinal),
        0,
      ),
    [pedidos],
  );

  return (
    <main className="vista">
      <header className="vista-encabezado">
        <div>
          <span className="subtitulo">Panel principal</span>
          <h1>Mis pedidos</h1>
          <p>Consulta el estado y detalle de tus compras.</p>
        </div>

        <Link className="boton boton-nuevo" to="/pedidos/nuevo">
          + Nuevo pedido
        </Link>
      </header>

      <section className="resumen-grid">
        <article className="resumen-tarjeta rosa">
          <span>Pedidos realizados</span>
          <strong>{pedidos.length}</strong>
          <small>Historial total</small>
        </article>

        <article className="resumen-tarjeta beige">
          <span>Pedidos pendientes</span>
          <strong>{pedidosPendientes}</strong>
          <small>En proceso</small>
        </article>

        <article className="resumen-tarjeta cafe">
          <span>Total comprado</span>
          <strong>${totalPedidos.toFixed(2)}</strong>
          <small>Acumulado</small>
        </article>
      </section>

      <section className="panel">
        <div className="panel-encabezado">
          <div>
            <h2>Historial de pedidos</h2>
            <p>Pedidos registrados en tu cuenta.</p>
          </div>
        </div>

        {cargando && (
          <div className="estado-carga">Cargando pedidos...</div>
        )}

        {error && <p className="mensaje-error">{error}</p>}

        {!cargando && !error && pedidos.length === 0 && (
          <div className="estado-vacio">
            <div className="estado-vacio-icono">LP</div>
            <h2>Todavía no tienes pedidos</h2>
            <p>
              Cuando realices tu primer pedido aparecerá aquí.
            </p>
            <Link className="boton" to="/pedidos/nuevo">
              Crear mi primer pedido
            </Link>
          </div>
        )}

        <div className="lista-pedidos">
          {pedidos.map((pedido) => (
            <PedidoCard
              key={pedido.pedidoId}
              pedido={pedido}
            />
          ))}
        </div>
      </section>
    </main>
  );
}