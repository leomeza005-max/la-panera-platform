import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ClientesModule } from '../clientes/clientes.module';
import { OperadoresModule } from '../operadores/operadores.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { OperadoresAuthController } from './operadores-auth.controller';
import { OperadoresAuthService } from './operadores-auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { OperadorJwtStrategy } from './strategies/operador-jwt.strategy';

@Module({
  imports: [
    ConfigModule,
    ClientesModule,
    OperadoresModule,

    PassportModule.register({
      defaultStrategy: 'jwt',
    }),

    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const secret = configService.get<string>('JWT_SECRET');

        const expiresIn = Number(
          configService.get<string>('JWT_EXPIRES_IN_SECONDS') || '86400',
        );

        if (!secret || secret.length < 32) {
          throw new Error(
            'JWT_SECRET debe existir y tener al menos 32 caracteres',
          );
        }

        if (!Number.isInteger(expiresIn) || expiresIn <= 0) {
          throw new Error(
            'JWT_EXPIRES_IN_SECONDS debe ser un número positivo',
          );
        }

        return {
          secret,
          signOptions: {
            expiresIn,
          },
        };
      },
    }),
  ],
  controllers: [AuthController, OperadoresAuthController],
  providers: [
    AuthService,
    OperadoresAuthService,
    JwtStrategy,
    OperadorJwtStrategy,
  ],
})
export class AuthModule {}
