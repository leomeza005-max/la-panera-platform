
import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../config/database.service';
import type { RowDataPacket } from 'mysql2/promise';

export interface OperadorPublico {
  operadorId: number;
  sucursalId: number;
  nombre: string;
  apellido1: string;
  apellido2: string;
  correo: string;
  rol: string;
}

export interface OperadorConHash extends OperadorPublico {
  contrasenaHash: string;
}

interface OperadorRow extends RowDataPacket {
  operadorId: number;
  sucursalId: number;
  nombre: string;
  apellido1: string;
  apellido2: string;
  correo: string;
  rol: string;
  contrasenaHash?: string;
}

@Injectable()
export class OperadoresRepository {
  constructor(
    private readonly databaseService: DatabaseService,
  ) {}

  async buscarPorCorreo(
    correo: string,
  ): Promise<OperadorConHash | null> {
    const correoNormalizado = correo.trim().toLowerCase();

    const [rows] =
      await this.databaseService.getPool().query<OperadorRow[]>(
        `SELECT
          OperadorID AS operadorId,
          SucursalID AS sucursalId,
          Nombre AS nombre,
          Apellido1 AS apellido1,
          Apellido2 AS apellido2,
          Correo AS correo,
          ContrasenaHash AS contrasenaHash,
          ROL AS rol
        FROM Operador
        WHERE Correo = ?`,
        [correoNormalizado],
      );

    return (rows[0] as OperadorConHash) ?? null;
  }

  async buscarPorId(
    operadorId: number,
  ): Promise<OperadorPublico | null> {
    const [rows] =
      await this.databaseService.getPool().query<OperadorRow[]>(
        `SELECT
          OperadorID AS operadorId,
          SucursalID AS sucursalId,
          Nombre AS nombre,
          Apellido1 AS apellido1,
          Apellido2 AS apellido2,
          Correo AS correo,
          ROL AS rol
        FROM Operador
        WHERE OperadorID = ?`,
        [operadorId],
      );

    return (rows[0] as OperadorPublico) ?? null;
  }
}