# Tienda App

Aplicación web básica en Node.js + Express para probar una base de datos TiDB Cloud (compatible con MySQL) con 3 tablas: clientes, productos y pedidos.

## Requisitos

- Node.js instalado (https://nodejs.org)
- Una base de datos ya creada en TiDB Cloud con las tablas `clientes`, `productos` y `pedidos`

## Instalación

1. Descarga o clona este proyecto.
2. Abre una terminal en la carpeta del proyecto y ejecuta:

   ```
   npm install
   ```

3. Crea el archivo `.env`.
4. Descarga el certificado CA desde TiDB Cloud (pestaña "Connect" de tu cluster, enlace "CA cert") y guárdalo en la carpeta del proyecto como `ca-cert.pem`.
5. Completa el archivo `.env` con tus datos de conexión de TiDB Cloud:

   ```
   DB_HOST=tu-host.tidbcloud.com
   DB_PORT=4000
   DB_USER=tu-usuario
   DB_PASSWORD=tu-password
   DB_NAME=tienda
   DB_CA_PATH=./ca-cert.pem
   PORT=3000
   ```

## Ejecutar la aplicación

```
npm start
```

Luego abre en el navegador: http://localhost:3000

## Funcionalidad

- **Clientes**: ver, agregar y eliminar clientes.
- **Productos**: ver, agregar y eliminar productos.
- **Pedidos**: ver, agregar y eliminar pedidos, relacionando cliente y producto.
