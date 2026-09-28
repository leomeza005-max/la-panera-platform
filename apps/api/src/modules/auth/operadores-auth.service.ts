import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import type { OperadorPublico } from '../operadores/operadores.repository';
import { OperadoresService } from '../operadores/operadores.service';
import type { LoginDto } from './dto/login.dto';

@Injectable()
export class OperadoresAuthService {
  constructor(
    private readonly operadoresService: OperadoresService,
    private readonly jwtService: JwtService,
  ) {}

  async login(datos: LoginDto) {
    const correo = datos.correo.trim().toLowerCase();
    const operador = await this.operadoresService.buscarPorCorreo(correo);

    if (!operador) {
      throw new UnauthorizedException('Correo o contraseña incorrectos');
    }

    const contrasenaCorrecta = await bcrypt.compare(
      datos.contrasena,
      operador.contrasenaHash,
    );

    if (!contrasenaCorrecta) {
      throw new UnauthorizedException('Correo o contraseña incorrectos');
    }

    const operadorPublico: OperadorPublico = {
      operadorId: operador.operadorId,
      sucursalId: operador.sucursalId,
      nombre: operador.nombre,
      apellido1: operador.apellido1,
      apellido2: operador.apellido2,
      correo: operador.correo,
      rol: operador.rol,
    };

    const accessToken = await this.jwtService.signAsync({
      sub: operadorPublico.operadorId,
      correo: operadorPublico.correo,
      tipo: 'operador',
      sucursalId: operadorPublico.sucursalId,
      rol: operadorPublico.rol,
    });

    return {
      accessToken,
      tokenType: 'Bearer',
      operador: operadorPublico,
    };
  }
}
