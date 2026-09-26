import { Injectable } from '@nestjs/common';
import type { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { DatabaseService } from '../../config/database.service';

export interface ClientePublico {
  clienteId: string;
  nombre: string;
  apellido1: string;
  apellido2: string | null;
  correo: string;
  numeroTelefonico: string | null;
}

export interface ClienteConHash extends ClientePublico {
  contrasenaHash: string;
}

export interface CrearClienteData {
  clienteId: string;
  nombre: string;
  apellido1: string;
  apellido2: string | null;
  correo: string;
  numeroTelefonico: string | null;
  contrasenaHash: string;
}

interface ClienteRow extends RowDataPacket {
  clienteId: string;
  nombre: string;
  apellido1: string;
  apellido2: string | null;
  correo: string;
  numeroTelefonico: string | null;
  contrasenaHash?: string;
}

@Injectable()
export class ClientesRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async buscarPorCorreo(correo: string): Promise<ClienteConHash | null> {
    const [rows] = await this.databaseService
      .getPool()
      .execute<ClienteRow[]>(
        `
          SELECT
            ClienteID AS clienteId,
            Nombre AS nombre,
            Apellido1 AS apellido1,
            Apellido2 AS apellido2,
            Correo AS correo,
            NumeroTelefonico AS numeroTelefonico,
            ContrasenaHash AS contrasenaHash
          FROM Cliente
          WHERE Correo = ?
          LIMIT 1
        `,
        [correo],
      );

    const cliente = rows[0];

    if (!cliente || !cliente.contrasenaHash) {
      return null;
    }

    return {
      ...this.convertirAPublico(cliente),
      contrasenaHash: cliente.contrasenaHash,
    };
  }

  async buscarPorId(clienteId: string): Promise<ClientePublico | null> {
    const [rows] = await this.databaseService
      .getPool()
      .execute<ClienteRow[]>(
        `
          SELECT
            ClienteID AS clienteId,
            Nombre AS nombre,
            Apellido1 AS apellido1,
            Apellido2 AS apellido2,
            Correo AS correo,
            NumeroTelefonico AS numeroTelefonico
          FROM Cliente
          WHERE ClienteID = ?
          LIMIT 1
        `,
        [clienteId],
      );

    return rows[0] ? this.convertirAPublico(rows[0]) : null;
  }

  async crear(datos: CrearClienteData): Promise<ClientePublico> {
    const [resultado] = await this.databaseService
      .getPool()
      .execute<ResultSetHeader>(
        `
          INSERT INTO Cliente (
            ClienteID,
            Nombre,
            Apellido1,
            Apellido2,
            Correo,
            NumeroTelefonico,
            ContrasenaHash
          )
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
        [
          datos.clienteId,
          datos.nombre,
          datos.apellido1,
          datos.apellido2,
          datos.correo,
          datos.numeroTelefonico,
          datos.contrasenaHash,
        ],
      );

    if (resultado.affectedRows !== 1) {
      throw new Error('No se pudo registrar al cliente');
    }

    const cliente = await this.buscarPorId(datos.clienteId);

    if (!cliente) {
      throw new Error('No se pudo recuperar al cliente registrado');
    }

    return cliente;
  }

  private convertirAPublico(cliente: ClienteRow): ClientePublico {
    return {
      clienteId: cliente.clienteId,
      nombre: cliente.nombre,
      apellido1: cliente.apellido1,
      apellido2: cliente.apellido2,
      correo: cliente.correo,
      numeroTelefonico: cliente.numeroTelefonico,
    };
  }
}