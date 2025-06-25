import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ProductoCrud = () => {
  const [productos, setProductos] = useState([]);
  const [nuevo, setNuevo] = useState({ nombre: '', precio: 0, stock: 0 });
  const [editando, setEditando] = useState(null); // ID del producto que se está editando

  useEffect(() => {
    cargarProductos();
  }, []);

  const cargarProductos = async () => {
    const res = await axios.get('http://localhost:3001/productos');
    setProductos(res.data);
  };

  const agregarOActualizar = async () => {
    if (editando) {
      // Actualizar producto existente
      await axios.put(`http://localhost:3001/productos/${editando}`, nuevo);
      setEditando(null);
    } else {
      // Agregar nuevo producto
      await axios.post('http://localhost:3001/productos', nuevo);
    }
    setNuevo({ nombre: '', precio: 0, stock: 0 });
    cargarProductos();
  };

  const editarProducto = (producto) => {
    setNuevo({
      nombre: producto.Nombre,
      precio: producto.Precio,
      stock: producto.Stock,
    });
    setEditando(producto.Id);
  };

  const eliminarProducto = async (id) => {
    await axios.delete(`http://localhost:3001/productos/${id}`);
    cargarProductos();
  };

  return (
    <div>
      <h2>Gestión de Productos</h2>

      <input
        placeholder="Nombre"
        value={nuevo.nombre}
        onChange={(e) => setNuevo({ ...nuevo, nombre: e.target.value })}
      />
      <input
        placeholder="Precio"
        type="number"
        value={nuevo.precio}
        onChange={(e) => setNuevo({ ...nuevo, precio: parseFloat(e.target.value) })}
      />
      <input
        placeholder="Stock"
        type="number"
        value={nuevo.stock}
        onChange={(e) => setNuevo({ ...nuevo, stock: parseInt(e.target.value) })}
      />

      <button onClick={agregarOActualizar}>
        {editando ? 'Actualizar' : 'Agregar'}
      </button>

      <ul>
        {productos.map((p) => (
          <li key={p.Id}>
            {p.Nombre} - ${p.Precio} - Stock: {p.Stock}
            <button onClick={() => editarProducto(p)}>Editar</button>
            <button onClick={() => eliminarProducto(p.Id)}>Eliminar</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProductoCrud;
