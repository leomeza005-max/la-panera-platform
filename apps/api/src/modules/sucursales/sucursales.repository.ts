import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../config/database.service';
import type { RowDataPacket } from 'mysql2/promise';

export interface Sucursal {
  sucursalId: number;
  nombre: string;
  direccion: string;
}

interface SucursalRow extends RowDataPacket {
  sucursalId: number;
  nombre: string;
  direccion: string;
}

@Injectable()
export class SucursalesRepository {
  constructor(
    private readonly databaseService: DatabaseService,
  ) {}

  async listar(): Promise<Sucursal[]> {
    const [rows] = await this.databaseService
      .getPool()
      .query<SucursalRow[]>(`
        SELECT
          SucursalID AS sucursalId,
          Nombre AS nombre,
          Direccion AS direccion
        FROM Sucursal
      `);

    return rows;
  }

  async buscarPorId(
    sucursalId: number,
  ): Promise<Sucursal | null> {
    const [rows] = await this.databaseService
      .getPool()
      .query<SucursalRow[]>(
        `
          SELECT
            SucursalID AS sucursalId,
            Nombre AS nombre,
            Direccion AS direccion
          FROM Sucursal
          WHERE SucursalID = ?
        `,
        [sucursalId],
      );

    return rows[0] ?? null;
  }
}