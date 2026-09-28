# PWA de clientes — La Panera

Incluye login de clientes, sesión JWT, rutas protegidas, listado de pedidos, creación de pedidos y consulta de detalle.

## Ejecutar

1. Copia `.env.example` como `.env`.
2. Ejecuta `npm install`.
3. Arranca el backend en `http://localhost:3000`.
4. Ejecuta `npm run dev`.
5. Abre `http://localhost:5173`.

## API esperada

- `POST /api/v1/auth/clientes/login`
- `GET /api/v1/pedidos/mis-pedidos`
- `POST /api/v1/pedidos`
- `GET /api/v1/pedidos/:pedidoId`

Hasta que existan endpoints de sucursales y productos, la pantalla de creación solicita sus IDs manualmente.
