import {
  Injectable,
  Logger,
  OnApplicationShutdown,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createPool } from 'mysql2/promise';
import type { Pool, RowDataPacket } from 'mysql2/promise';

interface DatabaseHealthRow extends RowDataPacket {
  databaseName: string;
  version: string;
}

@Injectable()
export class DatabaseService
  implements OnModuleInit, OnApplicationShutdown
{
  private readonly logger = new Logger(DatabaseService.name);
  private readonly pool: Pool;

  constructor(private readonly configService: ConfigService) {
    const port = Number(this.getRequiredVariable('DB_PORT'));

    if (!Number.isInteger(port)) {
      throw new Error('DB_PORT debe ser un número válido');
    }

    this.pool = createPool({
      host: this.getRequiredVariable('DB_HOST'),
      port,
      user: this.getRequiredVariable('DB_USER'),
      password: this.getRequiredVariable('DB_PASSWORD'),
      database: this.getRequiredVariable('DB_NAME'),

      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      connectTimeout: 60000,

      enableKeepAlive: true,
      keepAliveInitialDelay: 0,

      ssl: {
        rejectUnauthorized: false,
      },
    });
  }

  private getRequiredVariable(name: string): string {
    const value = this.configService.get<string>(name);

    if (!value || value.trim() === '') {
      throw new Error(`Falta la variable de entorno: ${name}`);
    }

    return value;
  }

  async onModuleInit(): Promise<void> {
    const database = await this.healthCheck();

    this.logger.log(
      `Conexión exitosa: ${database.name} - MySQL ${database.version}`,
    );
  }

  getPool(): Pool {
    return this.pool;
  }

  async healthCheck(): Promise<{ name: string; version: string }> {
    const [rows] = await this.pool.query<DatabaseHealthRow[]>(
      'SELECT DATABASE() AS databaseName, VERSION() AS version',
    );

    const database = rows[0];

    if (!database) {
      throw new Error('MySQL no devolvió información de la base de datos');
    }

    return {
      name: database.databaseName,
      version: database.version,
    };
  }

  async onApplicationShutdown(): Promise<void> {
    await this.pool.end();
    this.logger.log('Pool de conexiones cerrado');
  }
}