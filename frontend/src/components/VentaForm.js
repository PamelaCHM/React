import React, { useEffect, useState } from 'react';
import axios from 'axios';


export default function VentaForm() {
  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [form, setForm] = useState({ clienteId: '', productoId: '', cantidad: 1 });
  const [mensaje, setMensaje] = useState('');
  const [ventas, setVentas] = useState([]);

  useEffect(() => {
    // Cargar lista de clientes y productos al montar
    axios.get('http://localhost:3001/clientes').then(r => setClientes(r.data));
    axios.get('http://localhost:3001/productos').then(r => setProductos(r.data));
    cargarVentas();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje('');
    try {
      // Enviar la venta al backend
      if (form.id) {
        // Esto está bien solo si form.id tiene un número válido
        await axios.put(`http://localhost:3001/ventas/${form.id}`, {
          clienteId: parseInt(form.clienteId),
          productoId: parseInt(form.productoId),
          cantidad: parseInt(form.cantidad),
        });
        setMensaje('✅ Venta creada con éxito');
        await cargarVentas();
      } else {
        // Nueva venta
        await axios.post('http://localhost:3001/ventas', {
          clienteId: parseInt(form.clienteId),
          productoId: parseInt(form.productoId),
          cantidad: parseInt(form.cantidad),
        });
        setMensaje('✅ Venta actualizada con éxito');
        await cargarVentas();
      }
      // Refrescar stock de productos
      const prod = await axios.get('http://localhost:3001/productos');
      setProductos(prod.data);
      // Resetear formulario
      setForm({ clienteId: '', productoId: '', cantidad: 1 });
    } catch (err) {
      setMensaje('❌ Error: ' + (err.response?.data || err.message));
    }
  };

  const cargarVentas = async () => {
    try {
      const res = await axios.get('http://localhost:3001/ventas');
      setVentas(res.data);
    } catch (err) {
      console.error('Error al cargar ventas:', err);
    }
  };

 const editarVenta = (venta) => {
    setForm({
      id: venta.Id,
      clienteId: venta.ClienteId.toString(),
      productoId: venta.ProductoId.toString(),
      cantidad: venta.Cantidad,
    });
    setMensaje('');
  };

  const eliminarVenta = async (id) => {
    if (!window.confirm('¿Seguro que quieres eliminar esta venta?')) return;
    try {
      await axios.delete(`http://localhost:3001/ventas/${id}`);
      setMensaje('🗑️ Venta eliminada');
      await cargarVentas();
      // Actualizar productos para reflejar stock
      const prod = await axios.get('http://localhost:3001/productos');
      setProductos(prod.data);
    } catch (err) {
      setMensaje('❌ Error al eliminar: ' + (err.response?.data || err.message));
    }
  };

  return (
    <div>
      <h2>{form.id ? 'Editar Venta' : 'Crear Venta'}</h2>
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
            {clientes.map(c => (
              <option key={c.Id} value={c.Id}>{c.Nombre}</option>
            ))}
          </select>
        </label>
        <br />
        <label>
          Producto:
          <select
            value={form.productoId}
            onChange={e => setForm({ ...form, productoId: e.target.value })}
            required
          >
            <option value="">-- Selecciona producto --</option>
            {productos.map(p => (
              <option key={p.Id} value={p.Id}>
                {p.Nombre} (stock: {p.Stock})
              </option>
            ))}
          </select>
        </label>
        <br />
        <label>
          Cantidad:
          <input
            type="number"
            min="1"
            max={
              form.productoId
                ? productos.find(p => p.Id === +form.productoId)?.Stock || 1
                : 1
            }
            value={form.cantidad}
            onChange={e => setForm({ ...form, cantidad: e.target.value })}
            required
          />
        </label>
        <br />
        <button type="submit" disabled={!form.clienteId || !form.productoId}>
          {form.id ? 'Actualizar Venta' : 'Confirmar Venta'}
        </button>
        {form.id && (
          <button
            type="button"
            onClick={() => {
              setForm({ id: null, clienteId: '', productoId: '', cantidad: 1 });
              setMensaje('');
            }}
            style={{ marginLeft: '10px' }}
          >
            Cancelar
          </button>
        )}
      </form>

      <h3>Ventas Realizadas</h3>
      <ul>
        {ventas.map(v => (
          <li key={v.Id} style={{ marginBottom: '8px' }}>
            Cliente: <b>{v.ClienteNombre}</b>, Producto: <b>{v.ProductoNombre}</b>, Cantidad: <b>{v.Cantidad}</b>
            {' '}
            <button onClick={() => editarVenta(v)} style={{ marginLeft: '10px' }}>
              Editar
            </button>
            <button onClick={() => eliminarVenta(v.Id)} style={{ marginLeft: '5px' }}>
              Eliminar
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}