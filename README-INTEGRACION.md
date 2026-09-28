# Integración: Sucursales y Operadores

Este paquete conserva el trabajo funcional de la rama
`feature/sucursales-operadores` y corrige lo necesario para integrarlo en la
rama `development` actual sin reemplazar Clientes, Pedidos, DetallePedido ni
la PWA.

## Correcciones incluidas

- Registra `SucursalesModule` y `OperadoresModule` en `AppModule` sin eliminar
  `PedidosModule`.
- Completa `operadores.module.ts`, que estaba vacío.
- Corrige `OperadorID` de `number` a `string`, porque la tabla usa
  `VARCHAR(36)`.
- Admite `Apellido2` y `Direccion` como valores nulos según el esquema SQL.
- Evita devolver `ContrasenaHash` en respuestas públicas.
- Agrega `LIMIT 1`, consultas parametrizadas y mapeo explícito de resultados.
- Conserva las rutas públicas de consulta de sucursales.
- Agrega login JWT independiente para operadores.
- Agrega una estrategia/guard JWT exclusiva para operadores, por lo que un
  token de cliente no puede utilizarse como token de operador.
- Agrega la primera ruta protegida de perfil de operador.

## Archivos que se reemplazan

- `apps/api/src/app.module.ts`
- `apps/api/src/modules/auth/auth.module.ts`
- Los archivos existentes dentro de:
  - `apps/api/src/modules/sucursales/`
  - `apps/api/src/modules/operadores/`

## Archivos nuevos

- `apps/api/src/modules/operadores/operadores.controller.ts`
- `apps/api/src/modules/auth/operadores-auth.controller.ts`
- `apps/api/src/modules/auth/operadores-auth.service.ts`
- `apps/api/src/modules/auth/guards/operador-jwt-auth.guard.ts`
- `apps/api/src/modules/auth/interfaces/operador-jwt-payload.interface.ts`
- `apps/api/src/modules/auth/strategies/operador-jwt.strategy.ts`

## Instalación desde CMD

Primero asegúrate de estar en `development` y de haber guardado tus cambios:

```bat
cd C:\Proyectos\la-panera-platform
git switch development
git pull origin development
git status
```

Cuando el estado esté limpio, extrae el ZIP directamente sobre la raíz del
repositorio:

```bat
tar -xf "C:\Proyectos\CHAT\la-panera-integracion-sucursales-operadores.zip" -C "C:\Proyectos\la-panera-platform"
```

Después compila:

```bat
cd C:\Proyectos\la-panera-platform\apps\api
npm install
npm run build
npm run start:dev
```

En PowerShell utiliza `npm.cmd` en lugar de `npm` si la política de ejecución
bloquea `npm.ps1`.

## Endpoints resultantes

| Método | Endpoint | Protección | Uso |
| --- | --- | --- | --- |
| GET | `/api/v1/sucursales` | Pública | Lista sucursales. |
| GET | `/api/v1/sucursales/1` | Pública | Obtiene una sucursal. |
| POST | `/api/v1/auth/operadores/login` | Pública | Inicia sesión como operador. |
| GET | `/api/v1/operadores/perfil` | Bearer de operador | Devuelve el perfil autenticado. |

### Cuerpo del login de operador

```json
{
  "correo": "operador@lapanera.com",
  "contrasena": "12345678"
}
```

La contraseña almacenada en `Operador.ContrasenaHash` debe ser un hash bcrypt,
no texto plano.

## Verificación antes del commit

```bat
cd C:\Proyectos\la-panera-platform
git status --short
git diff --check
cd apps\api
npm run build
```

No se incluye ningún archivo `.env`, contraseña, token ni certificado.
