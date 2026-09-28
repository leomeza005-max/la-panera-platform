import { Link } from 'react-router-dom';
import type { PedidoResumen } from '../types/pedidos.types';

interface PedidoCardProps {
  pedido: PedidoResumen;
}

export function PedidoCard({ pedido }: PedidoCardProps) {
  return (
    <article className="tarjeta pedido-card">
      <div>
        <span className="estado">{pedido.estado}</span>
        <h2>Pedido #{pedido.pedidoId.slice(0, 8)}</h2>
        <p>Sucursal {pedido.sucursalId}</p>
        <p>{new Date(pedido.fechaHora).toLocaleString('es-MX')}</p>
      </div>
      <div className="pedido-total">
        <strong>${Number(pedido.totalFinal).toFixed(2)}</strong>
        <Link to={`/pedidos/${pedido.pedidoId}`}>Ver detalle</Link>
      </div>
    </article>
  );
}
