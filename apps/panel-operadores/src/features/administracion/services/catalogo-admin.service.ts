
import { apiRequest } from '../../../shared/services/api';

// ==========================================
// TIPOS DE CATEGORÍAS
// ==========================================

export interface CategoriaAdmin {
  categoriaId: number;
  nombreCategoria: string;
  estado: boolean | number;
}

export interface DatosCategoria {
  nombreCategoria: string;
  estado?: boolean;
}

// ==========================================
// TIPOS DE PRODUCTOS
// ==========================================

export interface ProductoAdmin {
  productoId: string;
  categoriaId: number;
  nombreCategoria: string;
  descripcion: string;
  precioBase: number | string;
  estado: boolean | number;
}

export interface DatosProducto {
  categoriaId: number;
  descripcion: string;
  precioBase: number;
}

export interface ActualizarProducto
  extends Partial<DatosProducto> {
  estado?: boolean;
}

// ==========================================
// AUTENTICACIÓN ADMINISTRATIVA
// ==========================================

const autorizado = {
  requiereAutenticacion: true,
};

// ==========================================
// LISTAR CATEGORÍAS
// ==========================================

export function listarCategoriasAdmin() {
  return apiRequest<CategoriaAdmin[]>(
    '/administracion/categorias',
    autorizado,
  );
}

// ==========================================
// CREAR CATEGORÍA
// ==========================================

export function crearCategoriaAdmin(
  datos: DatosCategoria,
) {
  return apiRequest<CategoriaAdmin>(
    '/administracion/categorias',
    {
      ...autorizado,
      method: 'POST',
      body: JSON.stringify(datos),
    },
  );
}

// ==========================================
// ACTUALIZAR CATEGORÍA
// ==========================================

export function actualizarCategoriaAdmin(
  categoriaId: number,
  datos: Partial<DatosCategoria>,
) {
  return apiRequest<CategoriaAdmin>(
    `/administracion/categorias/${categoriaId}`,
    {
      ...autorizado,
      method: 'PATCH',
      body: JSON.stringify(datos),
    },
  );
}

// ==========================================
// LISTAR PRODUCTOS
// ==========================================

export function listarProductosAdmin() {
  return apiRequest<ProductoAdmin[]>(
    '/administracion/productos',
    autorizado,
  );
}

// ==========================================
// CREAR PRODUCTO
// ==========================================

export function crearProductoAdmin(
  datos: DatosProducto,
) {
  return apiRequest<ProductoAdmin>(
    '/administracion/productos',
    {
      ...autorizado,
      method: 'POST',
      body: JSON.stringify(datos),
    },
  );
}

// ==========================================
// ACTUALIZAR PRODUCTO
// ==========================================

export function actualizarProductoAdmin(
  productoId: string,
  datos: ActualizarProducto,
) {
  return apiRequest<ProductoAdmin>(
    `/administracion/productos/${productoId}`,
    {
      ...autorizado,
      method: 'PATCH',
      body: JSON.stringify(datos),
    },
  );
}

// ==========================================
// ACTIVAR / DESACTIVAR PRODUCTO
// ==========================================

export function cambiarEstadoProductoAdmin(
  productoId: string,
  estado: boolean,
) {
  return actualizarProductoAdmin(
    productoId,
    { estado },
  );
}

// ==========================================
// ACTIVAR / DESACTIVAR CATEGORÍA
// ==========================================

export function cambiarEstadoCategoriaAdmin(
  categoriaId: number,
  estado: boolean,
) {
  return actualizarCategoriaAdmin(
    categoriaId,
    { estado },
  );
}
