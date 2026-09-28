import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OperadorJwtAuthGuard extends AuthGuard('jwt-operador') {}
