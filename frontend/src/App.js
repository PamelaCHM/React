import React from 'react';
import './App.css';    
import ProductoCrud from './components/producto';
import VentaForm    from './components/VentaForm';  // Importa 

function App() {
  return (
    <div className="App">
      <h1>Aplicación de Ventas</h1>
      <ProductoCrud />
      <hr />
      <VentaForm />                              
    </div>
  );
}

export default App;
