const pool = require('./db');

async function fixIDs() {
  const connection = await pool.getConnection();
  try {
    console.log('Iniciando reordenamiento de IDs...');
    await connection.query('SET FOREIGN_KEY_CHECKS = 0;');

    // 1. Clientes
    const [clientes] = await connection.query('SELECT * FROM clientes ORDER BY id ASC;');
    console.log(`Encontrados ${clientes.length} clientes.`);
    for (let i = 0; i < clientes.length; i++) {
      const oldId = clientes[i].id;
      const newId = i + 1;
      if (oldId !== newId) {
        console.log(`Cambiando cliente ID ${oldId} -> ${newId}`);
        await connection.query('UPDATE pedidos SET id_cliente = ? WHERE id_cliente = ?;', [newId, oldId]);
        await connection.query('UPDATE clientes SET id = ? WHERE id = ?;', [newId, oldId]);
      }
    }
    await connection.query(`ALTER TABLE clientes AUTO_INCREMENT = ${clientes.length + 1};`);
    try {
      await connection.query('ALTER TABLE clientes AUTO_ID_CACHE = 1;');
    } catch (e) {
      console.log('Nota AUTO_ID_CACHE clientes:', e.message);
    }

    // 2. Productos
    const [productos] = await connection.query('SELECT * FROM productos ORDER BY id ASC;');
    console.log(`Encontrados ${productos.length} productos.`);
    for (let i = 0; i < productos.length; i++) {
      const oldId = productos[i].id;
      const newId = i + 1;
      if (oldId !== newId) {
        console.log(`Cambiando producto ID ${oldId} -> ${newId}`);
        await connection.query('UPDATE pedidos SET id_producto = ? WHERE id_producto = ?;', [newId, oldId]);
        await connection.query('UPDATE productos SET id = ? WHERE id = ?;', [newId, oldId]);
      }
    }
    await connection.query(`ALTER TABLE productos AUTO_INCREMENT = ${productos.length + 1};`);
    try {
      await connection.query('ALTER TABLE productos AUTO_ID_CACHE = 1;');
    } catch (e) {
      console.log('Nota AUTO_ID_CACHE productos:', e.message);
    }

    // 3. Pedidos
    const [pedidos] = await connection.query('SELECT * FROM pedidos ORDER BY id ASC;');
    console.log(`Encontrados ${pedidos.length} pedidos.`);
    for (let i = 0; i < pedidos.length; i++) {
      const oldId = pedidos[i].id;
      const newId = i + 1;
      if (oldId !== newId) {
        console.log(`Cambiando pedido ID ${oldId} -> ${newId}`);
        await connection.query('UPDATE pedidos SET id = ? WHERE id = ?;', [newId, oldId]);
      }
    }
    await connection.query(`ALTER TABLE pedidos AUTO_INCREMENT = ${pedidos.length + 1};`);
    try {
      await connection.query('ALTER TABLE pedidos AUTO_ID_CACHE = 1;');
    } catch (e) {
      console.log('Nota AUTO_ID_CACHE pedidos:', e.message);
    }

    await connection.query('SET FOREIGN_KEY_CHECKS = 1;');
    console.log('¡Reordenamiento completado exitosamente!');
  } catch (err) {
    console.error('Error durante el proceso:', err);
  } finally {
    connection.release();
    process.exit(0);
  }
}

fixIDs();
