-- CREATE DATABASE Panera;
-- USE Panera;

-- Definicion de Tablas Maestras
CREATE TABLE Cliente (
ClienteID VARCHAR(50) PRIMARY KEY,
Nombre VARCHAR (50) NOT NULL,
Apellido1 VARCHAR(50) NOT NULL,
Apellido2 VARCHAR(50),
Correo VARCHAR(100) UNIQUE NOT NULL,
NumeroTelefonico VARCHAR(20),
ContrasenaHash VARCHAR(50) NOT NULL
);

CREATE TABLE Sucursal (
SucursalID INT AUTO_INCREMENT PRIMARY KEY,
Nombre VARCHAR(100) NOT NULL,
Direccion VARCHAR(200)
);

CREATE TABLE Operador (
OperadorID VARCHAR(36) PRIMARY KEY,
SucursalID INT NOT NULL,
Nombre VARCHAR(50) NOT NULL,
Apellido1 VARCHAR(50) NOT NULL,
Apellido2 VARCHAR(50),
Correo VARCHAR(100) UNIQUE NOT NULL,
ContrasenaHash VARCHAR(255) NOT NULL,
ROL ENUM('CAJERO', 'ADMIN') NOT NULL,
FOREIGN KEY (SucursalID) REFERENCES Sucursal(SucursalID)
);

CREATE TABLE CategoriaProducto (
    CategoriaID INT AUTO_INCREMENT PRIMARY KEY,
    NombreCategoria VARCHAR(50) NOT NULL
);

CREATE TABLE Producto (
    ProductoID VARCHAR(36) PRIMARY KEY,
    CategoriaID INT NOT NULL,
    Descripcion VARCHAR(150) NOT NULL,
    PrecioBase DECIMAL(10, 2) NOT NULL,
    Estado BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (CategoriaID) REFERENCES CategoriaProducto(CategoriaID)
);

-- Definicion Tablas Transaccionales
CREATE TABLE Pedido (
    PedidoID VARCHAR(36) PRIMARY KEY,
    ClienteID VARCHAR(36), -- Permite NULL para compras rápidas en mostrador sin app
    SucursalID INT NOT NULL,
    FechaHora DATETIME DEFAULT CURRENT_TIMESTAMP,
    Estado ENUM('PENDIENTE', 'PREPARANDO', 'LISTO_PICKUP', 'ENTREGADO', 'CANCELADO') NOT NULL,
    TotalFinal DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (ClienteID) REFERENCES Cliente(ClienteID),
    FOREIGN KEY (SucursalID) REFERENCES Sucursal(SucursalID)
);

CREATE TABLE DetallePedido (
    DetalleID VARCHAR(36) PRIMARY KEY,
    PedidoID VARCHAR(36) NOT NULL,
    ProductoID VARCHAR(36) NOT NULL,
    Cantidad INT NOT NULL,
    PrecioUnitario DECIMAL(10, 2) NOT NULL,
    DescuentoAplicado DECIMAL(10, 2) DEFAULT 0.00,
    FOREIGN KEY (PedidoID) REFERENCES Pedido(PedidoID) ON DELETE CASCADE,
    FOREIGN KEY (ProductoID) REFERENCES Producto(ProductoID)
);

CREATE TABLE LealtadCliente (
    LealtadID VARCHAR(36) PRIMARY KEY,
    ClienteID VARCHAR(36) NOT NULL,
    CategoriaID INT NOT NULL,
    ConsumosAcumulados INT DEFAULT 0,
    FOREIGN KEY (ClienteID) REFERENCES Cliente(ClienteID) ON DELETE CASCADE,
    FOREIGN KEY (CategoriaID) REFERENCES CategoriaProducto(CategoriaID)
);

SHOW TABLES;
DESCRIBE Cliente;