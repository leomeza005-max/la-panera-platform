import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../config/database.service';
import { RowDataPacket } from 'mysql2';
import { ListarProductosQueryDto } from './dto/listar-productos-query.dto';

@Injectable()
export class ProductosRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async listar(filtros: ListarProductosQueryDto): Promise<any[]> {
    const pool = this.databaseService.getPool();
    let query = `
      SELECT 
        ProductoID AS productoId, 
        CategoriaID AS categoriaId, 
        Descripcion AS descripcion, 
        PrecioBase AS precioBase, 
        Estado AS estado 
      FROM Producto 
      WHERE 1=1
    `;
    const params: any[] = [];

    if (filtros.categoriaId) {
      query += ' AND CategoriaID = ?';
      params.push(filtros.categoriaId);
    }

    if (filtros.estado) {
      query += ' AND Estado = ?';
      params.push(filtros.estado === 'true' ? 1 : 0);
    }

    const [rows] = await pool.query<RowDataPacket[]>(query, params);
    return rows;
  }

  async buscarPorId(productoId: string): Promise<any | null> {
    const pool = this.databaseService.getPool();
    const [rows] = await pool.query<RowDataPacket[]>(`
      SELECT 
        ProductoID AS productoId, 
        CategoriaID AS categoriaId, 
        Descripcion AS descripcion, 
        PrecioBase AS precioBase, 
        Estado AS estado 
      FROM Producto 
      WHERE ProductoID = ?
    `, [productoId]);
    
    return rows.length > 0 ? rows[0] : null;
  }
}