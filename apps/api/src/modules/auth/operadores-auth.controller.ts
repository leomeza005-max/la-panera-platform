import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { OperadoresAuthService } from './operadores-auth.service';

@Controller('auth/operadores')
export class OperadoresAuthController {
  constructor(
    private readonly operadoresAuthService: OperadoresAuthService,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() datos: LoginDto) {
    return this.operadoresAuthService.login(datos);
  }
}
