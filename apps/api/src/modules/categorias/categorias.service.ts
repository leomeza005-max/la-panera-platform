
import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';

import { CategoriasRepository } from './categorias.repository';
import { CrearCategoriaDto } from './dto/crear-categoria.dto';
import { ActualizarCategoriaDto } from './dto/actualizar-categoria.dto';

@Injectable()
export class CategoriasService {
  constructor(
    private readonly categoriasRepository: CategoriasRepository,
  ) {}

  // ==========================================
  // CATEGORÍAS PARA CLIENTES
  // ==========================================

  async listar() {
    return this.categoriasRepository.listar();
  }

  async obtenerPorId(categoriaId: number) {
    const categoria =
      await this.categoriasRepository.buscarPorId(categoriaId);

    if (!categoria) {
      throw new NotFoundException(
        'Categoría no encontrada',
      );
    }

    return categoria;
  }

  // ==========================================
  // CATEGORÍAS PARA ADMINISTRADORES
  // ==========================================

  async listarTodas() {
    return this.categoriasRepository.listarTodas();
  }

  // ==========================================
  // CREAR CATEGORÍA
  // ==========================================

  async crear(datos: CrearCategoriaDto) {
    const existente =
      await this.categoriasRepository.buscarPorNombre(
        datos.nombreCategoria,
      );

    if (existente) {
      throw new ConflictException(
        'Ya existe una categoría con ese nombre',
      );
    }

    return this.categoriasRepository.crear(
      datos.nombreCategoria,
    );
  }

  // ==========================================
  // ACTUALIZAR CATEGORÍA
  // ==========================================

  async actualizar(
    categoriaId: number,
    datos: ActualizarCategoriaDto,
  ) {
    const actual =
      await this.categoriasRepository.buscarPorId(
        categoriaId,
        true,
      );

    if (!actual) {
      throw new NotFoundException(
        'Categoría no encontrada',
      );
    }

    if (datos.nombreCategoria !== undefined) {
      const duplicada =
        await this.categoriasRepository.buscarPorNombre(
          datos.nombreCategoria,
          categoriaId,
        );

      if (duplicada) {
        throw new ConflictException(
          'Ya existe una categoría con ese nombre',
        );
      }
    }

    return this.categoriasRepository.actualizar(
      categoriaId,
      datos,
    );
  }
}
