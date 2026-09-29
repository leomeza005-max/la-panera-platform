import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import { OperadorJwtAuthGuard } from '../auth/guards/operador-jwt-auth.guard';
import type { UsuarioOperadorAutenticado } from '../auth/interfaces/operador-jwt-payload.interface';
import { ActualizarEstadoPedidoDto } from './dto/actualizar-estado-pedido.dto';
import { PedidosOperadorService } from './pedidos-operador.service';

interface SolicitudOperadorAutenticado {
  user: UsuarioOperadorAutenticado;
}

@Controller('operadores/pedidos')
@UseGuards(OperadorJwtAuthGuard)
export class PedidosOperadorController {
  constructor(
    private readonly pedidosOperadorService:
      PedidosOperadorService,
  ) {}

  @Get()
  async listar(
    @Req() solicitud: SolicitudOperadorAutenticado,
  ) {
    const pedidos =
      await this.pedidosOperadorService.listar(
        solicitud.user,
      );

    return { pedidos };
  }

  @Get(':pedidoId')
  async obtener(
    @Req() solicitud: SolicitudOperadorAutenticado,
    @Param(
      'pedidoId',
      new ParseUUIDPipe({ version: '4' }),
    )
    pedidoId: string,
  ) {
    const pedido =
      await this.pedidosOperadorService.obtener(
        pedidoId,
        solicitud.user,
      );

    return { pedido };
  }

  @Patch(':pedidoId/estado')
  async actualizarEstado(
    @Req() solicitud: SolicitudOperadorAutenticado,
    @Param(
      'pedidoId',
      new ParseUUIDPipe({ version: '4' }),
    )
    pedidoId: string,
    @Body() dto: ActualizarEstadoPedidoDto,
  ) {
    const pedido =
      await this.pedidosOperadorService.actualizarEstado(
        pedidoId,
        dto,
        solicitud.user,
      );

    return { pedido };
  }
}