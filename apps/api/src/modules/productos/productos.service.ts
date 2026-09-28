import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductosRepository } from './productos.repository';
import { ListarProductosQueryDto } from './dto/listar-productos-query.dto';

@Injectable()
export class ProductosService {
  constructor(private readonly productosRepository: ProductosRepository) {}

  async listar(filtros: ListarProductosQueryDto) {
    return this.productosRepository.listar(filtros);
  }

  async obtenerPorId(productoId: string) {
    const producto = await this.productosRepository.buscarPorId(productoId);
    
    if (!producto) {
      throw new NotFoundException('Producto no encontrado');
    }
    
    return producto;
  }
}