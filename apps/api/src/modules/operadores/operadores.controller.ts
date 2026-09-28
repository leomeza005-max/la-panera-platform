import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { OperadorJwtAuthGuard } from '../auth/guards/operador-jwt-auth.guard';
import type { UsuarioOperadorAutenticado } from '../auth/interfaces/operador-jwt-payload.interface';
import { OperadoresService } from './operadores.service';

interface SolicitudOperadorAutenticado {
  user: UsuarioOperadorAutenticado;
}

@Controller('operadores')
export class OperadoresController {
  constructor(
    private readonly operadoresService: OperadoresService,
  ) {}

  @Get('perfil')
  @UseGuards(OperadorJwtAuthGuard)
  async obtenerPerfil(
    @Req() solicitud: SolicitudOperadorAutenticado,
  ) {
    const operador = await this.operadoresService.obtenerPorId(
      solicitud.user.operadorId,
    );

    return { operador };
  }
}
