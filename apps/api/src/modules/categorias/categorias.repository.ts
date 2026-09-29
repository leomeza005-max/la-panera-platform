import { Injectable } from '@nestjs/common';
import type {
  ResultSetHeader,
  RowDataPacket,
} from 'mysql2/promise';
import { DatabaseService } from '../../config/database.service';

export interface Categoria {
  categoriaId: number;
  nombreCategoria: string;
  estado: boolean;
}

interface CategoriaRow extends RowDataPacket {
  categoriaId: number;
  nombreCategoria: string;
  estado: boolean | number;
}

interface ActualizarCategoriaData {
  nombreCategoria?: string;
  estado?: boolean;
}

@Injectable()
export class CategoriasRepository {
  constructor(
    private readonly databaseService: DatabaseService,
  ) {}

  async listar(): Promise<Categoria[]> {
    const [rows] = await this.databaseService
      .getPool()
      .execute<CategoriaRow[]>(
        `
          SELECT
            CategoriaID AS categoriaId,
            NombreCategoria AS nombreCategoria,
            Estado AS estado
          FROM CategoriaProducto
          WHERE Estado = TRUE
          ORDER BY NombreCategoria ASC
        `,
      );

    return rows.map((categoria) =>
      this.convertirCategoria(categoria),
    );
  }

  async listarTodas(): Promise<Categoria[]> {
    const [rows] = await this.databaseService
      .getPool()
      .execute<CategoriaRow[]>(
        `
          SELECT
            CategoriaID AS categoriaId,
            NombreCategoria AS nombreCategoria,
            Estado AS estado
          FROM CategoriaProducto
          ORDER BY NombreCategoria ASC
        `,
      );

    return rows.map((categoria) =>
      this.convertirCategoria(categoria),
    );
  }

  async buscarPorId(
    categoriaId: number,
    incluirInactivas = false,
  ): Promise<Categoria | null> {
    const condicionEstado = incluirInactivas
      ? ''
      : 'AND Estado = TRUE';

    const [rows] = await this.databaseService
      .getPool()
      .execute<CategoriaRow[]>(
        `
          SELECT
            CategoriaID AS categoriaId,
            NombreCategoria AS nombreCategoria,
            Estado AS estado
          FROM CategoriaProducto
          WHERE CategoriaID = ?
          ${condicionEstado}
          LIMIT 1
        `,
        [categoriaId],
      );

    return rows[0]
      ? this.convertirCategoria(rows[0])
      : null;
  }

  async buscarPorNombre(
    nombreCategoria: string,
    excluirCategoriaId?: number,
  ): Promise<Categoria | null> {
    const valores: Array<string | number> = [nombreCategoria];

    let condicionExclusion = '';

    if (excluirCategoriaId !== undefined) {
      condicionExclusion = 'AND CategoriaID <> ?';
      valores.push(excluirCategoriaId);
    }

    const [rows] = await this.databaseService
      .getPool()
      .execute<CategoriaRow[]>(
        `
          SELECT
            CategoriaID AS categoriaId,
            NombreCategoria AS nombreCategoria,
            Estado AS estado
          FROM CategoriaProducto
          WHERE NombreCategoria = ?
          ${condicionExclusion}
          LIMIT 1
        `,
        valores,
      );

    return rows[0]
      ? this.convertirCategoria(rows[0])
      : null;
  }

  async crear(nombreCategoria: string): Promise<Categoria> {
    const [resultado] = await this.databaseService
      .getPool()
      .execute<ResultSetHeader>(
        `
          INSERT INTO CategoriaProducto (
            NombreCategoria,
            Estado
          )
          VALUES (?, TRUE)
        `,
        [nombreCategoria],
      );

    const categoria = await this.buscarPorId(
      resultado.insertId,
      true,
    );

    if (!categoria) {
      throw new Error(
        'No se pudo recuperar la categoría registrada',
      );
    }

    return categoria;
  }

  async actualizar(
    categoriaId: number,
    datos: ActualizarCategoriaData,
  ): Promise<Categoria | null> {
    const campos: string[] = [];
    const valores: Array<string | number | boolean> = [];

    if (datos.nombreCategoria !== undefined) {
      campos.push('NombreCategoria = ?');
      valores.push(datos.nombreCategoria);
    }

    if (datos.estado !== undefined) {
      campos.push('Estado = ?');
      valores.push(datos.estado);
    }

    if (campos.length === 0) {
      return this.buscarPorId(categoriaId, true);
    }

    valores.push(categoriaId);

    const [resultado] = await this.databaseService
      .getPool()
      .execute<ResultSetHeader>(
        `
          UPDATE CategoriaProducto
          SET ${campos.join(', ')}
          WHERE CategoriaID = ?
        `,
        valores,
      );

    if (resultado.affectedRows !== 1) {
      return null;
    }

    return this.buscarPorId(categoriaId, true);
  }

  private convertirCategoria(
    categoria: CategoriaRow,
  ): Categoria {
    return {
      categoriaId: categoria.categoriaId,
      nombreCategoria: categoria.nombreCategoria,
      estado: Boolean(categoria.estado),
    };
  }
}