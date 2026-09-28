import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { DetallePedidoItem } from '../components/DetallePedidoItem';
import { obtenerPedidoPorId } from '../services/pedidos.service';
import type { PedidoDetalle } from '../types/pedidos.types';

export function DetallePedidoPage() {
  const { pedidoId } = useParams();
  const [pedido, setPedido] = useState<PedidoDetalle | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!pedidoId) {
      setError('No se recibió el identificador del pedido');
      setCargando(false);
      return;
    }

    obtenerPedidoPorId(pedidoId)
      .then((respuesta) => setPedido(respuesta.pedido))
      .catch((errorDesconocido) =>
        setError(
          errorDesconocido instanceof Error
            ? errorDesconocido.message
            : 'No fue posible consultar el pedido',
        ),
      )
      .finally(() => setCargando(false));
  }, [pedidoId]);

  return (
    <main className="contenedor contenedor-angosto">
      <Link to="/pedidos">← Volver a mis pedidos</Link>
      {cargando && <p>Cargando detalle…</p>}
      {error && <p className="mensaje-error">{error}</p>}

      {pedido && (
        <section className="tarjeta">
          <div className="titulo-con-estado">
            <div>
              <p className="marca">La Panera</p>
              <h1>Pedido #{pedido.pedidoId.slice(0, 8)}</h1>
            </div>
            <span className="estado">{pedido.estado}</span>
          </div>
          <p>Sucursal {pedido.sucursalId}</p>
          <p>{new Date(pedido.fechaHora).toLocaleString('es-MX')}</p>

          <ul className="lista-detalles">
            {pedido.detalles.map((detalle) => (
              <DetallePedidoItem key={detalle.detalleId} detalle={detalle} />
            ))}
          </ul>

          <div className="total-final">
            <span>Total</span>
            <strong>${Number(pedido.totalFinal).toFixed(2)}</strong>
          </div>
        </section>
      )}
    </main>
  );
}
