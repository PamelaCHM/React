import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ProductoCrud = () => {
    const [productos, setProductos] = useState([]);
    const [nuevo, setNuevo] = useState({ nombre: '', precio: 0, stock: 0 });

    useEffect(() => {
        cargarProductos();
    }, []);

    const cargarProductos = async () => {
        const res = await axios.get('http://localhost:3001/productos');
        setProductos(res.data);
    };
    return (
            <div>
                <ul>
                    {productos.map(p => (
                        <li key={p.Id}>
                            {p.Nombre} - ${p.Precio} - Stock: {p.Stock}
                        </li>
                    ))}
                </ul>
            </div>
        );
};

export default ProductoCrud;//Exporta el componente ProductoCrud para que pueda ser utilizado en otros archivos