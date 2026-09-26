import { Module } from '@nestjs/common';
import { ClientesRepository } from './clientes.repository';
import { ClientesService } from './clientes.service';

@Module({
  providers: [ClientesRepository, ClientesService],
  exports: [ClientesService],
})
export class ClientesModule {}