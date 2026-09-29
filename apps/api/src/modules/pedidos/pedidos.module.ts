import { Module } from '@nestjs/common';
import { PedidosOperadorController } from './pedidos-operador.controller';
import { PedidosOperadorRepository } from './pedidos-operador.repository';
import { PedidosOperadorService } from './pedidos-operador.service';
import { PedidosController } from './pedidos.controller';
import { PedidosRepository } from './pedidos.repository';
import { PedidosService } from './pedidos.service';

@Module({
  controllers: [
    PedidosController,
    PedidosOperadorController,
  ],
  providers: [
    PedidosRepository,
    PedidosService,
    PedidosOperadorRepository,
    PedidosOperadorService,
  ],
  exports: [
    PedidosService,
    PedidosOperadorService,
  ],
})
export class PedidosModule {}