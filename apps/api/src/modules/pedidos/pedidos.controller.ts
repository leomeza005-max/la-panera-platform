import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UsuarioAutenticado } from '../auth/interfaces/jwt-payload.interface';
import { CrearPedidoDto } from './dto/crear-pedido.dto';
import { PedidosService } from './pedidos.service';

interface SolicitudAutenticada {
  user: UsuarioAutenticado;
}

@Controller('pedidos')
@UseGuards(JwtAuthGuard)
export class PedidosController {
  constructor(
    private readonly pedidosService: PedidosService,
  ) {}

  @Post()
  async crear(
    @Req() solicitud: SolicitudAutenticada,
    @Body() dto: CrearPedidoDto,
  ) {
    const pedido =
      await this.pedidosService.crear(
        solicitud.user.clienteId,
        dto,
      );

    return { pedido };
  }

  @Get('mis-pedidos')
  async listarDelCliente(
    @Req() solicitud: SolicitudAutenticada,
  ) {
    const pedidos =
      await this.pedidosService.listarDelCliente(
        solicitud.user.clienteId,
      );

    return { pedidos };
  }

  @Get(':pedidoId')
  async obtenerDelCliente(
    @Req() solicitud: SolicitudAutenticada,

    @Param(
      'pedidoId',
      new ParseUUIDPipe({ version: '4' }),
    )
    pedidoId: string,
  ) {
    const pedido =
      await this.pedidosService.obtenerDelCliente(
        pedidoId,
        solicitud.user.clienteId,
      );

    return { pedido };
  }
}