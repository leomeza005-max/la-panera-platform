import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type {
  OperadorJwtPayload,
  UsuarioOperadorAutenticado,
} from '../interfaces/operador-jwt-payload.interface';

@Injectable()
export class OperadorJwtStrategy extends PassportStrategy(
  Strategy,
  'jwt-operador',
) {
  constructor(configService: ConfigService) {
    const secret = configService.get<string>('JWT_SECRET');

    if (!secret || secret.length < 32) {
      throw new Error(
        'JWT_SECRET debe existir y tener al menos 32 caracteres',
      );
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  validate(payload: OperadorJwtPayload): UsuarioOperadorAutenticado {
    const rolValido = payload.rol === 'CAJERO' || payload.rol === 'ADMIN';

    if (
      !payload.sub ||
      !payload.correo ||
      payload.tipo !== 'operador' ||
      !Number.isInteger(payload.sucursalId) ||
      payload.sucursalId < 1 ||
      !rolValido
    ) {
      throw new UnauthorizedException('Token de operador inválido');
    }

    return {
      operadorId: payload.sub,
      correo: payload.correo,
      tipo: payload.tipo,
      sucursalId: payload.sucursalId,
      rol: payload.rol,
    };
  }
}
