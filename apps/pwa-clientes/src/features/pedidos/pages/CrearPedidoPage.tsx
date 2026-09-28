
import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { crearPedido } from '../services/pedidos.service';
import type { CrearPedidoProducto } from '../types/pedidos.types';

import {
  obtenerSucursales,
  type Sucursal,
} from '../../sucursales/services/sucursales.service';

import { apiRequest } from '../../../shared/services/api';

// =========================================
// TIPOS DE DATOS
// =========================================

interface ProductoCatalogo {
  productoId: string;
  descripcion: string;
  precioBase: string | number;
  estado: number | boolean;
}

type ProductoFormulario = CrearPedidoProducto & {
  busqueda: string;
};

const productoInicial: ProductoFormulario = {
  productoId: '',
  cantidad: 1,
  busqueda: '',
};

// Permite buscar ignorando mayúsculas y acentos
const normalizar = (texto: string) =>
  texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

export function CrearPedidoPage() {
  const navigate = useNavigate();

  // =========================================
  // ESTADOS DE SUCURSALES
  // =========================================

  const [sucursalId, setSucursalId] = useState(0);

  const [sucursales, setSucursales] =
    useState<Sucursal[]>([]);

  const [cargandoSucursales, setCargandoSucursales] =
    useState(true);

  // =========================================
  // ESTADOS DE PRODUCTOS
  // =========================================

  const [productos, setProductos] =
    useState<ProductoFormulario[]>([
      { ...productoInicial },
    ]);

  const [catalogo, setCatalogo] =
    useState<ProductoCatalogo[]>([]);

  const [cargandoProductos, setCargandoProductos] =
    useState(true);

  const [desplegableAbierto, setDesplegableAbierto] =
    useState<number | null>(null);

  // =========================================
  // ESTADOS GENERALES
  // =========================================

  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);

  // =========================================
  // CARGAR SUCURSALES DESDE MYSQL
  // =========================================

  useEffect(() => {
    let activo = true;

    async function cargarSucursales() {
      try {
        const datos = await obtenerSucursales();

        if (activo) {
          setSucursales(datos);
        }
      } catch (errorDesconocido) {
        if (activo) {
          setError(
            errorDesconocido instanceof Error
              ? errorDesconocido.message
              : 'No fue posible cargar las sucursales',
          );
        }
      } finally {
        if (activo) {
          setCargandoSucursales(false);
        }
      }
    }

    void cargarSucursales();

    return () => {
      activo = false;
    };
  }, []);

  // =========================================
  // CARGAR CATÁLOGO DE PRODUCTOS
  // =========================================

  useEffect(() => {
    let activo = true;

    apiRequest<ProductoCatalogo[]>(
      '/productos?estado=true',
    )
      .then((datos) => {
        if (activo) {
          setCatalogo(datos);
        }
      })
      .catch((errorDesconocido: unknown) => {
        if (activo) {
          setError(
            errorDesconocido instanceof Error
              ? errorDesconocido.message
              : 'No se pudo cargar el catálogo de productos',
          );
        }
      })
      .finally(() => {
        if (activo) {
          setCargandoProductos(false);
        }
      });

    return () => {
      activo = false;
    };
  }, []);

  // =========================================
  // FILTRAR PRODUCTOS POR NOMBRE
  // =========================================

  function filtrarProductos(
    texto: string,
  ): ProductoCatalogo[] {
    const termino = normalizar(texto.trim());

    if (!termino) {
      return [];
    }

    return catalogo
      .filter((producto) =>
        normalizar(producto.descripcion).includes(termino),
      )
      .sort(
        (a, b) =>
          Number(
            normalizar(b.descripcion).startsWith(termino),
          ) -
          Number(
            normalizar(a.descripcion).startsWith(termino),
          ),
      )
      .slice(0, 8);
  }

  // =========================================
  // BUSCAR PRODUCTO
  // =========================================

  function buscarProducto(
    indice: number,
    texto: string,
  ) {
    setProductos((actuales) =>
      actuales.map((producto, posicion) =>
        posicion === indice
          ? {
              ...producto,
              busqueda: texto,
              productoId: '',
            }
          : producto,
      ),
    );

    setDesplegableAbierto(indice);
  }

  // =========================================
  // SELECCIONAR PRODUCTO
  // =========================================

  function seleccionarProducto(
    indice: number,
    elegido: ProductoCatalogo,
  ) {
    setProductos((actuales) =>
      actuales.map((producto, posicion) =>
        posicion === indice
          ? {
              ...producto,
              busqueda: elegido.descripcion,
              productoId: elegido.productoId,
            }
          : producto,
      ),
    );

    setDesplegableAbierto(null);
  }

  // =========================================
  // ACTUALIZAR CANTIDAD
  // =========================================

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
              [campo]:
                campo === 'cantidad'
                  ? Number(valor)
                  : valor,
            }
          : producto,
      ),
    );
  }

  // =========================================
  // AGREGAR PRODUCTO
  // =========================================

  function agregarProducto() {
    setProductos((actuales) => [
      ...actuales,
      { ...productoInicial },
    ]);
  }

  // =========================================
  // ELIMINAR PRODUCTO
  // =========================================

  function eliminarProducto(indice: number) {
    setProductos((actuales) =>
      actuales.filter(
        (_, posicion) => posicion !== indice,
      ),
    );

    setDesplegableAbierto(null);
  }

  // =========================================
  // CREAR PEDIDO
  // =========================================

  async function handleSubmit(
    evento: FormEvent<HTMLFormElement>,
  ) {
    evento.preventDefault();
    setError('');

    // Validar sucursal
    if (sucursalId <= 0) {
      setError('Debes seleccionar una sucursal');
      return;
    }

    // Validar productos seleccionados
    if (
      productos.length === 0 ||
      productos.some((producto) => !producto.productoId)
    ) {
      setError(
        'Selecciona cada producto de la lista desplegable',
      );
      return;
    }

    // Validar cantidades
    if (
      productos.some(
        (producto) =>
          !Number.isInteger(producto.cantidad) ||
          producto.cantidad < 1,
      )
    ) {
      setError(
        'Las cantidades deben ser números enteros mayores a cero',
      );
      return;
    }

    setGuardando(true);

    try {
      const respuesta = await crearPedido({
        sucursalId,

        // Se envían los UUID reales, no los nombres
        productos: productos.map(
          ({ productoId, cantidad }) => ({
            productoId,
            cantidad,
          }),
        ),
      });

      // Redireccionar al detalle del pedido
      navigate(
        `/pedidos/${respuesta.pedido.pedidoId}`,
        {
          replace: true,
        },
      );
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

  // =========================================
  // INTERFAZ DE USUARIO
  // =========================================

  return (
    <main className="contenedor contenedor-angosto">

      <Link to="/pedidos">
        ← Volver a mis pedidos
      </Link>

      <section className="tarjeta">

        <h1>Realizar pedido</h1>

        <p className="aviso">
          Selecciona la sucursal donde deseas realizar
          tu pedido y agrega los productos correspondientes.
        </p>

        <form
          className="formulario"
          onSubmit={handleSubmit}
        >

          {/* =====================================
              SELECCIÓN DE SUCURSAL
             ===================================== */}

          <label>
            Sucursal

            <select
              value={sucursalId}
              onChange={(evento) =>
                setSucursalId(
                  Number(evento.target.value),
                )
              }
              disabled={cargandoSucursales}
              required
            >
              <option value={0}>
                {cargandoSucursales
                  ? 'Cargando sucursales...'
                  : 'Selecciona una sucursal'}
              </option>

              {sucursales.map((sucursal) => (
                <option
                  key={sucursal.sucursalId}
                  value={sucursal.sucursalId}
                >
                  {sucursal.nombre}
                </option>
              ))}
            </select>
          </label>

          {/* =====================================
              PRODUCTOS
             ===================================== */}

          <fieldset>
            <legend>Productos</legend>

            {productos.map((producto, indice) => (
              <div
                className="fila-producto"
                key={indice}
              >

                {/* BUSCADOR AUTOMÁTICO */}
                <label>
                  Buscar producto por nombre

                  <div className="producto-buscador">

                    <input
                      type="text"
                      value={producto.busqueda}
                      placeholder={
                        cargandoProductos
                          ? 'Cargando productos...'
                          : 'Escribe el nombre del producto...'
                      }
                      autoComplete="off"
                      disabled={cargandoProductos}
                      onChange={(evento) =>
                        buscarProducto(
                          indice,
                          evento.target.value,
                        )
                      }
                      onFocus={() =>
                        setDesplegableAbierto(indice)
                      }
                      onBlur={() =>
                        setDesplegableAbierto(null)
                      }
                      onKeyDown={(evento) => {
                        if (evento.key === 'Escape') {
                          setDesplegableAbierto(null);
                        }

                        if (
                          evento.key === 'Enter' &&
                          desplegableAbierto === indice &&
                          !producto.productoId
                        ) {
                          const primero =
                            filtrarProductos(
                              producto.busqueda,
                            )[0];

                          if (primero) {
                            evento.preventDefault();

                            seleccionarProducto(
                              indice,
                              primero,
                            );
                          }
                        }
                      }}
                      required
                    />

                    {/* LISTA DESPLEGABLE */}
                    {desplegableAbierto === indice &&
                      producto.busqueda.trim() &&
                      !producto.productoId && (

                        <div className="producto-resultados">

                          {filtrarProductos(
                            producto.busqueda,
                          ).length > 0 ? (

                            filtrarProductos(
                              producto.busqueda,
                            ).map((opcion) => (

                              <button
                                key={opcion.productoId}
                                className="producto-opcion"
                                type="button"
                                onMouseDown={(evento) =>
                                  evento.preventDefault()
                                }
                                onClick={() =>
                                  seleccionarProducto(
                                    indice,
                                    opcion,
                                  )
                                }
                              >
                                <span>
                                  {opcion.descripcion}
                                </span>

                                <small>
                                  $
                                  {Number(
                                    opcion.precioBase,
                                  ).toFixed(2)}
                                </small>
                              </button>

                            ))

                          ) : (

                            <p className="producto-sin-resultados">
                              No se encontraron productos.
                            </p>

                          )}

                        </div>
                      )}

                  </div>
                </label>

                {/* CANTIDAD */}
                <label>
                  Cantidad

                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={producto.cantidad}
                    onChange={(evento) =>
                      actualizarProducto(
                        indice,
                        'cantidad',
                        evento.target.value,
                      )
                    }
                    required
                  />
                </label>

                {/* QUITAR PRODUCTO */}
                {productos.length > 1 && (
                  <button
                    className="boton-peligro"
                    type="button"
                    onClick={() =>
                      eliminarProducto(indice)
                    }
                  >
                    Quitar
                  </button>
                )}

              </div>
            ))}
          </fieldset>

          {/* =====================================
              AGREGAR OTRO PRODUCTO
             ===================================== */}

          <button
            className="boton-secundario"
            type="button"
            onClick={agregarProducto}
          >
            + Agregar producto
          </button>

          {/* ERRORES */}
          {error && (
            <p className="mensaje-error">
              {error}
            </p>
          )}

          {/* =====================================
              CONFIRMAR PEDIDO
             ===================================== */}

          <button
            type="submit"
            disabled={
              guardando ||
              cargandoSucursales ||
              cargandoProductos ||
              sucursalId <= 0 ||
              productos.length === 0 ||
              productos.some(
                (producto) => !producto.productoId,
              )
            }
          >
            {guardando
              ? 'Creando pedido…'
              : 'Confirmar pedido'}
          </button>

        </form>
      </section>
    </main>
  );
}
