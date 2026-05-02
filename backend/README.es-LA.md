# Backend

Este documento proporciona informacion como la estructura del proyecto, paquetes utilizados, instrucciones de instalación, endpoints de la API y el esquema de la base de datos del proyecto.

# Indice
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Paquetes](#paquetes)
- [Instalación](#instalación)
- [Tests](#tests)
- [Variables de Entorno](#variables-de-entorno)
- [Endpoints de la API](#endpoints-de-la-api)
- [Base de Datos](#base-de-datos)
- [Eventos de Socket.io](#eventos-de-socketio)
- [Scripts](#scripts)

## Estructura del Proyecto

```
├── database/
│   └── init.sql
├── src/
│   ├── __tests__/
│   ├── config/
│   ├── constants/
│   ├── controllers/
│   ├── db/
│   ├── entity/
│   ├── middleware/
│   ├── routes/
│   ├── scripts/
│   ├── services/
│   ├── socket/
│   ├── types/
│   ├── app.ts
│   ├── index.ts
│   └── server.ts
├── .env
├── .env.example
├── .gitignore
├── jest.config.cjs
├── package-lock.json
├── package.json
├── README.es-ES.md
├── README.md
└── tsconfig.json
```

## Paquetes

- `cors`: Middleware para habilitar Cross-Origin Resource Sharing (CORS) en Express.
- `dotenv`: Carga variables de entorno desde un archivo `.env`.
- `ethers`: Biblioteca para interactuar con la blockchain de Ethereum, la usaremos para manejar los pagos y transacciones.
- `express`: Framework web para Node.js.
- `express-rate-limit`: Middleware para limitar la tasa de solicitudes a la API.
- `jest`: Framework de pruebas.
- `mysql2`: Cliente MySQL para Node.js para interactuar con la base de datos.
- `nanoid`: Generador de IDs únicos.
- `nodemailer`: Biblioteca para enviar correos electrónicos, utilizada para enviar confirmaciones de pedidos y notificaciones a los clientes.
- `socket.io`: Biblioteca para comunicación en tiempo real entre el cliente y el servidor.
- `sqlite3`: Controlador de base de datos para SQLite, utilizado en pruebas con Jest y TypeORM.
- `supertest`: Biblioteca para probar servidores HTTP, utilizada junto con Jest para pruebas de endpoints de la API.
- `ts-node`: Ejecutor de TypeScript para Node.js.
- `typeorm`: ORM para TypeScript y JavaScript.
- `typescript`: Lenguaje de programación que se compila a JavaScript.
- `@scure/bip32`: Biblioteca para trabajar con billeteras jerárquicas deterministas BIP32, utilizada para generar direcciones a partir de una clave pública extendida (xpub).
- `@types/express`, `@types/node`, `@types/jest`, etc.: Tipos de TypeScript para las bibliotecas utilizadas.

## Instalación
para instalar las dependencias del proyecto, ejecuta el siguiente comando en la raíz del proyecto asumiendo que tienes Node.js y npm instalados y esas ubicado en el directorio `backend`:

```bash
npm install
```

## Tests
para ejecutar los tests, usa el siguiente comando en la raíz del proyecto `backend`:

```bash
npm run test
```

## Variables de Entorno
las variables de entorno se deben configurar en un archivo `.env` en la raíz del proyecto. Puedes usar el archivo `.env.example` como plantilla para crear tu propio archivo `.env` con los valores adecuados para tu entorno de desarrollo.


| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `PORT` | Puerto para el servidor Express | `3000` |
| `CLIENT_URL` | URL del frontend | `http://localhost:3001` |
| `XPUB` | Clave pública extendida (derivada de la misma frase semilla) | `xpub6...` |
| `SEPOLIA_NAME` | Nombre de la red Sepolia | `sepolia` |
| `SEPOLIA_CHAIN_ID` | ID de la cadena Sepolia | `11155111` |
| `SEPOLIA_RPC_URL` | Endpoint HTTP RPC de Sepolia | `https://sepolia.infura.io/v3/<api-key>` |
| `SEPOLIA_RPC_WS_URL` | Endpoint WebSocket RPC de Sepolia | `wss://sepolia.infura.io/ws/v3/<api-key>` |
| `SEPOLIA_CURRENCY` | Símbolo de la moneda de Sepolia | `USDT` |
| `SEPOLIA_MOCK_USDT_ADDRESS` | Dirección del contrato mock de USDT en Sepolia | `0x56C60aa5...` |
| `SEPOLIA_DECIMALS` | Decimales para USDT en Sepolia | `6` |
| `BASE_SEPOLIA_NAME` | Nombre de la red Base Sepolia | `base-sepolia` |
| `BASE_SEPOLIA_CHAIN_ID` | ID de la cadena Base Sepolia | `84532`|
| `BASE_SEPOLIA_RPC_URL` | Endpoint HTTP RPC de Base Sepolia | `https://sepolia.base.org` |
| `BASE_SEPOLIA_RPC_WS_URL` | Endpoint WebSocket RPC de Base Sepolia | `wss://base-sepolia.infura.io/ws/v3/<api-key>` |
| `BASE_SEPOLIA_CURRENCY` | Símbolo de la moneda de Base Sepolia | `USDC` |
| `BASE_SEPOLIA_USDC_ADDRESS` | Dirección del contrato USDC en Base Sepolia | `0x036CbD53...` |
| `BASE_SEPOLIA_DECIMALS` | Decimales para USDC en Base Sepolia | `6` |
| `MYSQL_*` | Credenciales de la base de datos (host, puerto, usuario, contraseña, nombre) | más información en `.env.example` |
| `EMAIL_HOST` | Host del servidor de correo electrónico | `smtp.example.com` |
| `EMAIL_PORT` | Puerto del servidor de correo electrónico | `587` |
| `EMAIL_SECURE` | Indica si se debe usar una conexión segura (true para puerto 465, false para 587) | `false` |
| `EMAIL_AUTH_USER` | Usuario del servidor de correo electrónico | `user@example.com` |
| `EMAIL_AUTH_PASS` | Contraseña del servidor de correo electrónico | `password` |
| `SWEEPER_INTERVAL_MS` | Intervalo para el script sweeper en milisegundos | `900000` |
| `SWEEPER_TREASURY_ADDRESS` | Dirección de la tesorería para el script sweeper | `0x...` |
| `SWEEPER_MNEMONIC` | Frase mnemotécnica para la wallet que se usará en el script sweeper | `test test ... junk` |
| `WALLET_MNEMONIC` | Frase mnemotécnica para el script de generación de xpub | `test test ... junk` |
| `GAS_WALLET_PRIVATE_KEY` | Clave privada para la wallet de gas | `0x...` |
| `GAS_AMOUNT` | Cantidad de gas a utilizar para las transacciones | `0.0005` |


## Endpoints de la API
### `GET /api/health`: Endpoint de salud para verificar que el servidor está funcionando.
- **Endpoint**: `/api/health`
- **Método**: `GET`
- **Códigos de Estado**:
  - `200 OK`: El servidor está saludable.
- **Respuesta**:
```json
{
  "status": "ok"
}
```

### `POST /api/create-order`: Crea una nueva orden.
- **Endpoint**: `/api/create-order`
- **Método**: `POST`
- **Headers**:
  - `Content-Type: application/json`
- **Cuerpo de la Solicitud**:
```json
{
  "email": "customer@example.com",
  "items": [
    {
      "giftCardTypeId": 1,
      "quantity": 2,
      "unitAmountUSD": 25
    }
  ],
  "totalAmountRaw": 50000000, //total price in cents (quantity * unitAmountUSD) with decimals (6 for USDT/USDC),
  "network": "sepolia" //or "base-sepolia"
}
```
- **Códigos de Estado**:
  - `201 Created`: Orden creada exitosamente.
  - `400 Bad Request`: Cuerpo de la solicitud inválido o campos faltantes.
  - `500 Internal Server Error`: Error al crear la orden.
- **Respuesta**:
```json
{
  "uid": "unique_order_id",
  "address": "derived_wallet_address_for_payment",
  "expiresAt": "2024-01-01T00:00:00.000Z"
}
```

### `GET /api/order-status/:uid`: Obtiene los detalles de una orden por su UID.
- **Endpoint**: `/api/order-status/:uid`
- **Método**: `GET`
- **Códigos de Estado**:
  - `200 OK`: Orden encontrada y devuelta exitosamente.
  - `404 Not Found`: No se encontró ninguna orden con el UID proporcionado.
- **Respuesta**:
```json
{
  "paid": false, // o true
  "address": "derived_wallet_address_for_payment",
  "expectedAmount": "50.000000", // cantidad legible por humanos con decimales
  "expiresAt": "2024-01-01T00:00:00.000Z",
  "status": "pending", // estados posibles: "pending", "paid", "cancelled", "expired"
  "network": "sepolia", // o "base-sepolia"
  "currency": "USDT" // o "USDC"
}
```

### `GET /api/order-codes/:uid`: Obtiene los códigos de una orden por su UID.
- **Endpoint**: `/api/order-codes/:uid`
- **Método**: `GET`
- **Códigos de Estado**:
  - `200 OK`: Códigos obtenidos exitosamente.
  - `400 Bad Request`: Orden no pagada aún o UID inválido.
  - `404 Not Found`: No se encontró ninguna orden con el UID proporcionado.
- **Respuesta**:
```json
[
  {
    "code": "CODE1234567890",
    "giftCardId": 1,
    "giftCardType": "Amazon Gift Card",
    "deliveredAt": "2024-01-01T00:00:00.000Z",
    "denomination": 5.00
  },
  {
    "code": "CODE0987654321",
    "giftCardId": 2,
    "giftCardType": "Amazon Gift Card",
    "deliveredAt": "2024-01-01T00:00:00.000Z",
    "denomination": 10.00
  }
]
```

### `GET /api/gift-card-types`: Obtiene la lista de tipos de tarjetas de regalo disponibles.
- **Endpoint**: `/api/gift-card-types`
- **Método**: `GET`
- **Códigos de Estado**:
  - `200 OK`: Tipos de tarjetas de regalo obtenidos exitosamente.
  - `500 Internal Server Error`: Error al obtener los tipos de tarjetas de regalo.
- **Respuesta**:
```json
[
  {
    "id": 1,
    "name": "Steam Gift Card",
    "image": "https://example.com/steam.png",
    "denominations": [
      {
        "id": 1,
        "value": 5.00
      },
      {
        "id": 2,
        "value": 10.00
      }
    ]
  },
  {
    "id": 2,
    "name": "Amazon Gift Card",
    "image": "https://example.com/amazon.png",
    "denominations": [
      {
        "id": 6,
        "value": 10.00
      },
      {
        "id": 7,
        "value": 25.00
      }
    ]
  }
]
```

### `GET /api/gift-card-types/:id`: Obtiene los detalles de un tipo de tarjeta de regalo por su ID.
- **Endpoint**: `/api/gift-card-types/:id`
- **Método**: `GET`
- **Códigos de Estado**:
  - `200 OK`: Tipo de tarjeta de regalo obtenido exitosamente.
  - `404 Not Found`: No se encontró ningún tipo de tarjeta de regalo con el ID proporcionado.
  - `500 Internal Server Error`: Error al obtener el tipo de tarjeta de regalo.
- **Respuesta**:
```json
{
  "id": 1,
  "name": "Steam Gift Card",
  "image": "https://example.com/steam.png",
  "denominations": [
    {
      "id": 1,
      "amount": 5.00
    },
    {
      "id": 2,
      "amount": 10.00
    }
  ]
}
```

## Base de Datos
todas las tablas y relaciones de la base de datos se definen en el archivo [database/init.sql](database/init.sql) y en las entidades de TypeORM ubicadas en `src/entity/`. Estas entidades representan las tablas de la base de datos y sus relaciones, y se utilizan para interactuar con la base de datos a través de TypeORM.

## Eventos de Socket.io
- `connection`: Evento que se dispara cuando un cliente se conecta al servidor de Socket.io.
- `disconnect`: Evento que se dispara cuando un cliente se desconecta del servidor de Socket.io.
- `order-codes`: Evento personalizado que se emite para enviar los códigos de una orden al cliente en tiempo real.
- `order-paid`: Evento personalizado que se emite para notificar al cliente que su orden ha sido pagada.
- `cancel-order`: Evento personalizado que se emite para notificar al cliente que su orden ha sido cancelada.
- `order-cancelled`: Evento personalizado que se emite para notificar al cliente que su orden ha sido cancelada por el sistema debido a la falta de pago dentro del tiempo límite.

## Scripts

### Sweeper (`sweeper.ts`)
Script para (barrer) los fondos de las órdenes pagadas a una cuenta alternativa con el fin de proteger los fondos y mantener la seguridad de las transacciones.

El script `sweeper.ts` se encarga de comprobar los saldos de los monederos de los usuarios asociados a
las órdenes y de transferir los fondos a la dirección de la cuenta alternativa (tesorería). Se conecta a la cadena de bloques mediante ethers.js, recupera el saldo de cada monedero y, si hay fondos disponibles, inicia una transferencia a la cuenta alternativa.

El script utiliza la función `getWalletForIndex` para obtener el monedero de cada orden basándose en un índice (el indice lo toma de las ordenes pagadas en la tabla de `orders`), que normalmente se deriva de una frase mnemotécnica. En este caso, utiliza la variable de entorno `MNEMONIC` para generar el monedero. 

El script comprueba el saldo de la wallet para cada orden y, si el saldo es superior a cero, transfiere los fondos a la dirección de la cuenta alternativa (tesorería) especificada en la variable de entorno `TREASURY_ADDRESS`.


### Generate Xpub (`generate-xpub.ts`)
Script para generar una clave pública extendida (xpub) a partir de una frase (mnemonic) y una ruta de derivación específica, utilizada para generar direcciones de criptomonedas para las órdenes.

El script `generate-xpub.ts` se utiliza para generar una clave pública extendida (xpub) a partir de una frase mnemotécnica (mnemonic) y una ruta de derivación específica. La xpub se utiliza para generar direcciones de criptomonedas para las órdenes sin necesidad de exponer las claves privadas. El script toma la frase mnemotécnica y la ruta de derivación como entrada, genera la xpub correspondiente y la imprime en la consola. y este valor es el que se debe configurar en la variable de entorno `XPUB` para que el sistema pueda generar las direcciones de las órdenes correctamente.

### Uso de los Scripts
Para ejecutar cualquiera de los scripts, asegúrate de tener las variables de entorno necesarias configuradas en tu archivo `.env`, luego puedes ejecutar el script usando el siguiente comando en la terminal, ubicado en el directorio `backend`:

sweeper:
```bash
npm run script:sweeper
```

generación de xpub:
```bash
npm run script:generate-xpub
```

### ⚠️ Nota de Seguridad ⚠️
> Para este proyecto de portafolio se incluyeron ambos scripts dentro del mismo repositorio para facilitar la demostración de la funcionalidad, sin embargo, en un entorno de producción real, es recomendable mantener estos scripts en un repositorio separado y con acceso restringido, ya que contienen información sensible como la frase mnemotécnica y las claves privadas. Además, se deben implementar medidas de seguridad adicionales para proteger esta información y garantizar la integridad de las transacciones. es preferiable ejecutarlos en un ambiente seguro y aislado, como un servidor dedicado o una función en la nube con permisos limitados.