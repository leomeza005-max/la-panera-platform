import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegistroClienteDto } from './dto/registro-cliente.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { UsuarioAutenticado } from './interfaces/jwt-payload.interface';

interface SolicitudAutenticada {
  user: UsuarioAutenticado;
}

@Controller('auth/clientes')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('registro')
  @HttpCode(HttpStatus.CREATED)
  registrar(@Body() datos: RegistroClienteDto) {
    return this.authService.registrar(datos);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() datos: LoginDto) {
    return this.authService.login(datos);
  }

  @Get('verificar')
  @UseGuards(JwtAuthGuard)
  verificarToken(@Req() solicitud: SolicitudAutenticada) {
    return {
      autenticado: true,
      usuario: solicitud.user,
    };
  }
}