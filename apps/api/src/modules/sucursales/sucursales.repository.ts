import { Injectable } from '@nestjs/common';
import type { RowDataPacket } from 'mysql2/promise';
import { DatabaseService } from '../../config/database.service';

export interface Sucursal {
  sucursalId: number;
  nombre: string;
  direccion: string | null;
}

interface SucursalRow extends RowDataPacket {
  sucursalId: number;
  nombre: string;
  direccion: string | null;
}

@Injectable()
export class SucursalesRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async listar(): Promise<Sucursal[]> {
    const [rows] = await this.databaseService
      .getPool()
      .execute<SucursalRow[]>(
        `
          SELECT
            SucursalID AS sucursalId,
            Nombre AS nombre,
            Direccion AS direccion
          FROM Sucursal
          ORDER BY Nombre ASC, SucursalID ASC
        `,
      );

    return rows.map((sucursal) => this.convertirSucursal(sucursal));
  }

  async buscarPorId(sucursalId: number): Promise<Sucursal | null> {
    const [rows] = await this.databaseService
      .getPool()
      .execute<SucursalRow[]>(
        `
          SELECT
            SucursalID AS sucursalId,
            Nombre AS nombre,
            Direccion AS direccion
          FROM Sucursal
          WHERE SucursalID = ?
          LIMIT 1
        `,
        [sucursalId],
      );

    return rows[0] ? this.convertirSucursal(rows[0]) : null;
  }

  private convertirSucursal(sucursal: SucursalRow): Sucursal {
    return {
      sucursalId: sucursal.sucursalId,
      nombre: sucursal.nombre,
      direccion: sucursal.direccion,
    };
  }
}
