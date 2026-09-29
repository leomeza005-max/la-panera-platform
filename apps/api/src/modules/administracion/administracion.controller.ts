
import { randomUUID } from 'node:crypto';

import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import {
  IsEmail,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

import * as bcrypt from 'bcrypt';

import type {
  ResultSetHeader,
  RowDataPacket,
} from 'mysql2/promise';

import { DatabaseService } from '../../config/database.service';

import { OperadorJwtAuthGuard } from '../auth/guards/operador-jwt-auth.guard';
import { AdministracionGuard } from './administracion.guard';

import { CategoriasService } from '../categorias/categorias.service';
import { CrearCategoriaDto } from '../categorias/dto/crear-categoria.dto';
import { ActualizarCategoriaDto } from '../categorias/dto/actualizar-categoria.dto';

import { ProductosService } from '../productos/productos.service';
import { CrearProductoDto } from '../productos/dto/crear-producto.dto';
import { ActualizarProductoDto } from '../productos/dto/actualizar-producto.dto';

// ==========================================
// DATOS DE SUCURSALES
// ==========================================

class DatosSucursal {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  nombre!: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  direccion?: string;
}

// ==========================================
// DATOS DE OPERADORES
// ==========================================

class DatosOperador {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nombre!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  apellido1!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  apellido2?: string;

  @IsEmail()
  @MaxLength(150)
  correo!: string;

  @IsInt()
  @Min(1)
  sucursalId!: number;

  @IsIn(['CAJERO', 'ADMIN'])
  rol!: 'CAJERO' | 'ADMIN';
}

class CrearOperador extends DatosOperador {
  @IsString()
  @MinLength(8)
  contrasena!: string;
}

class ActualizarOperador extends DatosOperador {
  @IsOptional()
  @IsString()
  @MinLength(8)
  contrasena?: string;
}

interface ExisteRow extends RowDataPacket {
  existe: number;
}

// ==========================================
// CONTROLADOR DE ADMINISTRACIÓN
// ==========================================

@Controller('administracion')
@UseGuards(
  OperadorJwtAuthGuard,
  AdministracionGuard,
)
export class AdministracionController {

  constructor(
    private readonly database: DatabaseService,
    private readonly categoriasService: CategoriasService,
    private readonly productosService: ProductosService,
  ) {}

  // ==========================================
  // LISTAR TODOS LOS PRODUCTOS (ADMIN)
  // ==========================================

  @Get('productos')
  async listarProductosAdmin() {
    return this.productosService.listarTodas();
  }

  // ==========================================
  // CREAR PRODUCTO (ADMIN)
  // ==========================================

  @Post('productos')
  async crearProductoAdmin(
    @Body() datos: CrearProductoDto,
  ) {
    return this.productosService.crear(datos);
  }

  // ==========================================
  // ACTUALIZAR PRODUCTO (ADMIN)
  // ==========================================

  @Patch('productos/:productoId')
  async actualizarProductoAdmin(
    @Param('productoId') productoId: string,
    @Body() datos: ActualizarProductoDto,
  ) {
    return this.productosService.actualizar(
      productoId,
      datos,
    );
  }

  // ==========================================
  // LISTAR TODAS LAS CATEGORÍAS (ADMIN)
  // ==========================================

  @Get('categorias')
  async listarCategoriasAdmin() {
    return this.categoriasService.listarTodas();
  }

  // ==========================================
  // CREAR CATEGORÍA (ADMIN)
  // ==========================================

  @Post('categorias')
  async crearCategoriaAdmin(
    @Body() datos: CrearCategoriaDto,
  ) {
    return this.categoriasService.crear(datos);
  }

  // ==========================================
  // ACTUALIZAR CATEGORÍA (ADMIN)
  // ==========================================

  @Patch('categorias/:categoriaId')
  async actualizarCategoriaAdmin(
    @Param('categoriaId', ParseIntPipe)
    categoriaId: number,
    @Body() datos: ActualizarCategoriaDto,
  ) {
    return this.categoriasService.actualizar(
      categoriaId,
      datos,
    );
  }

  // ==========================================
  // LISTAR SUCURSALES
  // ==========================================

  @Get('sucursales')
  async listarSucursales() {
    const [rows] = await this.database
      .getPool()
      .execute<RowDataPacket[]>(
        `SELECT
          SucursalID AS sucursalId,
          Nombre AS nombre,
          Direccion AS direccion
         FROM Sucursal
         ORDER BY Nombre ASC`,
      );

    return rows;
  }

  // ==========================================
  // CREAR SUCURSAL
  // ==========================================

  @Post('sucursales')
  async crearSucursal(
    @Body() datos: DatosSucursal,
  ) {
    const [result] = await this.database
      .getPool()
      .execute<ResultSetHeader>(
        `INSERT INTO Sucursal (
          Nombre,
          Direccion
        ) VALUES (?, ?)`,
        [
          datos.nombre.trim(),
          datos.direccion?.trim() || null,
        ],
      );

    return {
      sucursalId: result.insertId,
    };
  }

  // ==========================================
  // EDITAR SUCURSAL
  // ==========================================

  @Patch('sucursales/:id')
  async actualizarSucursal(
    @Param('id', ParseIntPipe) id: number,
    @Body() datos: DatosSucursal,
  ) {
    const [result] = await this.database
      .getPool()
      .execute<ResultSetHeader>(
        `UPDATE Sucursal
         SET Nombre = ?,
             Direccion = ?
         WHERE SucursalID = ?`,
        [
          datos.nombre.trim(),
          datos.direccion?.trim() || null,
          id,
        ],
      );

    if (!result.affectedRows) {
      throw new NotFoundException(
        'Sucursal no encontrada',
      );
    }

    return { ok: true };
  }

  // ==========================================
  // LISTAR OPERADORES
  // ==========================================

  @Get('operadores')
  async listarOperadores() {
    const [rows] = await this.database
      .getPool()
      .execute<RowDataPacket[]>(
        `SELECT
          o.OperadorID AS operadorId,
          o.SucursalID AS sucursalId,
          o.Nombre AS nombre,
          o.Apellido1 AS apellido1,
          o.Apellido2 AS apellido2,
          o.Correo AS correo,
          o.ROL AS rol,
          s.Nombre AS sucursalNombre
         FROM Operador o
         INNER JOIN Sucursal s
           ON s.SucursalID = o.SucursalID
         ORDER BY o.Nombre, o.Apellido1`,
      );

    return rows;
  }

  // ==========================================
  // VALIDAR EXISTENCIA DE SUCURSAL
  // ==========================================

  private async validarSucursal(
    sucursalId: number,
  ) {
    const [rows] = await this.database
      .getPool()
      .execute<ExisteRow[]>(
        `SELECT 1 AS existe
         FROM Sucursal
         WHERE SucursalID = ?
         LIMIT 1`,
        [sucursalId],
      );

    if (!rows.length) {
      throw new BadRequestException(
        'La sucursal no existe',
      );
    }
  }

  // ==========================================
  // MANEJO DE CORREOS DUPLICADOS
  // ==========================================

  private manejarDuplicado(
    error: unknown,
  ): never {
    if (
      (error as { code?: string })?.code
      === 'ER_DUP_ENTRY'
    ) {
      throw new ConflictException(
        'Ya existe un operador con ese correo',
      );
    }

    throw error;
  }

  // ==========================================
  // REGISTRAR OPERADOR
  // ==========================================

  @Post('operadores')
  async crearOperador(
    @Body() datos: CrearOperador,
  ) {
    await this.validarSucursal(
      datos.sucursalId,
    );

    const hash = await bcrypt.hash(
      datos.contrasena,
      12,
    );

    const operadorId = randomUUID();

    try {
      await this.database.getPool().execute(
        `INSERT INTO Operador (
          OperadorID,
          SucursalID,
          Nombre,
          Apellido1,
          Apellido2,
          Correo,
          ContrasenaHash,
          ROL
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          operadorId,
          datos.sucursalId,
          datos.nombre.trim(),
          datos.apellido1.trim(),
          datos.apellido2?.trim() || null,
          datos.correo.trim().toLowerCase(),
          hash,
          datos.rol,
        ],
      );
    } catch (error) {
      this.manejarDuplicado(error);
    }

    return { operadorId };
  }

  // ==========================================
  // ACTUALIZAR OPERADOR
  // ==========================================

  @Patch('operadores/:id')
  async actualizarOperador(
    @Param('id') id: string,
    @Body() datos: ActualizarOperador,
  ) {
    await this.validarSucursal(
      datos.sucursalId,
    );

    const hash = datos.contrasena
      ? await bcrypt.hash(datos.contrasena, 12)
      : null;

    try {
      const [result] = await this.database
        .getPool()
        .execute<ResultSetHeader>(
          `UPDATE Operador
           SET SucursalID = ?,
               Nombre = ?,
               Apellido1 = ?,
               Apellido2 = ?,
               Correo = ?,
               ROL = ?,
               ContrasenaHash =
                 COALESCE(?, ContrasenaHash)
           WHERE OperadorID = ?`,
          [
            datos.sucursalId,
            datos.nombre.trim(),
            datos.apellido1.trim(),
            datos.apellido2?.trim() || null,
            datos.correo.trim().toLowerCase(),
            datos.rol,
            hash,
            id,
          ],
        );

      if (!result.affectedRows) {
        throw new NotFoundException(
          'Operador no encontrado',
        );
      }
    } catch (error) {
      this.manejarDuplicado(error);
    }

    return { ok: true };
  }
}
