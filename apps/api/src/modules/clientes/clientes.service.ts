import { Injectable, NotFoundException } from '@nestjs/common';
import {
  ClienteConHash,
  ClientePublico,
  ClientesRepository,
  CrearClienteData,
} from './clientes.repository';

@Injectable()
export class ClientesService {
  constructor(private readonly clientesRepository: ClientesRepository) {}

  buscarPorCorreo(correo: string): Promise<ClienteConHash | null> {
    return this.clientesRepository.buscarPorCorreo(correo);
  }

  crear(datos: CrearClienteData): Promise<ClientePublico> {
    return this.clientesRepository.crear(datos);
  }

  async obtenerPorId(clienteId: string): Promise<ClientePublico> {
    const cliente = await this.clientesRepository.buscarPorId(clienteId);

    if (!cliente) {
      throw new NotFoundException('Cliente no encontrado');
    }

    return cliente;
  }
}