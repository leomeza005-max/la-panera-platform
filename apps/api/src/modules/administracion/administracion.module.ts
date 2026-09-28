
import { Module } from '@nestjs/common';

import { AdministracionController } from './administracion.controller';
import { AdministracionGuard } from './administracion.guard';

@Module({
  controllers: [
    AdministracionController,
  ],
  providers: [
    AdministracionGuard,
  ],
})
export class AdministracionModule {}
