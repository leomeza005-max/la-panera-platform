import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { SucursalesService } from './sucursales.service';

@Controller('sucursales')
export class SucursalesController {
  constructor(
    private readonly sucursalesService: SucursalesService,
  ) {}

  @Get()
  listar() {
    return this.sucursalesService.listar();
  }

  @Get(':sucursalId')
  obtenerPorId(
    @Param('sucursalId', ParseIntPipe) sucursalId: number,
  ) {
    return this.sucursalesService.obtenerPorId(sucursalId);
  }
}
