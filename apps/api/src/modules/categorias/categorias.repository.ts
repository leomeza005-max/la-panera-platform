import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../config/database.service';
import { RowDataPacket } from 'mysql2';

@Injectable()
export class CategoriasRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async listar(): Promise<any[]> {
    const pool = this.databaseService.getPool();
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT CategoriaID AS categoriaId, NombreCategoria AS nombreCategoria FROM CategoriaProducto'
    );
    return rows;
  }

  async buscarPorId(categoriaId: number): Promise<any | null> {
    const pool = this.databaseService.getPool();
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT CategoriaID AS categoriaId, NombreCategoria AS nombreCategoria FROM CategoriaProducto WHERE CategoriaID = ?',
      [categoriaId]
    );
    return rows.length > 0 ? rows[0] : null;
  }
}