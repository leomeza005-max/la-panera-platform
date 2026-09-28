import { Module } from '@nestjs/common';
import { OperadoresController } from './operadores.controller';
import { OperadoresRepository } from './operadores.repository';
import { OperadoresService } from './operadores.service';

@Module({
  controllers: [OperadoresController],
  providers: [OperadoresRepository, OperadoresService],
  exports: [OperadoresService],
})
export class OperadoresModule {}
