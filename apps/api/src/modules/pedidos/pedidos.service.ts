import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { CrearPedidoDto } from './dto/crear-pedido.dto';
import {
  CrearDetallePedidoData,
  PedidoConDetalles,
  PedidoPublico,
  PedidosRepository,
  ProductoParaPedido,
} from './pedidos.repository';

const MAXIMO_TOTAL_CENTAVOS = 9_999_999_999;

@Injectable()
export class PedidosService {
  constructor(
    private readonly pedidosRepository: PedidosRepository,
  ) {}

  async crear(
    clienteId: string,
    dto: CrearPedidoDto,
  ): Promise<PedidoConDetalles> {
    const sucursalExiste =
      await this.pedidosRepository.sucursalExiste(
        dto.sucursalId,
      );

    if (!sucursalExiste) {
      throw new NotFoundException(
        'Sucursal no encontrada',
      );
    }

    const cantidadesPorProducto =
      this.agruparProductos(dto);

    const productoIds = [
      ...cantidadesPorProducto.keys(),
    ];

    const productos =
      await this.pedidosRepository.buscarProductosPorIds(
        productoIds,
      );

    this.validarProductos(
      productoIds,
      productos,
    );

    let totalCentavos = 0;

    const detalles: CrearDetallePedidoData[] =
      productos.map((producto) => {
        const cantidad = cantidadesPorProducto.get(
          producto.productoId,
        );

        if (!cantidad) {
          throw new BadRequestException(
            'Cantidad de producto inválida',
          );
        }

        const precioCentavos =
          this.convertirACentavos(
            producto.precioBase,
          );

        const subtotalCentavos =
          precioCentavos * cantidad;

        if (
          !Number.isSafeInteger(subtotalCentavos)
        ) {
          throw new BadRequestException(
            'La cantidad solicitada excede el límite permitido',
          );
        }

        if (
          subtotalCentavos >
          MAXIMO_TOTAL_CENTAVOS - totalCentavos
        ) {
          throw new BadRequestException(
            'El total del pedido excede el límite permitido',
          );
        }

        totalCentavos += subtotalCentavos;

        return {
          detalleId: randomUUID(),
          productoId: producto.productoId,
          cantidad,
          precioUnitario:
            this.convertirADecimal(
              precioCentavos,
            ),
          descuentoAplicado: '0.00',
        };
      });

    const pedidoId = randomUUID();

    await this.pedidosRepository.crearConDetalles({
      pedidoId,
      clienteId,
      sucursalId: dto.sucursalId,
      estado: 'PENDIENTE',
      totalFinal:
        this.convertirADecimal(totalCentavos),
      detalles,
    });

    return this.obtenerDelCliente(
      pedidoId,
      clienteId,
    );
  }

  listarDelCliente(
    clienteId: string,
  ): Promise<PedidoPublico[]> {
    return this.pedidosRepository.listarPorCliente(
      clienteId,
    );
  }

  async obtenerDelCliente(
    pedidoId: string,
    clienteId: string,
  ): Promise<PedidoConDetalles> {
    const pedido =
      await this.pedidosRepository.buscarPorIdYCliente(
        pedidoId,
        clienteId,
      );

    if (!pedido) {
      throw new NotFoundException(
        'Pedido no encontrado',
      );
    }

    return pedido;
  }

  private agruparProductos(
    dto: CrearPedidoDto,
  ): Map<string, number> {
    const cantidadesPorProducto =
      new Map<string, number>();

    for (const producto of dto.productos) {
      const cantidadActual =
        cantidadesPorProducto.get(
          producto.productoId,
        ) ?? 0;

      const cantidadAcumulada =
        cantidadActual + producto.cantidad;

      if (
        !Number.isSafeInteger(
          cantidadAcumulada,
        )
      ) {
        throw new BadRequestException(
          'La cantidad solicitada excede el límite permitido',
        );
      }

      cantidadesPorProducto.set(
        producto.productoId,
        cantidadAcumulada,
      );
    }

    return cantidadesPorProducto;
  }

  private validarProductos(
    productoIds: string[],
    productos: ProductoParaPedido[],
  ): void {
    const productosPorId = new Map(
      productos.map((producto) => [
        producto.productoId,
        producto,
      ]),
    );

    for (const productoId of productoIds) {
      const producto =
        productosPorId.get(productoId);

      if (!producto) {
        throw new NotFoundException(
          `Producto no encontrado: ${productoId}`,
        );
      }

      if (!producto.estado) {
        throw new BadRequestException(
          `El producto ${productoId} no está disponible`,
        );
      }
    }
  }

  private convertirACentavos(
    precio: string,
  ): number {
    const precioNumerico = Number(precio);

    if (
      !Number.isFinite(precioNumerico) ||
      precioNumerico < 0
    ) {
      throw new BadRequestException(
        'El producto tiene un precio inválido',
      );
    }

    return Math.round(precioNumerico * 100);
  }

  private convertirADecimal(
    centavos: number,
  ): string {
    return (centavos / 100).toFixed(2);
  }
}