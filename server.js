const express = require('express');
const sql = require('mssql');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

const dbConfig = {
  user: 'sa',
  password: 'sa',
  server: 'localhost', // o '127.0.0.1'
  database: 'VentasDB',
  options: {
    encrypt: false,
    trustServerCertificate: true,
  }
};

// Obtener todos los productos
app.get('/productos', async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request().query('SELECT * FROM Productos');
    res.json(result.recordset);
  } catch (err) {
    console.error('Error al obtener productos:', err);
    res.status(500).send('Error al obtener productos');
  }
});

// Agregar producto
app.post('/productos', async (req, res) => {
  try {
    const { nombre, precio, stock } = req.body;
    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input('nombre', sql.VarChar(100), nombre)
      .input('precio', sql.Decimal(10, 2), precio)
      .input('stock', sql.Int, stock)
      .query('INSERT INTO Productos (Nombre, Precio, Stock) VALUES (@nombre, @precio, @stock)');
    res.status(201).send('Producto agregado');
  } catch (err) {
    console.error('Error al agregar producto:', err);
    res.status(500).send('Error al agregar producto');
  }
});

// Actualizar producto
app.put('/productos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, precio, stock } = req.body;
    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input('id', sql.Int, id)
      .input('nombre', sql.VarChar(100), nombre)
      .input('precio', sql.Decimal(10, 2), precio)
      .input('stock', sql.Int, stock)
      .query('UPDATE Productos SET Nombre = @nombre, Precio = @precio, Stock = @stock WHERE Id = @id');
    res.send('Producto actualizado');
  } catch (err) {
    console.error('Error al actualizar producto:', err);
    res.status(500).send('Error al actualizar producto');
  }
});

// Eliminar producto
app.delete('/productos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM Productos WHERE Id = @id');
    res.send('Producto eliminado');
  } catch (err) {
    console.error('Error al eliminar producto:', err);
    res.status(500).send('Error al eliminar producto');
  }
});

//*********************************************************************/

// Obtener todos los clientes
app.get('/clientes', async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool
      .request()
      .query('SELECT Id, Nombre FROM Clientes');
    res.json(result.recordset);
  } catch (err) {
    console.error('Error al obtener clientes:', err);
    res.status(500).send('Error al obtener clientes');
  }
});

// Crear una venta
app.post('/ventas', async (req, res) => {
  const { productoId, clienteId, cantidad } = req.body;
  try {
    const pool = await sql.connect(dbConfig);
    const tx = new sql.Transaction(pool);
    await tx.begin();

    // 1) Verificar que el producto existe y hay stock suficiente
    const prodReq = await tx.request()
      .input('prodId', sql.Int, productoId)
      .query('SELECT Stock FROM Productos WHERE Id = @prodId');
    if (prodReq.recordset.length === 0) {
      throw new Error('Producto no encontrado');
    }
    const stockActual = prodReq.recordset[0].Stock;
    if (stockActual < cantidad) {
      throw new Error('Stock insuficiente');
    }

    // 2) Insertar la venta
    await tx.request()
      .input('prodId', sql.Int, productoId)
      .input('cliId', sql.Int, clienteId)
      .input('cant', sql.Int, cantidad)
      .query(`
        INSERT INTO Ventas (ProductoId, ClienteId, Cantidad)
        VALUES (@prodId, @cliId, @cant);
      `);

    // 3) Descontar stock
    await tx.request()
      .input('prodId', sql.Int, productoId)
      .input('cant', sql.Int, cantidad)
      .query(`
        UPDATE Productos
        SET Stock = Stock - @cant
        WHERE Id = @prodId;
      `);

    await tx.commit();
    res.status(201).send('Venta creada correctamente');
  } catch (err) {
    if (tx) await tx.rollback();
    console.error('Error al crear venta:', err.message);
    res.status(400).send(err.message);
  }
});



// Conexión de prueba
app.get('/', async (req, res) => {
  try {
    let pool = await sql.connect(dbConfig);
    let result = await pool.request().query('SELECT 1 as resultado');
    res.send(result.recordset);
  } catch (err) {
    console.error('Error de conexión:', err);
    res.status(500).send('Error al conectar con la base de datos');
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

//*********************************************************************/

