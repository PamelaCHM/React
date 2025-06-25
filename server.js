const express = require('express');
const sql = require('mssql');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Configuración de conexión a SQL Server
const dbConfig = {
    user: 'sa',//el usuario con elñ que se inicia session en la BD
    password: 'sa',//La contraseña del usuario
    server: 'PAULA_M\SQLEXPRESS', //el no,bre del servidor de la BD
    database: 'VentasDB',
    options: {
        encrypt: false, // true si usas Azure
        trustServerCertificate: true // importante para desarrollo local
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