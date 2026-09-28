import { Injectable, NotFoundException } from '@nestjs/common';
import {
  Sucursal,
  SucursalesRepository,
} from './sucursales.repository';

@Injectable()
export class SucursalesService {
  constructor(
    private readonly sucursalesRepository: SucursalesRepository,
  ) {}

  async listar(): Promise<Sucursal[]> {
    return this.sucursalesRepository.listar();
  }

  async obtenerPorId(sucursalId: number): Promise<Sucursal> {
    const sucursal =
      await this.sucursalesRepository.buscarPorId(sucursalId);

    if (!sucursal) {
      throw new NotFoundException('Sucursal no encontrada');
    }

    return sucursal;
  }
}
