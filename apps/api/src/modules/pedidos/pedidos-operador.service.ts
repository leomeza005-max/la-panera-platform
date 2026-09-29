import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { UsuarioOperadorAutenticado } from '../auth/interfaces/operador-jwt-payload.interface';
import {
  ActualizarEstadoPedidoDto,
} from './dto/actualizar-estado-pedido.dto';
import {
  PedidoOperadorDetalle,
  PedidoOperadorResumen,
  PedidosOperadorRepository,
} from './pedidos-operador.repository';
import type { EstadoPedido } from './pedidos.repository';

const TRANSICIONES_PERMITIDAS: Record<
  EstadoPedido,
  readonly EstadoPedido[]
> = {
  PENDIENTE: ['PREPARANDO', 'CANCELADO'],
  PREPARANDO: ['LISTO_PICKUP'],
  LISTO_PICKUP: ['ENTREGADO'],
  ENTREGADO: [],
  CANCELADO: [],
};

@Injectable()
export class PedidosOperadorService {
  constructor(
    private readonly repository:
      PedidosOperadorRepository,
  ) {}

  listar(
    operador: UsuarioOperadorAutenticado,
  ): Promise<PedidoOperadorResumen[]> {
    if (operador.rol === 'ADMIN') {
      return this.repository.listarTodos();
    }

    return this.repository.listarPorSucursal(
      operador.sucursalId,
    );
  }

  async obtener(
    pedidoId: string,
    operador: UsuarioOperadorAutenticado,
  ): Promise<PedidoOperadorDetalle> {
    const pedido =
      operador.rol === 'ADMIN'
        ? await this.repository.buscarPorId(pedidoId)
        : await this.repository.buscarPorIdYSucursal(
            pedidoId,
            operador.sucursalId,
          );

    if (!pedido) {
      throw new NotFoundException(
        'Pedido no encontrado',
      );
    }

    return pedido;
  }

  async actualizarEstado(
    pedidoId: string,
    dto: ActualizarEstadoPedidoDto,
    operador: UsuarioOperadorAutenticado,
  ): Promise<PedidoOperadorDetalle> {
    const pedido = await this.obtener(
      pedidoId,
      operador,
    );

    const estadoNuevo =
      dto.estado as EstadoPedido;

    const estadosPermitidos =
      TRANSICIONES_PERMITIDAS[pedido.estado];

    if (!estadosPermitidos.includes(estadoNuevo)) {
      throw new BadRequestException(
        `No se puede cambiar el pedido de ${pedido.estado} a ${estadoNuevo}`,
      );
    }

    const sucursalId =
      operador.rol === 'ADMIN'
        ? null
        : operador.sucursalId;

    const actualizado =
      await this.repository.actualizarEstado(
        pedidoId,
        pedido.estado,
        estadoNuevo,
        sucursalId,
      );

    if (!actualizado) {
      throw new ConflictException(
        'El pedido fue modificado por otro usuario. Actualiza la información e intenta nuevamente',
      );
    }

    return this.obtener(pedidoId, operador);
  }
}