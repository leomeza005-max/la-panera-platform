import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'node:crypto';
import * as bcrypt from 'bcrypt';
import {
  ClientePublico,
} from '../clientes/clientes.repository';
import { ClientesService } from '../clientes/clientes.service';
import { LoginDto } from './dto/login.dto';
import { RegistroClienteDto } from './dto/registro-cliente.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly clientesService: ClientesService,
    private readonly jwtService: JwtService,
  ) {}

  async registrar(datos: RegistroClienteDto) {
    const correo = datos.correo.trim().toLowerCase();
    const existente = await this.clientesService.buscarPorCorreo(correo);

    if (existente) {
      throw new ConflictException('El correo ya está registrado');
    }

    const contrasenaHash = await bcrypt.hash(datos.contrasena, 12);

    try {
      const cliente = await this.clientesService.crear({
        clienteId: randomUUID(),
        nombre: datos.nombre.trim(),
        apellido1: datos.apellido1.trim(),
        apellido2: datos.apellido2?.trim() || null,
        correo,
        numeroTelefonico: datos.numeroTelefonico?.trim() || null,
        contrasenaHash,
      });

      return this.generarRespuesta(cliente);
    } catch (error) {
      if (this.esCorreoDuplicado(error)) {
        throw new ConflictException('El correo ya está registrado');
      }

      throw error;
    }
  }

  async login(datos: LoginDto) {
    const correo = datos.correo.trim().toLowerCase();
    const cliente = await this.clientesService.buscarPorCorreo(correo);

    if (!cliente) {
      throw new UnauthorizedException('Correo o contraseña incorrectos');
    }

    const contrasenaCorrecta = await bcrypt.compare(
      datos.contrasena,
      cliente.contrasenaHash,
    );

    if (!contrasenaCorrecta) {
      throw new UnauthorizedException('Correo o contraseña incorrectos');
    }

    const clientePublico: ClientePublico = {
      clienteId: cliente.clienteId,
      nombre: cliente.nombre,
      apellido1: cliente.apellido1,
      apellido2: cliente.apellido2,
      correo: cliente.correo,
      numeroTelefonico: cliente.numeroTelefonico,
    };

    return this.generarRespuesta(clientePublico);
  }

  private async generarRespuesta(cliente: ClientePublico) {
    const accessToken = await this.jwtService.signAsync({
      sub: cliente.clienteId,
      correo: cliente.correo,
      tipo: 'cliente',
    });

    return {
      accessToken,
      tokenType: 'Bearer',
      cliente,
    };
  }

  private esCorreoDuplicado(error: unknown): boolean {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 'ER_DUP_ENTRY'
    );
  }
}