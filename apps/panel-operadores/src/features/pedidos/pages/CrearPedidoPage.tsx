import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { crearPedido } from '../services/pedidos.service';
import type { CrearPedidoProducto } from '../types/pedidos.types';

const productoInicial: CrearPedidoProducto = { productoId: '', cantidad: 1 };

export function CrearPedidoPage() {
  const navigate = useNavigate();
  const [sucursalId, setSucursalId] = useState(1);
  const [productos, setProductos] = useState<CrearPedidoProducto[]>([
    { ...productoInicial },
  ]);
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);

  function actualizarProducto(
    indice: number,
    campo: keyof CrearPedidoProducto,
    valor: string,
  ) {
    setProductos((actuales) =>
      actuales.map((producto, posicion) =>
        posicion === indice
          ? {
              ...producto,
              [campo]: campo === 'cantidad' ? Number(valor) : valor,
            }
          : producto,
      ),
    );
  }

  function agregarProducto() {
    setProductos((actuales) => [...actuales, { ...productoInicial }]);
  }

  function eliminarProducto(indice: number) {
    setProductos((actuales) => actuales.filter((_, posicion) => posicion !== indice));
  }

  async function handleSubmit(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setError('');
    setGuardando(true);

    try {
      const respuesta = await crearPedido({ sucursalId, productos });
      navigate(`/pedidos/${respuesta.pedido.pedidoId}`, { replace: true });
    } catch (errorDesconocido) {
      setError(
        errorDesconocido instanceof Error
          ? errorDesconocido.message
          : 'No fue posible crear el pedido',
      );
    } finally {
      setGuardando(false);
    }
  }

  return (
    <main className="contenedor contenedor-angosto">
      <Link to="/pedidos">← Volver a mis pedidos</Link>
      <section className="tarjeta">
        <h1>Realizar pedido</h1>
        <p className="aviso">
          Captura temporal: cuando estén listos los módulos de sucursales y
          productos, estos campos se convertirán en selectores.
        </p>

        <form className="formulario" onSubmit={handleSubmit}>
          <label>
            ID de sucursal
            <input
              type="number"
              min="1"
              step="1"
              value={sucursalId}
              onChange={(evento) => setSucursalId(Number(evento.target.value))}
              required
            />
          </label>

          <fieldset>
            <legend>Productos</legend>
            {productos.map((producto, indice) => (
              <div className="fila-producto" key={indice}>
                <label>
                  UUID del producto
                  <input
                    value={producto.productoId}
                    onChange={(evento) =>
                      actualizarProducto(indice, 'productoId', evento.target.value)
                    }
                    placeholder="e1ed8f7a-ba3a-11f1-bcb4-02744d611bd1"
                    required
                  />
                </label>
                <label>
                  Cantidad
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={producto.cantidad}
                    onChange={(evento) =>
                      actualizarProducto(indice, 'cantidad', evento.target.value)
                    }
                    required
                  />
                </label>
                {productos.length > 1 && (
                  <button
                    className="boton-peligro"
                    type="button"
                    onClick={() => eliminarProducto(indice)}
                  >
                    Quitar
                  </button>
                )}
              </div>
            ))}
          </fieldset>

          <button className="boton-secundario" type="button" onClick={agregarProducto}>
            + Agregar producto
          </button>

          {error && <p className="mensaje-error">{error}</p>}

          <button type="submit" disabled={guardando || productos.length === 0}>
            {guardando ? 'Creando pedido…' : 'Confirmar pedido'}
          </button>
        </form>
      </section>
    </main>
  );
}
