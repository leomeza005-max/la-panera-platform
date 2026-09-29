import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';

import type {
  ResultSetHeader,
  RowDataPacket,
} from 'mysql2/promise';

import { DatabaseService } from '../../config/database.service';
import { ListarProductosQueryDto } from './dto/listar-productos-query.dto';

import type { CrearProductoDto } from './dto/crear-producto.dto';
import type { ActualizarProductoDto } from './dto/actualizar-producto.dto';

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


  
  // ==========================================
  // LISTAR TODOS LOS PRODUCTOS (ADMIN)
  // ==========================================

  async listarTodas(): Promise<any[]> {
    const pool = this.databaseService.getPool();

    const [rows] = await pool.execute<RowDataPacket[]>(`
      SELECT
        p.ProductoID AS productoId,
        p.CategoriaID AS categoriaId,
        c.NombreCategoria AS nombreCategoria,
        p.Descripcion AS descripcion,
        p.PrecioBase AS precioBase,
        p.Estado AS estado
      FROM Producto p
      INNER JOIN CategoriaProducto c
        ON c.CategoriaID = p.CategoriaID
      ORDER BY p.Descripcion ASC
    `);

    return rows;
  }

  // ==========================================
  // CREAR PRODUCTO (ADMIN)
  // ==========================================

  async crear(datos: CrearProductoDto) {
    const pool = this.databaseService.getPool();

    const productoId = randomUUID();

    await pool.execute<ResultSetHeader>(
      `
        INSERT INTO Producto (
          ProductoID,
          CategoriaID,
          Descripcion,
          PrecioBase,
          Estado
        )
        VALUES (?, ?, ?, ?, TRUE)
      `,
      [
        productoId,
        datos.categoriaId,
        datos.descripcion,
        datos.precioBase,
      ],
    );

    return this.buscarPorId(productoId);
  }

  // ==========================================
  // ACTUALIZAR PRODUCTO (ADMIN)
  // ==========================================

  async actualizar(
    productoId: string,
    datos: ActualizarProductoDto,
  ) {
    const pool = this.databaseService.getPool();

    const campos: string[] = [];
    const valores: Array<string | number | boolean> = [];

    // ACTUALIZAR CATEGORÍA
    if (datos.categoriaId !== undefined) {
      campos.push('CategoriaID = ?');
      valores.push(datos.categoriaId);
    }

    // ACTUALIZAR DESCRIPCIÓN
    if (datos.descripcion !== undefined) {
      campos.push('Descripcion = ?');
      valores.push(datos.descripcion);
    }

    // ACTUALIZAR PRECIO
    if (datos.precioBase !== undefined) {
      campos.push('PrecioBase = ?');
      valores.push(datos.precioBase);
    }

    // ACTIVAR / DESACTIVAR
    if (datos.estado !== undefined) {
      campos.push('Estado = ?');
      valores.push(datos.estado);
    }

    // SI NO EXISTEN CAMBIOS
    if (campos.length === 0) {
      return this.buscarPorId(productoId);
    }

    valores.push(productoId);

    const [resultado] =
      await pool.execute<ResultSetHeader>(
        `
          UPDATE Producto
          SET ${campos.join(', ')}
          WHERE ProductoID = ?
        `,
        valores,
      );

    if (resultado.affectedRows === 0) {
      return null;
    }

    return this.buscarPorId(productoId);
  }

}
