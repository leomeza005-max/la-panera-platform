import { apiRequest } from '../../../shared/services/api';
import { Categoria, Producto } from '../types/catalogo.types';

export const obtenerCategorias = async (): Promise<Categoria[]> => {
  // Llama al endpoint GET /categorias
  return apiRequest<Categoria[]>('/categorias', {
    method: 'GET',
  });
};

export const obtenerProductosPorCategoria = async (categoriaId: number): Promise<Producto[]> => {
  // Llama al endpoint GET /productos aplicando los query params requeridos
  return apiRequest<Producto[]>(`/productos?categoriaId=${categoriaId}&estado=true`, {
    method: 'GET',
  });
};