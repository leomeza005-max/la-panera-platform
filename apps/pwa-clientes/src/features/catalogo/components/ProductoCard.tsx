import { Link } from 'react-router-dom';
import type { Producto } from '../types/catalogo.types';

interface ProductoCardProps {
  producto: Producto;
}

function formatearPrecio(precio: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(precio);
}

export function ProductoCard({ producto }: ProductoCardProps) {
  return (
    <article className="producto-card">
      <div className="producto-card__imagen">
        <span aria-hidden="true">🥐</span>
      </div>

      <div className="producto-card__contenido">
        <span className="producto-card__etiqueta">
          Producto disponible
        </span>

        <h2 className="producto-card__nombre">
          {producto.descripcion}
        </h2>

        <p className="producto-card__precio">
          {formatearPrecio(Number(producto.precioBase))}
        </p>

        <Link
          className="producto-card__boton"
          to="/pedidos/nuevo"
        >
          Agregar a un pedido
        </Link>
      </div>
    </article>
  );
}