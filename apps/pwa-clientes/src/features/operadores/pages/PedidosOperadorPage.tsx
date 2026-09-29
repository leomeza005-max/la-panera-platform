import { useEffect, useState } from 'react';
import {
  actualizarEstadoPedidoOperador,
  listarPedidosOperador,
} from '../services/pedidos-operador.service';
import type {
  EstadoPedido,
  EstadoPedidoActualizable,
  PedidoOperadorResumen,
} from '../types/pedidos-operador.types';

const formatoMoneda = new Intl.NumberFormat(
  'es-MX',
  {
    style: 'currency',
    currency: 'MXN',
  },
);

const formatoFecha = new Intl.DateTimeFormat(
  'es-MX',
  {
    dateStyle: 'medium',
    timeStyle: 'short',
  },
);

function obtenerSiguienteEstado(
  estado: EstadoPedido,
): EstadoPedidoActualizable | null {
  switch (estado) {
    case 'PENDIENTE':
      return 'PREPARANDO';

    case 'PREPARANDO':
      return 'LISTO_PICKUP';

    case 'LISTO_PICKUP':
      return 'ENTREGADO';

    default:
      return null;
  }
}

function obtenerTextoAccion(
  estado: EstadoPedido,
): string | null {
  switch (estado) {
    case 'PENDIENTE':
      return 'Iniciar preparación';

    case 'PREPARANDO':
      return 'Marcar como listo';

    case 'LISTO_PICKUP':
      return 'Marcar como entregado';

    default:
      return null;
  }
}

function formatearFecha(fecha: string): string {
  const fechaConvertida = new Date(fecha);

  if (Number.isNaN(fechaConvertida.getTime())) {
    return fecha;
  }

  return formatoFecha.format(fechaConvertida);
}

export function PedidosOperadorPage() {
  const [pedidos, setPedidos] = useState<
    PedidoOperadorResumen[]
  >([]);

  const [cargando, setCargando] = useState(true);
  const [actualizando, setActualizando] =
    useState<string | null>(null);

  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');

  async function cargarPedidos() {
    setCargando(true);
    setError('');

    try {
      const respuesta =
        await listarPedidosOperador();

      setPedidos(respuesta.pedidos);
    } catch (errorDesconocido) {
      setError(
        errorDesconocido instanceof Error
          ? errorDesconocido.message
          : 'No fue posible consultar los pedidos',
      );
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    void cargarPedidos();
  }, []);

  async function cambiarEstado(
    pedidoId: string,
    estado: EstadoPedidoActualizable,
  ) {
    setActualizando(pedidoId);
    setError('');
    setMensaje('');

    try {
      const respuesta =
        await actualizarEstadoPedidoOperador(
          pedidoId,
          estado,
        );

      setPedidos((pedidosActuales) =>
        pedidosActuales.map((pedido) =>
          pedido.pedidoId === pedidoId
            ? {
                ...pedido,
                estado: respuesta.pedido.estado,
              }
            : pedido,
        ),
      );

      setMensaje(
        `El pedido se actualizó a ${respuesta.pedido.estado}.`,
      );
    } catch (errorDesconocido) {
      setError(
        errorDesconocido instanceof Error
          ? errorDesconocido.message
          : 'No fue posible actualizar el pedido',
      );
    } finally {
      setActualizando(null);
    }
  }

  return (
    <section className="operadores-dashboard administracion-pagina">
      <p className="marca">Operación</p>

      <h1>Pedidos</h1>

      <p>
        Consulta los pedidos de clientes y actualiza su
        estado de preparación.
      </p>

      {error && (
        <p className="mensaje-error">{error}</p>
      )}

      {mensaje && (
        <p className="admin-exito">{mensaje}</p>
      )}

      <div className="admin-panel">
        <div className="panel-encabezado">
          <h2>Pedidos registrados ({pedidos.length})</h2>

          <button
            type="button"
            className="boton-secundario"
            onClick={() => void cargarPedidos()}
            disabled={cargando}
          >
            {cargando ? 'Actualizando…' : 'Actualizar'}
          </button>
        </div>

        {cargando ? (
          <p>Cargando pedidos…</p>
        ) : pedidos.length === 0 ? (
          <p>No existen pedidos registrados.</p>
        ) : (
          <div className="admin-tabla-scroll">
            <table className="admin-tabla">
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Sucursal</th>
                  <th>Fecha</th>
                  <th>Estado</th>
                  <th>Total</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {pedidos.map((pedido) => {
                  const siguienteEstado =
                    obtenerSiguienteEstado(
                      pedido.estado,
                    );

                  const textoAccion =
                    obtenerTextoAccion(
                      pedido.estado,
                    );

                  const estaActualizando =
                    actualizando === pedido.pedidoId;

                  return (
                    <tr key={pedido.pedidoId}>
                      <td>
                        <strong>
                          {pedido.clienteNombre}
                        </strong>

                        <br />

                        <small>
                          {pedido.clienteCorreo}
                        </small>
                      </td>

                      <td>
                        {pedido.sucursalNombre}
                      </td>

                      <td>
                        {formatearFecha(
                          pedido.fechaHora,
                        )}
                      </td>

                      <td>
                        <span className="estado">
                          {pedido.estado}
                        </span>
                      </td>

                      <td>
                        {formatoMoneda.format(
                          pedido.totalFinal,
                        )}
                      </td>

                      <td>
                        <div className="admin-acciones">
                          {siguienteEstado &&
                            textoAccion && (
                              <button
                                type="button"
                                disabled={
                                  estaActualizando
                                }
                                onClick={() =>
                                  void cambiarEstado(
                                    pedido.pedidoId,
                                    siguienteEstado,
                                  )
                                }
                              >
                                {estaActualizando
                                  ? 'Actualizando…'
                                  : textoAccion}
                              </button>
                            )}

                          {pedido.estado ===
                            'PENDIENTE' && (
                            <button
                              type="button"
                              className="boton-peligro"
                              disabled={
                                estaActualizando
                              }
                              onClick={() =>
                                void cambiarEstado(
                                  pedido.pedidoId,
                                  'CANCELADO',
                                )
                              }
                            >
                              Cancelar
                            </button>
                          )}

                          {!siguienteEstado &&
                            pedido.estado !==
                              'PENDIENTE' && (
                              <small>
                                Sin acciones pendientes
                              </small>
                            )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}