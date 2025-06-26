import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function VentaForm() {
  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [form, setForm] = useState({ clienteId: '', productoId: '', cantidad: 1 });
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    // Cargar lista de clientes y productos al montar
    axios.get('http://localhost:3001/clientes').then(r => setClientes(r.data));
    axios.get('http://localhost:3001/productos').then(r => setProductos(r.data));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje('');
    try {
      // Enviar la venta al backend
      await axios.post('http://localhost:3001/ventas', {
        clienteId: parseInt(form.clienteId),
        productoId: parseInt(form.productoId),
        cantidad: parseInt(form.cantidad)
      });
      setMensaje('✅ Venta creada con éxito');
      // Refrescar stock de productos
      const prod = await axios.get('http://localhost:3001/productos');
      setProductos(prod.data);
      // Resetear formulario
      setForm({ clienteId: '', productoId: '', cantidad: 1 });
    } catch (err) {
      setMensaje('❌ Error: ' + (err.response?.data || err.message));
    }
  };

  return (
    <div>
      <h2>Crear Venta</h2>
      {mensaje && <p>{mensaje}</p>}
      <form onSubmit={handleSubmit}>
        <label>
          Cliente:
          <select
            value={form.clienteId}
            onChange={e => setForm({ ...form, clienteId: e.target.value })}
            required
          >
            <option value="">-- Selecciona cliente --</option>
            {clientes.map(c =>
              <option key={c.Id} value={c.Id}>{c.Nombre}</option>
            )}
          </select>
        </label>
        <br/>
        <label>
          Producto:
          <select
            value={form.productoId}
            onChange={e => setForm({ ...form, productoId: e.target.value })}
            required
          >
            <option value="">-- Selecciona producto --</option>
            {productos.map(p =>
              <option key={p.Id} value={p.Id}>
                {p.Nombre} (stock: {p.Stock})
              </option>
            )}
          </select>
        </label>
        <br/>
        <label>
          Cantidad:
          <input
            type="number"
            min="1"
            max={form.productoId
              ? productos.find(p => p.Id === +form.productoId)?.Stock || 1
              : 1}
            value={form.cantidad}
            onChange={e => setForm({ ...form, cantidad: e.target.value })}
            required
          />
        </label>
        <br/>
        <button type="submit" disabled={!form.clienteId || !form.productoId}>
          Confirmar Venta
        </button>
      </form>
    </div>
  );
}
