
import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { ProductosRepository } from './productos.repository';
import { CategoriasService } from '../categorias/categorias.service';

import { ListarProductosQueryDto } from './dto/listar-productos-query.dto';
import { CrearProductoDto } from './dto/crear-producto.dto';
import { ActualizarProductoDto } from './dto/actualizar-producto.dto';

@Injectable()
export class ProductosService {

  constructor(
    private readonly productosRepository: ProductosRepository,
    private readonly categoriasService: CategoriasService,
  ) {}

  // ==========================================
  // PRODUCTOS PARA CLIENTES
  // ==========================================

  async listar(filtros: ListarProductosQueryDto) {
    return this.productosRepository.listar(filtros);
  }

  // ==========================================
  // OBTENER PRODUCTO POR ID
  // ==========================================

  async obtenerPorId(productoId: string) {

    const producto =
      await this.productosRepository.buscarPorId(productoId);

    if (!producto) {
      throw new NotFoundException(
        'Producto no encontrado',
      );
    }

    return producto;
  }

  // ==========================================
  // LISTAR TODOS LOS PRODUCTOS (ADMIN)
  // ==========================================

  async listarTodas() {
    return this.productosRepository.listarTodas();
  }

  // ==========================================
  // CREAR PRODUCTO (ADMIN)
  // ==========================================

  async crear(datos: CrearProductoDto) {

    // VALIDAR QUE LA CATEGORÍA EXISTA Y ESTÉ ACTIVA
    await this.categoriasService.obtenerPorId(
      datos.categoriaId,
    );

    // REGISTRAR PRODUCTO EN MYSQL
    return this.productosRepository.crear(datos);
  }

  // ==========================================
  // ACTUALIZAR PRODUCTO (ADMIN)
  // ==========================================

  async actualizar(
    productoId: string,
    datos: ActualizarProductoDto,
  ) {

    // VERIFICAR QUE EXISTA EL PRODUCTO
    const producto =
      await this.productosRepository.buscarPorId(productoId);

    if (!producto) {
      throw new NotFoundException(
        'El producto no existe',
      );
    }

    // VALIDAR CATEGORÍA SI SE ESTÁ CAMBIANDO
    if (datos.categoriaId !== undefined) {
      await this.categoriasService.obtenerPorId(
        datos.categoriaId,
      );
    }

    // ACTUALIZAR DATOS EN MYSQL
    const actualizado =
      await this.productosRepository.actualizar(
        productoId,
        datos,
      );

    if (!actualizado) {
      throw new NotFoundException(
        'No se pudo encontrar el producto para actualizar',
      );
    }

    return actualizado;
  }
}
