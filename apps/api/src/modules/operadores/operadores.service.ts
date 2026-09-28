
import { Injectable, NotFoundException } from '@nestjs/common';

import {
  OperadoresRepository,
  OperadorPublico,
  OperadorConHash,
} from './operadores.repository';

@Injectable()
export class OperadoresService {
  constructor(
    private readonly operadoresRepository: OperadoresRepository,
  ) {}

  async buscarPorCorreo(
    correo: string,
  ): Promise<OperadorConHash | null> {
    return this.operadoresRepository.buscarPorCorreo(correo);
  }

  async obtenerPorId(
    operadorId: number,
  ): Promise<OperadorPublico> {
    const operador =
      await this.operadoresRepository.buscarPorId(operadorId);

    if (!operador) {
      throw new NotFoundException('Operador no encontrado');
    }

    return operador;
  }
}