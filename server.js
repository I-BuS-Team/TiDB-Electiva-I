require('dotenv').config();
const express = require('express');
const pool = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Middleware para formatear fechas de manera entendible en las vistas en zona horaria local
app.use((req, res, next) => {
  res.locals.formatFecha = (fecha) => {
    if (!fecha) return '-';
    let d = fecha instanceof Date ? fecha : new Date(fecha);
    if (typeof fecha === 'string' && !fecha.endsWith('Z') && !fecha.includes('+')) {
      d = new Date(fecha.replace(' ', 'T') + 'Z');
    }
    if (isNaN(d.getTime())) return fecha;
    return d.toLocaleString('es-CO', {
      timeZone: 'America/Bogota',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };
  next();
});

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
  const [[{ maxId }]] = await pool.query('SELECT COALESCE(MAX(id), 0) AS maxId FROM clientes');
  const nextId = maxId + 1;
  await pool.query(
    'INSERT INTO clientes (id, nombre, email, telefono, fecha_registro) VALUES (?, ?, ?, ?, NOW())',
    [nextId, nombre, email, telefono]
  );
  res.redirect('/clientes');
});

app.post('/clientes/eliminar/:id', async (req, res) => {
  try {
    // Primero eliminamos los pedidos asociados al cliente para evitar error de Clave Foránea
    await pool.query('DELETE FROM pedidos WHERE id_cliente = ?', [req.params.id]);
    await pool.query('DELETE FROM clientes WHERE id = ?', [req.params.id]);
  } catch (error) {
    console.error('Error al eliminar cliente:', error.message);
  }
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
  const precioVal = Math.max(0, parseFloat(precio) || 0);
  const stockVal = Math.max(0, parseInt(stock) || 0);
  const [[{ maxId }]] = await pool.query('SELECT COALESCE(MAX(id), 0) AS maxId FROM productos');
  const nextId = maxId + 1;
  await pool.query(
    'INSERT INTO productos (id, nombre, precio, stock) VALUES (?, ?, ?, ?)',
    [nextId, nombre, precioVal, stockVal]
  );
  res.redirect('/productos');
});

app.post('/productos/eliminar/:id', async (req, res) => {
  try {
    // Primero eliminamos los pedidos asociados al producto para evitar error de Clave Foránea
    await pool.query('DELETE FROM pedidos WHERE id_producto = ?', [req.params.id]);
    await pool.query('DELETE FROM productos WHERE id = ?', [req.params.id]);
  } catch (error) {
    console.error('Error al eliminar producto:', error.message);
  }
  res.redirect('/productos');
});

app.get('/productos/editar/:id', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM productos WHERE id = ?', [req.params.id]);
  if (rows.length === 0) return res.redirect('/productos');
  res.render('productos-editar', { producto: rows[0] });
});

app.post('/productos/editar/:id', async (req, res) => {
  const { nombre, precio, stock } = req.body;
  const precioVal = Math.max(0, parseFloat(precio) || 0);
  const stockVal = Math.max(0, parseInt(stock) || 0);
  await pool.query(
    'UPDATE productos SET nombre = ?, precio = ?, stock = ? WHERE id = ?',
    [nombre, precioVal, stockVal, req.params.id]
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
  const cantidadVal = Math.max(1, parseInt(cantidad) || 1);
  const [[{ maxId }]] = await pool.query('SELECT COALESCE(MAX(id), 0) AS maxId FROM pedidos');
  const nextId = maxId + 1;
  await pool.query(
    'INSERT INTO pedidos (id, id_cliente, id_producto, cantidad, fecha) VALUES (?, ?, ?, ?, NOW())',
    [nextId, id_cliente, id_producto, cantidadVal]
  );
  res.redirect('/pedidos');
});

app.post('/pedidos/eliminar/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM pedidos WHERE id = ?', [req.params.id]);
  } catch (error) {
    console.error('Error al eliminar pedido:', error.message);
  }
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
  const cantidadVal = Math.max(1, parseInt(cantidad) || 1);
  await pool.query(
    'UPDATE pedidos SET id_cliente = ?, id_producto = ?, cantidad = ? WHERE id = ?',
    [id_cliente, id_producto, cantidadVal, req.params.id]
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
