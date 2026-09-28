import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { DatabaseModule } from './config/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { OperadoresModule } from './modules/operadores/operadores.module';
import { PedidosModule } from './modules/pedidos/pedidos.module';
import { SucursalesModule } from './modules/sucursales/sucursales.module';
import { AdministracionModule } from './modules/administracion/administracion.module';
import { ProductosModule } from './modules/productos/productos.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    AuthModule,
    PedidosModule,
    SucursalesModule,
    OperadoresModule,
    AdministracionModule,
    ProductosModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
