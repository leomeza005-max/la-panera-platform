import type { DetallePedido } from '../types/pedidos.types';

interface DetallePedidoItemProps {
  detalle: DetallePedido;
}

export function DetallePedidoItem({ detalle }: DetallePedidoItemProps) {
  const subtotal =
    detalle.cantidad * Number(detalle.precioUnitario) -
    Number(detalle.descuentoAplicado);

  return (
    <li className="detalle-item">
      <div>
        <strong>{detalle.productoDescripcion}</strong>
        <small>{detalle.productoId}</small>
      </div>
      <div>
        <span>
          {detalle.cantidad} × ${Number(detalle.precioUnitario).toFixed(2)}
        </span>
        <strong>${subtotal.toFixed(2)}</strong>
      </div>
    </li>
  );
}
