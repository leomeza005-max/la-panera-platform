export interface JwtPayload {
  sub: string;
  correo: string;
  tipo: 'cliente';
  iat?: number;
  exp?: number;
}

export interface UsuarioAutenticado {
  clienteId: string;
  correo: string;
  tipo: 'cliente';
}