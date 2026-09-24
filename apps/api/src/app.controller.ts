import {
  Controller,
  Get,
  ServiceUnavailableException,
} from '@nestjs/common';
import { DatabaseService } from './config/database.service';

@Controller()
export class AppController {
  constructor(private readonly databaseService: DatabaseService) {}

  @Get()
  inicio() {
    return {
      message: 'API de La Panera funcionando',
    };
  }

  @Get('health')
  health() {
    return {
      status: 'ok',
      service: 'la-panera-api',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('health/database')
  async databaseHealth() {
    try {
      const database = await this.databaseService.healthCheck();

      return {
        status: 'ok',
        service: 'la-panera-api',
        database: {
          connection: 'successful',
          name: database.name,
          version: database.version,
        },
        timestamp: new Date().toISOString(),
      };
    } catch {
      throw new ServiceUnavailableException({
        status: 'error',
        service: 'la-panera-api',
        database: {
          connection: 'failed',
        },
      });
    }
  }
}