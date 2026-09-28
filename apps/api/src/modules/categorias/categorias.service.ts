import { Injectable, NotFoundException } from '@nestjs/common';
import { CategoriasRepository } from './categorias.repository';

@Injectable()
export class CategoriasService {
  constructor(private readonly categoriasRepository: CategoriasRepository) {}

  async listar() {
    return this.categoriasRepository.listar();
  }

  async obtenerPorId(categoriaId: number) {
    const categoria = await this.categoriasRepository.buscarPorId(categoriaId);
    
    if (!categoria) {
      throw new NotFoundException('Categoría no encontrada');
    }
    
    return categoria;
  }
}