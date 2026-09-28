import { Injectable, NotFoundException } from '@nestjs/common';
import { OperadoresRepository } from './operadores.repository';
import type {
  OperadorConHash,
  OperadorPublico,
} from './operadores.repository';

@Injectable()
export class OperadoresService {
  constructor(
    private readonly operadoresRepository: OperadoresRepository,
  ) {}

  buscarPorCorreo(correo: string): Promise<OperadorConHash | null> {
    return this.operadoresRepository.buscarPorCorreo(correo);
  }

  async obtenerPorId(operadorId: string): Promise<OperadorPublico> {
    const operador =
      await this.operadoresRepository.buscarPorId(operadorId);

    if (!operador) {
      throw new NotFoundException('Operador no encontrado');
    }

    return operador;
  }
}
