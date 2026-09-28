
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import type { RowDataPacket } from 'mysql2/promise';
import { DatabaseService } from '../../config/database.service';
import type { UsuarioOperadorAutenticado } from '../auth/interfaces/operador-jwt-payload.interface';

interface FilaRol extends RowDataPacket {
  rol: 'ADMIN' | 'CAJERO';
}

@Injectable()
export class AdministracionGuard implements CanActivate {
  constructor(private readonly database: DatabaseService) {}

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const solicitud = context
      .switchToHttp()
      .getRequest<{
        user?: UsuarioOperadorAutenticado;
      }>();

    const operador = solicitud.user;

    if (!operador || operador.rol !== 'ADMIN') {
      throw new ForbiddenException(
        'Se requiere un operador ADMIN',
      );
    }

    const [rows] = await this.database
      .getPool()
      .execute<FilaRol[]>(
        `SELECT ROL AS rol
         FROM Operador
         WHERE OperadorID = ?
         LIMIT 1`,
        [operador.operadorId],
      );

    if (rows[0]?.rol !== 'ADMIN') {
      throw new ForbiddenException(
        'Sin permisos de administrador',
      );
    }

    return true;
  }
}
