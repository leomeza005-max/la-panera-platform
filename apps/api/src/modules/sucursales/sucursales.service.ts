import { Injectable, NotFoundException } from '@nestjs/common';
import { SucursalesRepository } from './sucursales.repository';
import type { Sucursal } from './sucursales.repository';

@Injectable()
export class SucursalesService {
  constructor(
    private readonly sucursalesRepository: SucursalesRepository,
  ) {}

  listar(): Promise<Sucursal[]> {
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
