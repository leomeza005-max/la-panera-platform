// Define la estructura exacta que devuelve GET /api/v1/categorias
export interface Categoria {
  categoriaId: number;
  nombreCategoria: string;
}

// Define la estructura exacta que devuelve GET /api/v1/productos
export interface Producto {
  productoId: string;
  categoriaId: number;
  descripcion: string;
  precioBase: number;
  estado: boolean;
}