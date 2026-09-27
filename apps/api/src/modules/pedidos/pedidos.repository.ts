/*Este repository:
- Verifica que exista la sucursal.
- Consulta productos y precios.
- Inserta pedido y detalles.
- Ejecuta commit si todo funciona.
- Ejecuta rollback si ocurre un error.
- Consulta únicamente pedidos pertenecientes al cliente.*/

import { Injectable } from '@nestjs/common';
import type {
  ResultSetHeader,
  RowDataPacket,
} from 'mysql2/promise';
import { DatabaseService } from '../../config/database.service';

export type EstadoPedido =
  | 'PENDIENTE'
  | 'PREPARANDO'
  | 'LISTO_PICKUP'
  | 'ENTREGADO'
  | 'CANCELADO';

export interface PedidoPublico {
  pedidoId: string;
  sucursalId: number;
  fechaHora: Date;
  estado: EstadoPedido;
  totalFinal: number;
}

export interface DetallePedidoPublico {
  detalleId: string;
  productoId: string;
  productoDescripcion: string;
  cantidad: number;
  precioUnitario: number;
  descuentoAplicado: number;
}

export interface PedidoConDetalles extends PedidoPublico {
  detalles: DetallePedidoPublico[];
}

export interface ProductoParaPedido {
  productoId: string;
  descripcion: string;
  precioBase: string;
  estado: boolean;
}

export interface CrearDetallePedidoData {
  detalleId: string;
  productoId: string;
  cantidad: number;
  precioUnitario: string;
  descuentoAplicado: string;
}

export interface CrearPedidoData {
  pedidoId: string;
  clienteId: string;
  sucursalId: number;
  estado: EstadoPedido;
  totalFinal: string;
  detalles: CrearDetallePedidoData[];
}

interface ExisteRow extends RowDataPacket {
  existe: number;
}

interface ProductoParaPedidoRow extends RowDataPacket {
  productoId: string;
  descripcion: string;
  precioBase: string;
  estado: number;
}

interface PedidoRow extends RowDataPacket {
  pedidoId: string;
  sucursalId: number;
  fechaHora: Date;
  estado: EstadoPedido;
  totalFinal: string;
}

interface DetallePedidoRow extends RowDataPacket {
  detalleId: string;
  productoId: string;
  productoDescripcion: string;
  cantidad: number;
  precioUnitario: string;
  descuentoAplicado: string;
}

@Injectable()
export class PedidosRepository {
  constructor(
    private readonly databaseService: DatabaseService,
  ) {}

  async sucursalExiste(sucursalId: number): Promise<boolean> {
    const [rows] = await this.databaseService
      .getPool()
      .execute<ExisteRow[]>(
        `
          SELECT 1 AS existe
          FROM Sucursal
          WHERE SucursalID = ?
          LIMIT 1
        `,
        [sucursalId],
      );

    return Boolean(rows[0]?.existe);
  }

  async buscarProductosPorIds(
    productoIds: string[],
  ): Promise<ProductoParaPedido[]> {
    const idsUnicos = [...new Set(productoIds)];

    if (idsUnicos.length === 0) {
      return [];
    }

    const marcadores = idsUnicos
      .map(() => '?')
      .join(', ');

    const [rows] = await this.databaseService
      .getPool()
      .execute<ProductoParaPedidoRow[]>(
        `
          SELECT
            ProductoID AS productoId,
            Descripcion AS descripcion,
            PrecioBase AS precioBase,
            Estado AS estado
          FROM Producto
          WHERE ProductoID IN (${marcadores})
        `,
        idsUnicos,
      );

    return rows.map((producto) => ({
      productoId: producto.productoId,
      descripcion: producto.descripcion,
      precioBase: producto.precioBase,
      estado: Boolean(producto.estado),
    }));
  }

