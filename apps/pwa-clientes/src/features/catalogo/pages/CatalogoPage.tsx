import { useEffect, useState } from 'react';
import { ProductoCard } from '../components/ProductoCard';
import {
  obtenerCategorias,
  obtenerProductosPorCategoria,
} from '../services/catalogo.service';
import type {
  Categoria,
  Producto,
} from '../types/catalogo.types';

export function CatalogoPage() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] =
    useState<number | null>(null);

  const [cargandoCategorias, setCargandoCategorias] = useState(true);
  const [cargandoProductos, setCargandoProductos] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function cargarCategorias() {
      try {
        setError('');

        const respuesta = await obtenerCategorias();

        setCategorias(respuesta);

        if (respuesta.length > 0) {
          setCategoriaSeleccionada(respuesta[0].categoriaId);
        }
      } catch (errorDesconocido) {
        setError(
          errorDesconocido instanceof Error
            ? errorDesconocido.message
            : 'No fue posible cargar las categorías',
        );
      } finally {
        setCargandoCategorias(false);
      }
    }

    void cargarCategorias();
  }, []);

  useEffect(() => {
    if (categoriaSeleccionada === null) {
      setProductos([]);
      return;
    }

    async function cargarProductos() {
      try {
        setCargandoProductos(true);
        setError('');

        const respuesta = await obtenerProductosPorCategoria(
          categoriaSeleccionada as number,
        );

        setProductos(respuesta);
      } catch (errorDesconocido) {
        setProductos([]);
        setError(
          errorDesconocido instanceof Error
            ? errorDesconocido.message
            : 'No fue posible cargar los productos',
        );
      } finally {
        setCargandoProductos(false);
      }
    }

    void cargarProductos();
  }, [categoriaSeleccionada]);

  return (
    <main className="catalogo-page">
      <header className="catalogo-page__encabezado">
        <div>
          <span className="catalogo-page__etiqueta">
            Productos La Panera
          </span>

          <h1>Nuestro catálogo</h1>

          <p>
            Consulta nuestros productos disponibles y agrégalos a tu
            próximo pedido.
          </p>
        </div>
      </header>

      {cargandoCategorias && (
        <p className="catalogo-page__mensaje">
          Cargando categorías...
        </p>
      )}

      {!cargandoCategorias && categorias.length === 0 && !error && (
        <p className="catalogo-page__mensaje">
          Por el momento no existen categorías disponibles.
        </p>
      )}

      {categorias.length > 0 && (
        <nav
          className="catalogo-categorias"
          aria-label="Categorías de productos"
        >
          {categorias.map((categoria) => (
            <button
              className={
                categoriaSeleccionada === categoria.categoriaId
                  ? 'catalogo-categorias__boton catalogo-categorias__boton--activo'
                  : 'catalogo-categorias__boton'
              }
              key={categoria.categoriaId}
              onClick={() =>
                setCategoriaSeleccionada(categoria.categoriaId)
              }
              type="button"
            >
              {categoria.nombreCategoria}
            </button>
          ))}
        </nav>
      )}

      {error && (
        <div className="catalogo-page__error" role="alert">
          {error}
        </div>
      )}

      {cargandoProductos && (
        <p className="catalogo-page__mensaje">
          Cargando productos...
        </p>
      )}

      {!cargandoProductos &&
        categoriaSeleccionada !== null &&
        productos.length === 0 &&
        !error && (
          <p className="catalogo-page__mensaje">
            No hay productos disponibles en esta categoría.
          </p>
        )}

      {!cargandoProductos && productos.length > 0 && (
        <section
          className="catalogo-productos"
          aria-label="Productos disponibles"
        >
          {productos.map((producto) => (
            <ProductoCard
              key={producto.productoId}
              producto={producto}
            />
          ))}
        </section>
      )}
    </main>
  );
}