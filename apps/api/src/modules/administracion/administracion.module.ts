
import { Module } from '@nestjs/common';

import { AdministracionController } from './administracion.controller';
import { AdministracionGuard } from './administracion.guard';
import { CategoriasModule } from '../categorias/categorias.module';

@Module({
  controllers: [
    AdministracionController,
  ],
  providers: [
    AdministracionGuard,
  ],
  imports: [CategoriasModule],
})
export class AdministracionModule {}
