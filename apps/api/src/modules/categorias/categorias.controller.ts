import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { CategoriasService } from './categorias.service';

@Controller('categorias')
export class CategoriasController {
  constructor(private readonly categoriasService: CategoriasService) {}

  @Get()
  async listar() {
    return this.categoriasService.listar();
  }

  @Get(':categoriaId')
  async obtenerPorId(@Param('categoriaId', ParseIntPipe) categoriaId: number) {
    return this.categoriasService.obtenerPorId(categoriaId);
  }
}