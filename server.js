require('dotenv').config();
const express = require('express');
const pool = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// ---------- INICIO ----------
app.get('/', (req, res) => {
  res.render('index');
});

// ---------- CLIENTES ----------
app.get('/clientes', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM clientes ORDER BY id DESC');
  res.render('clientes', { clientes: rows });
});

app.post('/clientes', async (req, res) => {
  const { nombre, email, telefono } = req.body;
  await pool.query(
    'INSERT INTO clientes (nombre, email, telefono) VALUES (?, ?, ?)',
    [nombre, email, telefono]
  );
  res.redirect('/clientes');
});

app.post('/clientes/eliminar/:id', async (req, res) => {
  await pool.query('DELETE FROM clientes WHERE id = ?', [req.params.id]);
  res.redirect('/clientes');
});

app.get('/clientes/editar/:id', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM clientes WHERE id = ?', [req.params.id]);
  if (rows.length === 0) return res.redirect('/clientes');
  res.render('clientes-editar', { cliente: rows[0] });
});

app.post('/clientes/editar/:id', async (req, res) => {
  const { nombre, email, telefono } = req.body;
  await pool.query(
    'UPDATE clientes SET nombre = ?, email = ?, telefono = ? WHERE id = ?',
    [nombre, email, telefono, req.params.id]
  );
  res.redirect('/clientes');
});

// ---------- PRODUCTOS ----------
app.get('/productos', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM productos ORDER BY id DESC');
  res.render('productos', { productos: rows });
});

app.post('/productos', async (req, res) => {
  const { nombre, precio, stock } = req.body;
  await pool.query(
    'INSERT INTO productos (nombre, precio, stock) VALUES (?, ?, ?)',
    [nombre, precio, stock]
  );
  res.redirect('/productos');
});

app.post('/productos/eliminar/:id', async (req, res) => {
  await pool.query('DELETE FROM productos WHERE id = ?', [req.params.id]);
  res.redirect('/productos');
});

app.get('/productos/editar/:id', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM productos WHERE id = ?', [req.params.id]);
  if (rows.length === 0) return res.redirect('/productos');
  res.render('productos-editar', { producto: rows[0] });
});

app.post('/productos/editar/:id', async (req, res) => {
  const { nombre, precio, stock } = req.body;
  await pool.query(
    'UPDATE productos SET nombre = ?, precio = ?, stock = ? WHERE id = ?',
    [nombre, precio, stock, req.params.id]
  );
  res.redirect('/productos');
});

// ---------- PEDIDOS ----------
app.get('/pedidos', async (req, res) => {
  const [pedidos] = await pool.query(`
    SELECT pedidos.id, clientes.nombre AS cliente, productos.nombre AS producto,
           pedidos.cantidad, pedidos.fecha
    FROM pedidos
    JOIN clientes ON pedidos.id_cliente = clientes.id
    JOIN productos ON pedidos.id_producto = productos.id
    ORDER BY pedidos.id DESC
  `);
  const [clientes] = await pool.query('SELECT id, nombre FROM clientes');
  const [productos] = await pool.query('SELECT id, nombre FROM productos');
  res.render('pedidos', { pedidos, clientes, productos });
});

app.post('/pedidos', async (req, res) => {
  const { id_cliente, id_producto, cantidad } = req.body;
  await pool.query(
    'INSERT INTO pedidos (id_cliente, id_producto, cantidad) VALUES (?, ?, ?)',
    [id_cliente, id_producto, cantidad]
  );
  res.redirect('/pedidos');
});

app.post('/pedidos/eliminar/:id', async (req, res) => {
  await pool.query('DELETE FROM pedidos WHERE id = ?', [req.params.id]);
  res.redirect('/pedidos');
});

app.get('/pedidos/editar/:id', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM pedidos WHERE id = ?', [req.params.id]);
  if (rows.length === 0) return res.redirect('/pedidos');
  const [clientes] = await pool.query('SELECT id, nombre FROM clientes');
  const [productos] = await pool.query('SELECT id, nombre FROM productos');
  res.render('pedidos-editar', { pedido: rows[0], clientes, productos });
});

app.post('/pedidos/editar/:id', async (req, res) => {
  const { id_cliente, id_producto, cantidad } = req.body;
  await pool.query(
    'UPDATE pedidos SET id_cliente = ?, id_producto = ?, cantidad = ? WHERE id = ?',
    [id_cliente, id_producto, cantidad, req.params.id]
  );
  res.redirect('/pedidos');
});

// En Vercel no usamos app.listen(): Vercel importa "app" y la maneja como función serverless.
// Localmente sí seguimos usando app.listen() para poder probar con npm start.
if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
  });
}

module.exports = app;
