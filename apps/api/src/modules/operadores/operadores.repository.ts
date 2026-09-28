import { Injectable } from '@nestjs/common';
import type { RowDataPacket } from 'mysql2/promise';
import { DatabaseService } from '../../config/database.service';

export type RolOperador = 'CAJERO' | 'ADMIN';

export interface OperadorPublico {
  operadorId: string;
  sucursalId: number;
  nombre: string;
  apellido1: string;
  apellido2: string | null;
  correo: string;
  rol: RolOperador;
}

export interface OperadorConHash extends OperadorPublico {
  contrasenaHash: string;
}

interface OperadorRow extends RowDataPacket {
  operadorId: string;
  sucursalId: number;
  nombre: string;
  apellido1: string;
  apellido2: string | null;
  correo: string;
  rol: RolOperador;
  contrasenaHash?: string;
}

@Injectable()
export class OperadoresRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async buscarPorCorreo(correo: string): Promise<OperadorConHash | null> {
    const correoNormalizado = correo.trim().toLowerCase();

    const [rows] = await this.databaseService
      .getPool()
      .execute<OperadorRow[]>(
        `
          SELECT
            OperadorID AS operadorId,
            SucursalID AS sucursalId,
            Nombre AS nombre,
            Apellido1 AS apellido1,
            Apellido2 AS apellido2,
            Correo AS correo,
            ContrasenaHash AS contrasenaHash,
            ROL AS rol
          FROM Operador
          WHERE Correo = ?
          LIMIT 1
        `,
        [correoNormalizado],
      );

    const operador = rows[0];

    if (!operador || !operador.contrasenaHash) {
      return null;
    }

    return {
      ...this.convertirAPublico(operador),
      contrasenaHash: operador.contrasenaHash,
    };
  }

  async buscarPorId(operadorId: string): Promise<OperadorPublico | null> {
    const [rows] = await this.databaseService
      .getPool()
      .execute<OperadorRow[]>(
        `
          SELECT
            OperadorID AS operadorId,
            SucursalID AS sucursalId,
            Nombre AS nombre,
            Apellido1 AS apellido1,
            Apellido2 AS apellido2,
            Correo AS correo,
            ROL AS rol
          FROM Operador
          WHERE OperadorID = ?
          LIMIT 1
        `,
        [operadorId],
      );

    return rows[0] ? this.convertirAPublico(rows[0]) : null;
  }

  private convertirAPublico(operador: OperadorRow): OperadorPublico {
    return {
      operadorId: operador.operadorId,
      sucursalId: operador.sucursalId,
      nombre: operador.nombre,
      apellido1: operador.apellido1,
      apellido2: operador.apellido2,
      correo: operador.correo,
      rol: operador.rol,
    };
  }
}
