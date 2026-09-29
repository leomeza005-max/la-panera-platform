import { Injectable } from '@nestjs/common';
import type {
  ResultSetHeader,
  RowDataPacket,
} from 'mysql2/promise';
import { DatabaseService } from '../../config/database.service';
import type {
  DetallePedidoPublico,
  EstadoPedido,
} from './pedidos.repository';

export interface PedidoOperadorResumen {
  pedidoId: string;
  clienteId: string;
  clienteNombre: string;
  clienteCorreo: string;
  sucursalId: number;
  sucursalNombre: string;
  fechaHora: Date;
  estado: EstadoPedido;
  totalFinal: number;
}

export interface PedidoOperadorDetalle
  extends PedidoOperadorResumen {
  detalles: DetallePedidoPublico[];
}

interface PedidoOperadorRow extends RowDataPacket {
  pedidoId: string;
  clienteId: string;
  clienteNombre: string;
  clienteCorreo: string;
  sucursalId: number;
  sucursalNombre: string;
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
export class PedidosOperadorRepository {
  constructor(
    private readonly databaseService: DatabaseService,
  ) {}

  listarTodos(): Promise<PedidoOperadorResumen[]> {
    return this.listarInterno(null);
  }

  listarPorSucursal(
    sucursalId: number,
  ): Promise<PedidoOperadorResumen[]> {
    return this.listarInterno(sucursalId);
  }

  buscarPorId(
    pedidoId: string,
  ): Promise<PedidoOperadorDetalle | null> {
    return this.buscarPorIdInterno(pedidoId, null);
  }

  buscarPorIdYSucursal(
    pedidoId: string,
    sucursalId: number,
  ): Promise<PedidoOperadorDetalle | null> {
    return this.buscarPorIdInterno(
      pedidoId,
      sucursalId,
    );
  }

  async actualizarEstado(
    pedidoId: string,
    estadoActual: EstadoPedido,
    estadoNuevo: EstadoPedido,
    sucursalId: number | null,
  ): Promise<boolean> {
    const filtroSucursal =
      sucursalId === null
        ? ''
        : 'AND SucursalID = ?';

    const parametros: Array<string | number> = [
      estadoNuevo,
      pedidoId,
      estadoActual,
    ];

    if (sucursalId !== null) {
      parametros.push(sucursalId);
    }

    const [resultado] = await this.databaseService
      .getPool()
      .execute<ResultSetHeader>(
        `
          UPDATE Pedido
          SET Estado = ?
          WHERE PedidoID = ?
            AND Estado = ?
            ${filtroSucursal}
        `,
        parametros,
      );

    return resultado.affectedRows === 1;
  }

  private async listarInterno(
    sucursalId: number | null,
  ): Promise<PedidoOperadorResumen[]> {
    const filtroSucursal =
      sucursalId === null
        ? ''
        : 'WHERE p.SucursalID = ?';

    const parametros =
      sucursalId === null ? [] : [sucursalId];

    const [rows] = await this.databaseService
      .getPool()
      .execute<PedidoOperadorRow[]>(
        `
          SELECT
            p.PedidoID AS pedidoId,
            p.ClienteID AS clienteId,
            CONCAT_WS(
              ' ',
              c.Nombre,
              c.Apellido1,
              NULLIF(c.Apellido2, '')
            ) AS clienteNombre,
            c.Correo AS clienteCorreo,
            p.SucursalID AS sucursalId,
            s.Nombre AS sucursalNombre,
            p.FechaHora AS fechaHora,
            p.Estado AS estado,
            p.TotalFinal AS totalFinal
          FROM Pedido AS p
          INNER JOIN Cliente AS c
            ON c.ClienteID = p.ClienteID
          INNER JOIN Sucursal AS s
            ON s.SucursalID = p.SucursalID
          ${filtroSucursal}
          ORDER BY p.FechaHora DESC
        `,
        parametros,
      );

    return rows.map((pedido) =>
      this.convertirPedido(pedido),
    );
  }

  private async buscarPorIdInterno(
    pedidoId: string,
    sucursalId: number | null,
  ): Promise<PedidoOperadorDetalle | null> {
    const filtroSucursal =
      sucursalId === null
        ? ''
        : 'AND p.SucursalID = ?';

    const parametros: Array<string | number> = [
      pedidoId,
    ];

    if (sucursalId !== null) {
      parametros.push(sucursalId);
    }

    const [pedidos] = await this.databaseService
      .getPool()
      .execute<PedidoOperadorRow[]>(
        `
          SELECT
            p.PedidoID AS pedidoId,
            p.ClienteID AS clienteId,
            CONCAT_WS(
              ' ',
              c.Nombre,
              c.Apellido1,
              NULLIF(c.Apellido2, '')
            ) AS clienteNombre,
            c.Correo AS clienteCorreo,
            p.SucursalID AS sucursalId,
            s.Nombre AS sucursalNombre,
            p.FechaHora AS fechaHora,
            p.Estado AS estado,
            p.TotalFinal AS totalFinal
          FROM Pedido AS p
          INNER JOIN Cliente AS c
            ON c.ClienteID = p.ClienteID
          INNER JOIN Sucursal AS s
            ON s.SucursalID = p.SucursalID
          WHERE p.PedidoID = ?
            ${filtroSucursal}
          LIMIT 1
        `,
        parametros,
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
    pedido: PedidoOperadorRow,
  ): PedidoOperadorResumen {
    return {
      pedidoId: pedido.pedidoId,
      clienteId: pedido.clienteId,
      clienteNombre: pedido.clienteNombre,
      clienteCorreo: pedido.clienteCorreo,
      sucursalId: pedido.sucursalId,
      sucursalNombre: pedido.sucursalNombre,
      fechaHora: pedido.fechaHora,
      estado: pedido.estado,
      totalFinal: Number(pedido.totalFinal),
    };
  }
}