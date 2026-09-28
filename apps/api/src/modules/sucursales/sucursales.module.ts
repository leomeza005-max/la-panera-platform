import { Module } from '@nestjs/common';

import { SucursalesController } from './sucursales.controller';
import { SucursalesService } from './sucursales.service';
import { SucursalesRepository } from './sucursales.repository';

@Module({
  controllers: [SucursalesController],
  providers: [
    SucursalesService,
    SucursalesRepository,
  ],
  exports: [SucursalesService],
})
export class SucursalesModule {}