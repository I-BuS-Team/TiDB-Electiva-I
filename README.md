# Tienda App

Link del ejercicio desplegado: https://tienda-app-eight.vercel.app/

Aplicación web básica en Node.js + Express para probar una base de datos TiDB Cloud (compatible con MySQL) con 3 tablas: clientes, productos y pedidos.

## Integrantes

- Laura Daniela Guevara Uribe
- Luis Esteban Robelto Zarabanda
- Laura Valentina Urueña Bejarano
- Sergio Alejandro Gómez Zapata


## Requisitos

- Node.js instalado (https://nodejs.org)
- Una base de datos ya creada en TiDB Cloud con las tablas `clientes`, `productos` y `pedidos`

## Instalación

1. Descarga o clona este proyecto.
2. Abre una terminal en la carpeta del proyecto y ejecuta:

   ```
   npm install
   ```

3. Crea un archivo llamado `.env` en la raíz del proyecto.
4. Los datos reales de conexión (host, usuario, contraseña, etc.) y el certificado `ca-cert.pem` se entregan aparte, ya que corresponden a la misma base de datos compartida usada para las pruebas. Coloca el `ca-cert.pem` recibido en la raíz del proyecto y completa el `.env` con los valores indicados en ese documento, siguiendo este formato:

   ```
   DB_HOST=tu-host.tidbcloud.com
   DB_PORT=4000
   DB_USER=tu-usuario
   DB_PASSWORD=tu-password
   DB_NAME=tienda
   DB_CA_PATH=./ca-cert.pem
   PORT=3000
   ```

## Evidencia de creación de la base de datos

La base de datos fue creada en **TiDB Cloud** (plan gratuito Starter), en un clúster llamado `db-prueba-electiva-I`, activo en la región de São Paulo (AWS):

![Cluster activo en TiDB Cloud](docs/evidencia-cluster-tidb.png)

Para crear y verificar las tablas (`clientes`, `productos`, `pedidos`) se utilizó **MySQL Workbench**, conectado directamente al clúster de TiDB Cloud mediante conexión SSL. La siguiente captura muestra los scripts `CREATE TABLE` e `INSERT` ejecutados, junto con el resultado de una consulta `SELECT * FROM clientes`:

![Tablas creadas y consultadas desde Workbench](docs/evidencia-tablas-workbench.png)

### Datos de conexión

Los parámetros de conexión (host, puerto, usuario, contraseña y nombre de la base de datos) no se incluyen directamente en este código por motivos de seguridad. Se configuran mediante variables de entorno en el archivo `.env` (ver documento Word, donde se encuentran los parametros necesarios).

El certificado `ca-cert.pem`, requerido por TiDB Cloud para la conexión SSL, se adjunta por fuera del repositorio (junto con el archivo word con los valores reales) para que el profesor pueda ejecutar y probar el proyecto sin necesidad de generar sus propias credenciales.

## Estructura del proyecto

Así debe quedar organizada la carpeta del proyecto:

![Estructura de carpetas del proyecto](docs/evidencia-estructura-proyecto.png)

## Ejecutar la aplicación

```
npm start
```

Luego abre en el navegador: http://localhost:3000

## Funcionalidad

- **Clientes**: ver, agregar y eliminar clientes.
- **Productos**: ver, agregar y eliminar productos.
- **Pedidos**: ver, agregar y eliminar pedidos, relacionando cliente y producto.

## Dificultades durante el desarrollo

Uno de los retos principales estuvo relacionado directamente con la base de datos: TiDB Cloud exige que toda conexión se haga obligatoriamente por SSL, usando un certificado CA (`ca-cert.pem`) proporcionado por el propio servicio. Al principio la conexión desde la aplicación fallaba porque no se estaba cargando correctamente ese certificado. Además, al intentar desplegar la aplicación en Vercel, el archivo `ca-cert.pem` no podía subirse al repositorio (por ser un archivo sensible ligado a la conexión), por lo que fue necesario adaptar el código para leer el contenido del certificado desde una variable de entorno (`DB_CA_CONTENT`) en lugar de depender de un archivo físico, permitiendo así que la app se conectara a la base de datos tanto en local como en producción sin comprometer las credenciales.
