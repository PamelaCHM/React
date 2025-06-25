import React, { useState, useEffect } from 'react';

// Este componente es un ejemplo de todo lo que tienes que explicar
const ExplicacionReact = ({ nombre }) => {
  const [contador, setContador] = useState(0);
  const [mensaje, setMensaje] = useState('Cargando...');

  useEffect(() => {
    setTimeout(() => {
      setMensaje(`Hola, ${nombre}. Bienvenida a React!`);
    }, 1000);
  }, []);

  return (
    <div>
      <h2>{mensaje}</h2>
      <p>Contador: {contador}</p>
      <button onClick={() => setContador(contador + 1)}>Sumar</button>
    </div>
  );
};

export default ExplicacionReact;