  async crearConDetalles(
    datos: CrearPedidoData,
  ): Promise<void> {
    const connection = await this.databaseService
      .getPool()
      .getConnection();

    try {
      await connection.beginTransaction();

      const [resultadoPedido] =
        await connection.execute<ResultSetHeader>(
          `
            INSERT INTO Pedido (
              PedidoID,
              ClienteID,
              SucursalID,
              Estado,
              TotalFinal
            )
            VALUES (?, ?, ?, ?, ?)
          `,
          [
            datos.pedidoId,
            datos.clienteId,
            datos.sucursalId,
            datos.estado,
            datos.totalFinal,
          ],
        );

      if (resultadoPedido.affectedRows !== 1) {
        throw new Error('No se pudo crear el pedido');
      }

      for (const detalle of datos.detalles) {
        const [resultadoDetalle] =
          await connection.execute<ResultSetHeader>(
            `
              INSERT INTO DetallePedido (
                DetalleID,
                PedidoID,
                ProductoID,
                Cantidad,
                PrecioUnitario,
                DescuentoAplicado
              )
              VALUES (?, ?, ?, ?, ?, ?)
            `,
            [
              detalle.detalleId,
              datos.pedidoId,
              detalle.productoId,
              detalle.cantidad,
              detalle.precioUnitario,
              detalle.descuentoAplicado,
            ],
          );

        if (resultadoDetalle.affectedRows !== 1) {
          throw new Error(
            'No se pudo crear un detalle del pedido',
          );
        }
      }

      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async listarPorCliente(
    clienteId: string,
  ): Promise<PedidoPublico[]> {
    const [rows] = await this.databaseService
      .getPool()
      .execute<PedidoRow[]>(
        `
          SELECT
            PedidoID AS pedidoId,
            SucursalID AS sucursalId,
            FechaHora AS fechaHora,
            Estado AS estado,
            TotalFinal AS totalFinal
          FROM Pedido
          WHERE ClienteID = ?
          ORDER BY FechaHora DESC
        `,
        [clienteId],
      );

    return rows.map((pedido) =>
      this.convertirPedido(pedido),
    );
  }

  async buscarPorIdYCliente(
    pedidoId: string,
    clienteId: string,
  ): Promise<PedidoConDetalles | null> {
    const [pedidos] = await this.databaseService
      .getPool()
      .execute<PedidoRow[]>(
        `
          SELECT
            PedidoID AS pedidoId,
            SucursalID AS sucursalId,
            FechaHora AS fechaHora,
            Estado AS estado,
            TotalFinal AS totalFinal
          FROM Pedido
          WHERE PedidoID = ?
            AND ClienteID = ?
          LIMIT 1
        `,
        [pedidoId, clienteId],
      );

    const pedido = pedidos[0];

    if (!pedido) {
      return null;
    }

    const [detalles] = await this.databaseService
      .getPool()
      .execute<DetallePedidoRow[]>(
        `
          SELECT
            dp.DetalleID AS detalleId,
            dp.ProductoID AS productoId,
            p.Descripcion AS productoDescripcion,
            dp.Cantidad AS cantidad,
            dp.PrecioUnitario AS precioUnitario,
            dp.DescuentoAplicado AS descuentoAplicado
          FROM DetallePedido AS dp
          INNER JOIN Producto AS p
            ON p.ProductoID = dp.ProductoID
          WHERE dp.PedidoID = ?
          ORDER BY dp.DetalleID
        `,
        [pedidoId],
      );

    return {
      ...this.convertirPedido(pedido),

      detalles: detalles.map((detalle) => ({
        detalleId: detalle.detalleId,
        productoId: detalle.productoId,
        productoDescripcion:
          detalle.productoDescripcion,
        cantidad: detalle.cantidad,
        precioUnitario: Number(
          detalle.precioUnitario,
        ),
        descuentoAplicado: Number(
          detalle.descuentoAplicado,
        ),
      })),
    };
  }

  private convertirPedido(
    pedido: PedidoRow,
  ): PedidoPublico {
    return {
      pedidoId: pedido.pedidoId,
      sucursalId: pedido.sucursalId,
      fechaHora: pedido.fechaHora,
      estado: pedido.estado,
      totalFinal: Number(pedido.totalFinal),
    };
  }
}