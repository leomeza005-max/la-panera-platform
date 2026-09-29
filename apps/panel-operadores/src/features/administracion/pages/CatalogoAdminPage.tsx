
import {
  useEffect,
  useState,
  type FormEvent,
} from 'react';

import {
  listarCategoriasAdmin,
  listarProductosAdmin,
  crearCategoriaAdmin,
  actualizarCategoriaAdmin,
  cambiarEstadoCategoriaAdmin,
  crearProductoAdmin,
  actualizarProductoAdmin,
  cambiarEstadoProductoAdmin,
  type CategoriaAdmin,
  type ProductoAdmin,
} from '../services/catalogo-admin.service';

type Seccion = 'productos' | 'categorias';

interface FormProducto {
  categoriaId: number;
  descripcion: string;
  precioBase: string;
}

const productoVacio: FormProducto = {
  categoriaId: 0,
  descripcion: '',
  precioBase: '',
};

function estaActivo(
  estado: boolean | number,
): boolean {
  return Number(estado) === 1;
}

function formatearPrecio(
  precio: number | string,
): string {
  return Number(precio).toLocaleString(
    'es-MX',
    {
      style: 'currency',
      currency: 'MXN',
    },
  );
}

export function CatalogoAdminPage({
  tipo,
}: {
  tipo: Seccion;
}) {
  // ==========================================
  // ESTADOS GENERALES
  // ==========================================

  const [categorias, setCategorias] =
    useState<CategoriaAdmin[]>([]);

  const [productos, setProductos] =
    useState<ProductoAdmin[]>([]);

  const [cargando, setCargando] =
    useState(true);

  const [guardando, setGuardando] =
    useState(false);

  const [error, setError] =
    useState('');

  const [mensaje, setMensaje] =
    useState('');

  // ==========================================
  // ESTADOS DE CATEGORÍAS
  // ==========================================

  const [
    editandoCategoria,
    setEditandoCategoria,
  ] = useState<number | null>(null);

  const [
    nombreCategoria,
    setNombreCategoria,
  ] = useState('');

  // ==========================================
  // ESTADOS DE PRODUCTOS
  // ==========================================

  const [
    editandoProducto,
    setEditandoProducto,
  ] = useState<string | null>(null);

  const [
    formProducto,
    setFormProducto,
  ] = useState<FormProducto>(
    productoVacio,
  );

  // ==========================================
  // CONSULTAR DATOS
  // ==========================================

  async function cargarDatos() {
    const [
      nuevasCategorias,
      nuevosProductos,
    ] = await Promise.all([
      listarCategoriasAdmin(),
      listarProductosAdmin(),
    ]);

    setCategorias(nuevasCategorias);
    setProductos(nuevosProductos);
  }

  useEffect(() => {
    let activo = true;

    setCargando(true);
    setError('');
    setMensaje('');

    Promise.all([
      listarCategoriasAdmin(),
      listarProductosAdmin(),
    ])
      .then(([cats, prods]) => {
        if (!activo) return;

        setCategorias(cats);
        setProductos(prods);
      })
      .catch((e: unknown) => {
        if (!activo) return;

        setError(
          e instanceof Error
            ? e.message
            : 'Error al consultar el catálogo',
        );
      })
      .finally(() => {
        if (activo) {
          setCargando(false);
        }
      });

    return () => {
      activo = false;
    };
  }, [tipo]);

  // ==========================================
  // LIMPIAR FORMULARIO DE CATEGORÍAS
  // ==========================================

  function nuevaCategoria() {
    setEditandoCategoria(null);
    setNombreCategoria('');
    setError('');
    setMensaje('');
  }

  // ==========================================
  // EDITAR CATEGORÍA
  // ==========================================

  function editarCategoria(
    categoria: CategoriaAdmin,
  ) {
    setEditandoCategoria(
      categoria.categoriaId,
    );

    setNombreCategoria(
      categoria.nombreCategoria,
    );

    setError('');
    setMensaje('');
  }

  // ==========================================
  // GUARDAR CATEGORÍA
  // ==========================================

  async function guardarCategoria(
    evento: FormEvent<HTMLFormElement>,
  ) {
    evento.preventDefault();

    setGuardando(true);
    setError('');
    setMensaje('');

    try {
      const nombre =
        nombreCategoria.trim();

      if (!nombre) {
        throw new Error(
          'Escribe el nombre de la categoría',
        );
      }

      if (editandoCategoria === null) {
        await crearCategoriaAdmin({
          nombreCategoria: nombre,
        });
      } else {
        await actualizarCategoriaAdmin(
          editandoCategoria,
          {
            nombreCategoria: nombre,
          },
        );
      }

      await cargarDatos();

      nuevaCategoria();

      setMensaje(
        'Categoría guardada correctamente.',
      );
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : 'No se pudo guardar la categoría',
      );
    } finally {
      setGuardando(false);
    }
  }

  // ==========================================
  // ACTIVAR / DESACTIVAR CATEGORÍA
  // ==========================================

  async function cambiarEstadoCategoria(
    categoria: CategoriaAdmin,
  ) {
    setGuardando(true);
    setError('');
    setMensaje('');

    try {
      const nuevoEstado =
        !estaActivo(categoria.estado);

      await cambiarEstadoCategoriaAdmin(
        categoria.categoriaId,
        nuevoEstado,
      );

      await cargarDatos();

      setMensaje(
        nuevoEstado
          ? 'Categoría activada correctamente.'
          : 'Categoría desactivada correctamente.',
      );
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : 'No se pudo modificar el estado',
      );
    } finally {
      setGuardando(false);
    }
  }

  // ==========================================
  // LIMPIAR FORMULARIO DE PRODUCTOS
  // ==========================================

  function nuevoProducto() {
    setEditandoProducto(null);

    const primeraCategoria =
      categorias.find(
        (c) => estaActivo(c.estado),
      );

    setFormProducto({
      ...productoVacio,
      categoriaId:
        primeraCategoria?.categoriaId ?? 0,
    });

    setError('');
    setMensaje('');
  }

  // ==========================================
  // EDITAR PRODUCTO
  // ==========================================

  function editarProducto(
    producto: ProductoAdmin,
  ) {
    setEditandoProducto(
      producto.productoId,
    );

    setFormProducto({
      categoriaId: producto.categoriaId,
      descripcion: producto.descripcion,
      precioBase: String(
        producto.precioBase,
      ),
    });

    setError('');
    setMensaje('');
  }

  // ==========================================
  // GUARDAR PRODUCTO
  // ==========================================

  async function guardarProducto(
    evento: FormEvent<HTMLFormElement>,
  ) {
    evento.preventDefault();

    setGuardando(true);
    setError('');
    setMensaje('');

    try {
      const descripcion =
        formProducto.descripcion.trim();

      const precioBase =
        Number(formProducto.precioBase);

      if (!descripcion) {
        throw new Error(
          'Escribe una descripción',
        );
      }

      if (
        formProducto.precioBase.trim() === '' ||
        !Number.isFinite(precioBase) ||
        precioBase < 0
      ) {
        throw new Error(
          'Escribe un precio válido',
        );
      }

      if (formProducto.categoriaId <= 0) {
        throw new Error(
          'Selecciona una categoría',
        );
      }

      if (editandoProducto === null) {
        // REGISTRAR PRODUCTO
        await crearProductoAdmin({
          categoriaId:
            formProducto.categoriaId,
          descripcion,
          precioBase,
        });
      } else {
        // ACTUALIZAR PRODUCTO
        const original = productos.find(
          (p) =>
            p.productoId ===
            editandoProducto,
        );

        await actualizarProductoAdmin(
          editandoProducto,
          {
            descripcion,
            precioBase,
            ...(original?.categoriaId !==
            formProducto.categoriaId
              ? {
                  categoriaId:
                    formProducto.categoriaId,
                }
              : {}),
          },
        );
      }

      await cargarDatos();

      nuevoProducto();

      setMensaje(
        'Producto guardado correctamente.',
      );
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : 'No se pudo guardar el producto',
      );
    } finally {
      setGuardando(false);
    }
  }

  // ==========================================
  // ACTIVAR / DESACTIVAR PRODUCTO
  // ==========================================

  async function cambiarEstadoProducto(
    producto: ProductoAdmin,
  ) {
    setGuardando(true);
    setError('');
    setMensaje('');

    try {
      const nuevoEstado =
        !estaActivo(producto.estado);

      await cambiarEstadoProductoAdmin(
        producto.productoId,
        nuevoEstado,
      );

      await cargarDatos();

      setMensaje(
        nuevoEstado
          ? 'Producto activado correctamente.'
          : 'Producto desactivado correctamente.',
      );
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : 'No se pudo modificar el producto',
      );
    } finally {
      setGuardando(false);
    }
  }

  // ==========================================
  // CATEGORÍAS ACTIVAS
  // ==========================================

  const categoriasActivas =
    categorias.filter(
      (c) => estaActivo(c.estado),
    );

  // ==========================================
  // INTERFAZ
  // ==========================================

  return (
    <section className="operadores-dashboard administracion-pagina">
      <p className="marca">
        Administración del catálogo
      </p>

      <h1>
        {tipo === 'productos'
          ? 'Productos'
          : 'Categorías'}
      </h1>

      <p>
        Gestiona la información del
        catálogo de La Panera.
      </p>

      {cargando && (
        <p>Cargando información...</p>
      )}

      {error && (
        <p className="mensaje-error" role="alert">
          {error}
        </p>
      )}

      {mensaje && (
        <p className="admin-exito" role="status">
          {mensaje}
        </p>
      )}

      {/* ==================================
          SECCIÓN DE CATEGORÍAS
          ================================== */}

      {!cargando &&
        tipo === 'categorias' && (
          <>
            <div className="admin-panel">
              <h2>
                {editandoCategoria === null
                  ? 'Registrar categoría'
                  : 'Editar categoría'}
              </h2>

              <form
                className="admin-form"
                onSubmit={guardarCategoria}
              >
                <label>
                  Nombre de categoría

                  <input
                    required
                    maxLength={120}
                    value={nombreCategoria}
                    onChange={(e) =>
                      setNombreCategoria(
                        e.target.value,
                      )
                    }
                    placeholder="Ej. Pan dulce"
                  />
                </label>

                <div className="admin-acciones">
                  <button
                    type="submit"
                    disabled={guardando}
                  >
                    {guardando
                      ? 'Guardando...'
                      : 'Guardar categoría'}
                  </button>

                  <button
                    type="button"
                    className="boton-secundario"
                    onClick={nuevaCategoria}
                    disabled={guardando}
                  >
                    Limpiar
                  </button>
                </div>
              </form>
            </div>

            <div className="admin-panel">
              <h2>
                Categorías registradas (
                {categorias.length})
              </h2>

              <div className="admin-tabla-scroll">
                <table className="admin-tabla">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Nombre</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>

                  <tbody>
                    {categorias.map(
                      (categoria) => {
                        const activa =
                          estaActivo(
                            categoria.estado,
                          );

                        return (
                          <tr
                            key={
                              categoria.categoriaId
                            }
                          >
                            <td>
                              {
                                categoria.categoriaId
                              }
                            </td>

                            <td>
                              {
                                categoria.nombreCategoria
                              }
                            </td>

                            <td>
                              {activa
                                ? 'Activa'
                                : 'Inactiva'}
                            </td>

                            <td>
                              <div className="admin-acciones">
                                <button
                                  type="button"
                                  disabled={guardando}
                                  onClick={() =>
                                    editarCategoria(
                                      categoria,
                                    )
                                  }
                                >
                                  Editar
                                </button>

                                <button
                                  type="button"
                                  disabled={guardando}
                                  className="boton-secundario"
                                  onClick={() =>
                                    cambiarEstadoCategoria(
                                      categoria,
                                    )
                                  }
                                >
                                  {activa
                                    ? 'Desactivar'
                                    : 'Activar'}
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      },
                    )}

                    {categorias.length === 0 && (
                      <tr>
                        <td colSpan={4}>
                          No hay categorías registradas.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

      {/* ==================================
          SECCIÓN DE PRODUCTOS
          ================================== */}

      {!cargando &&
        tipo === 'productos' && (
          <>
            <div className="admin-panel">
              <h2>
                {editandoProducto === null
                  ? 'Registrar producto'
                  : 'Editar producto'}
              </h2>

              <form
                className="admin-form"
                onSubmit={guardarProducto}
              >
                <label>
                  Descripción

                  <input
                    required
                    maxLength={150}
                    value={
                      formProducto.descripcion
                    }
                    onChange={(e) =>
                      setFormProducto(
                        (f) => ({
                          ...f,
                          descripcion:
                            e.target.value,
                        }),
                      )
                    }
                    placeholder="Ej. Concha de chocolate"
                  />
                </label>

                <label>
                  Categoría

                  <select
                    required
                    value={
                      formProducto.categoriaId ||
                      ''
                    }
                    onChange={(e) =>
                      setFormProducto(
                        (f) => ({
                          ...f,
                          categoriaId: Number(
                            e.target.value,
                          ),
                        }),
                      )
                    }
                  >
                    <option
                      value=""
                      disabled
                    >
                      Selecciona una categoría
                    </option>

                    {categorias.map(
                      (categoria) => (
                        <option
                          key={
                            categoria.categoriaId
                          }
                          value={
                            categoria.categoriaId
                          }
                          disabled={
                            !estaActivo(
                              categoria.estado,
                            )
                          }
                        >
                          {
                            categoria.nombreCategoria
                          }
                          {!estaActivo(
                            categoria.estado,
                          )
                            ? ' (Inactiva)'
                            : ''}
                        </option>
                      ),
                    )}
                  </select>
                </label>

                <label>
                  Precio base (MXN)

                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={
                      formProducto.precioBase
                    }
                    onChange={(e) =>
                      setFormProducto(
                        (f) => ({
                          ...f,
                          precioBase:
                            e.target.value,
                        }),
                      )
                    }
                    placeholder="25.00"
                  />
                </label>

                <div className="admin-acciones">
                  <button
                    type="submit"
                    disabled={
                      guardando ||
                      (
                        editandoProducto === null &&
                        categoriasActivas.length === 0
                      )
                    }
                  >
                    {guardando
                      ? 'Guardando...'
                      : 'Guardar producto'}
                  </button>

                  <button
                    type="button"
                    className="boton-secundario"
                    disabled={guardando}
                    onClick={nuevoProducto}
                  >
                    Limpiar
                  </button>
                </div>
              </form>

              {categoriasActivas.length === 0 && (
                <p>
                  Para registrar productos,
                  primero necesitas una
                  categoría activa.
                </p>
              )}
            </div>

            <div className="admin-panel">
              <h2>
                Productos registrados (
                {productos.length})
              </h2>

              <div className="admin-tabla-scroll">
                <table className="admin-tabla">
                  <thead>
                    <tr>
                      <th>Descripción</th>
                      <th>Categoría</th>
                      <th>Precio</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>

                  <tbody>
                    {productos.map(
                      (producto) => {
                        const activo =
                          estaActivo(
                            producto.estado,
                          );

                        return (
                          <tr
                            key={
                              producto.productoId
                            }
                          >
                            <td>
                              {
                                producto.descripcion
                              }
                            </td>

                            <td>
                              {
                                producto.nombreCategoria
                              }
                            </td>

                            <td>
                              {formatearPrecio(
                                producto.precioBase,
                              )}
                            </td>

                            <td>
                              {activo
                                ? 'Activo'
                                : 'Inactivo'}
                            </td>

                            <td>
                              <div className="admin-acciones">
                                <button
                                  type="button"
                                  disabled={guardando}
                                  onClick={() =>
                                    editarProducto(
                                      producto,
                                    )
                                  }
                                >
                                  Editar
                                </button>

                                <button
                                  type="button"
                                  disabled={guardando}
                                  className="boton-secundario"
                                  onClick={() =>
                                    cambiarEstadoProducto(
                                      producto,
                                    )
                                  }
                                >
                                  {activo
                                    ? 'Desactivar'
                                    : 'Activar'}
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      },
                    )}

                    {productos.length === 0 && (
                      <tr>
                        <td colSpan={5}>
                          No hay productos registrados.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
    </section>
  );
}
