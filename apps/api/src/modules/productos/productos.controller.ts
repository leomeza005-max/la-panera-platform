import { Controller, Get, Param, Query } from '@nestjs/common';
import { ProductosService } from './productos.service';
import { ListarProductosQueryDto } from './dto/listar-productos-query.dto';

@Controller('productos')
export class ProductosController {
  constructor(private readonly productosService: ProductosService) {}

  @Get()
  async listar(@Query() filtros: ListarProductosQueryDto) {
    return this.productosService.listar(filtros);
  }

  @Get(':productoId')
  async obtenerPorId(@Param('productoId') productoId: string) {
    return this.productosService.obtenerPorId(productoId);
  }
}