import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ClientesService } from './clientes.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UsuarioAutenticado } from '../auth/interfaces/jwt-payload.interface';

interface SolicitudAutenticada {
  user: UsuarioAutenticado;
}

@Controller('clientes')
export class ClientesController {
  constructor(
    private readonly clientesService: ClientesService,
  ) {}

  @Get('perfil')
  @UseGuards(JwtAuthGuard)
  async obtenerPerfil(
    @Req() solicitud: SolicitudAutenticada,
  ) {
    const cliente = await this.clientesService.obtenerPorId(
      solicitud.user.clienteId,
    );

    return {
      cliente,
    };
  }
}