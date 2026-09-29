import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { crearPedido } from '../services/pedidos.service';
import { CrearPedidoRequest } from '../types/pedidos.types';

// Importamos tus nuevos servicios y tipos del catálogo
import { obtenerCategorias, obtenerProductosPorCategoria } from '../../catalogo/services/catalogo.service';
import { Categoria, Producto } from '../../catalogo/types/catalogo.types';

export const CrearPedidoPage: React.FC = () => {
  const navigate = useNavigate();
  
  const [sucursalId, setSucursalId] = useState<number>(1);
  const [productosCarrito, setProductosCarrito] = useState<{ productoId: string; cantidad: number; precioBase: number; nombre: string }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState<boolean>(false);

  // Estados para el catálogo
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [productosDisponibles, setProductosDisponibles] = useState<Producto[]>([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<number | ''>('');
  const [productoSeleccionado, setProductoSeleccionado] = useState<string>('');
  const [cantidadInput, setCantidadInput] = useState<number>(1);

  // Cargar categorías al inicio
  useEffect(() => {
    const cargarCategorias = async () => {
      try {
        const data = await obtenerCategorias();
        setCategorias(data);
      } catch (err) {
        console.error('Error al cargar categorías', err);
        setError('No se pudieron cargar las categorías del menú.');
      }
    };
    cargarCategorias();
  }, []);

  // Cargar productos al seleccionar categoría
  useEffect(() => {
    const cargarProductos = async () => {
      if (categoriaSeleccionada === '') {
        setProductosDisponibles([]);
        setProductoSeleccionado('');
        return;
      }
      try {
        const data = await obtenerProductosPorCategoria(Number(categoriaSeleccionada));
        setProductosDisponibles(data);
        setProductoSeleccionado('');
      } catch (err) {
        console.error('Error al cargar productos', err);
        setError('No se pudieron cargar los productos.');
      }
    };
    cargarProductos();
  }, [categoriaSeleccionada]);

  const handleAgregarAlCarrito = () => {
    if (!productoSeleccionado || cantidadInput < 1) {
      setError('Selecciona un producto y una cantidad válida.');
      return;
    }

    const productoCompleto = productosDisponibles.find(p => p.productoId === productoSeleccionado);
    if (!productoCompleto) return;

    setProductosCarrito([
      ...productosCarrito,
      { 
        productoId: productoCompleto.productoId, 
        cantidad: cantidadInput, 
        precioBase: productoCompleto.precioBase,
        nombre: productoCompleto.descripcion
      }
    ]);
    
    setProductoSeleccionado('');
    setCantidadInput(1);
    setError(null);
  };

  const handleRemoverDelCarrito = (indexToRemove: number) => {
    setProductosCarrito(productosCarrito.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (productosCarrito.length === 0) {
      setError('Debes agregar al menos un producto al pedido.');
      return;
    }

    setCargando(true);
    setError(null);

    try {
      const payload: CrearPedidoRequest = {
        sucursalId: Number(sucursalId),
        productos: productosCarrito.map(p => ({
          productoId: p.productoId,
          cantidad: p.cantidad
        }))
      };

      // Esta llamada usa tu JWT actual y guarda en Aiven
      const nuevoPedido = await crearPedido(payload);
      navigate(`/pedidos/${nuevoPedido.pedidoId}`);
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error al crear el pedido.');
      setCargando(false);
    }
  };

  return (
    <div className="container" style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>Realizar pedido</h2>
      <p>Selecciona la sucursal donde deseas realizar tu pedido y agrega los productos correspondientes.</p>
      
      {error && <div style={{ color: 'red', marginBottom: '15px' }}>{error}</div>}

      <form onSubmit={handleSubmit} style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        
        {/* Sucursal */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Sucursal</label>
          <select 
            value={sucursalId} 
            onChange={(e) => setSucursalId(Number(e.target.value))} 
            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
          >
            <option value={1}>Sucursal Centro</option>
            <option value={2}>Sucursal Norte</option>
          </select>
        </div>

        {/* Sección de Catálogo */}
        <fieldset style={{ border: '1px solid #e0e0e0', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
          <legend style={{ fontWeight: 'bold', padding: '0 10px' }}>Productos</legend>
          
          <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '14px', marginBottom: '5px' }}>Categoría:</label>
              <select 
                value={categoriaSeleccionada} 
                onChange={(e) => setCategoriaSeleccionada(e.target.value === '' ? '' : Number(e.target.value))}
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
              >
                <option value="">-- Selecciona una categoría --</option>
                {categorias.map(cat => (
                  <option key={cat.categoriaId} value={cat.categoriaId}>
                    {cat.nombreCategoria}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ flex: 2 }}>
              <label style={{ display: 'block', fontSize: '14px', marginBottom: '5px' }}>Producto:</label>
              <select 
                value={productoSeleccionado} 
                onChange={(e) => setProductoSeleccionado(e.target.value)}
                disabled={productosDisponibles.length === 0}
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
              >
                <option value="">
                  {productosDisponibles.length === 0 ? 'Selecciona una categoría primero' : '-- Elige un producto --'}
                </option>
                {productosDisponibles.map(prod => (
                  <option key={prod.productoId} value={prod.productoId}>
                    {prod.descripcion} - ${prod.precioBase}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ width: '100px' }}>
              <label style={{ display: 'block', fontSize: '14px', marginBottom: '5px' }}>Cantidad:</label>
              <input 
                type="number" 
                min="1" 
                value={cantidadInput} 
                onChange={(e) => setCantidadInput(Number(e.target.value))}
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
              />
            </div>
          </div>

          <button 
            type="button" 
            onClick={handleAgregarAlCarrito} 
            style={{ width: '100%', padding: '12px', background: '#f5eadc', color: '#5a4a42', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            + Agregar producto
          </button>
        </fieldset>

        {/* Carrito */}
        {productosCarrito.length > 0 && (
          <div style={{ marginBottom: '20px', padding: '15px', background: '#fafafa', borderRadius: '8px' }}>
            <h4 style={{ marginTop: 0, marginBottom: '10px' }}>Resumen del Pedido</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {productosCarrito.map((item, index) => (
                <li key={index} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #eee' }}>
                  <span>{item.cantidad}x {item.nombre}</span>
                  <div>
                    <span style={{ marginRight: '15px', fontWeight: 'bold' }}>${(item.precioBase * item.cantidad).toFixed(2)}</span>
                    <button 
                      type="button" 
                      onClick={() => handleRemoverDelCarrito(index)} 
                      style={{ background: 'none', border: 'none', color: 'red', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                      X
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            <div style={{ textAlign: 'right', marginTop: '10px', fontWeight: 'bold', fontSize: '18px' }}>
              Total: ${productosCarrito.reduce((acc, curr) => acc + (curr.precioBase * curr.cantidad), 0).toFixed(2)}
            </div>
          </div>
        )}

        <button 
          type="submit" 
          disabled={cargando || productosCarrito.length === 0} 
          style={{ width: '100%', padding: '15px', background: '#9f8f85', color: 'white', border: 'none', borderRadius: '4px', fontSize: '16px', fontWeight: 'bold', cursor: productosCarrito.length === 0 ? 'not-allowed' : 'pointer', opacity: productosCarrito.length === 0 ? 0.6 : 1 }}
        >
          {cargando ? 'Procesando...' : 'Confirmar pedido'}
        </button>
      </form>
    </div>
  );
};