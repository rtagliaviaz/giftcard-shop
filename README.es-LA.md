# GIFTCARD SHOP 
[![License](https://img.shields.io/badge/license-MIT-blue.svg)]()
[![Node](https://img.shields.io/badge/node-%3E%3D%2018-brightgreen)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)]()
[![React](https://img.shields.io/badge/React-18.2-61dafb)]()
[![Vite](https://img.shields.io/badge/Vite-5.0-646CFF)]()
[![Hardhat](https://img.shields.io/badge/Hardhat-2.22-FFF)]()
[![Jest](https://img.shields.io/badge/Jest-passing-brightgreen)]()
[![Vitest](https://img.shields.io/badge/Vitest-passing-brightgreen)]()


[Inglés](./README.md) | [Español](./README.es-LA.md)

⚠️ **Nota importante: las criptomonedas utilizadas en este proyecto no son de la mainnet, sino de la testnet, lo que significa que no tienen valor real y se utilizan únicamente para fines de desarrollo y pruebas, por lo que tampoco se estan manejando los gas fees ya que practicamente son gratuitos.**

Este proyecto es una tienda de tarjetas de regalo que acepta pagos en criptomonedas. Permite a los usuarios comprar tarjetas de regalo digitales puediendo pagar con distintas criptomonedas sin necesidad de crear una cuenta, proporcionando una forma conveniente y segura de comprar tarjetas de regalo en línea.


# Indice
- [Demo](#demo)
- [Video Demo](#video-demo)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Seguridad](#seguridad)
- [Wallet de Prueba](#wallet-de-prueba)
- [Faucets](#faucets)
- [Solución de Problemas](#solución-de-problemas)
- [Backend](./backend/README.es-LA.md)
- [Contratos](./contracts/README.es-LA.md)
- [Frontend](./frontend/README.es-LA.md)

## Demo
https://rtagliavia.net/

## Video Demo
[![Video Demo](https://img.youtube.com/vi/9n2l8sXo5j0/0.jpg)](https://www.youtube.com/watch?v=9n2l8sXo5j0)

## Estructura del Proyecto
```
├── backend/
├── contracts/
├── frontend/
├── docker-compose.yml
├── README.es-LA.md
└── README.md
```


## Instalación
Para configurar el proyecto, es necesario instalar las dependencias tanto para el backend como para el frontend. para esto, navegar a cada directorio y ejecutar `npm install`, revisar los archivos README de cada directorio para más detalles.

Si se necesita desplegar su propio contrato mock USDT, se puede usar el contrato [MockUSDT](./contracts/MockUSDT)  desplegarlo a la testnet de Sepolia usando Hardhat (leer el archivo [README](./contracts/README.es-LA.md) del directorio contracts para mas detalles). Asegúrate de actualizar la variable `USDT_ADDRESS` en el archivo `.env` del backend con la dirección del contrato desplegado.

## Seguridad
### XPUB
- El proyecto utiliza una clave XPUB para generar direcciones de wallet únicas para cada compra de tarjeta de regalo. Esto permite al sistema rastrear los pagos sin necesidad de crear billeteras separadas para cada transacción, mejorando la seguridad y simplificando el proceso de pago. Además evita la exposición de claves privadas.

### Sweeper Wallet
- El proyecto utiliza una wallet alterna para consolidar los fondos de las direcciones generadas por la clave XPUB. Esta wallet recoge los pagos recibidos de los clientes y permite una gestión más fácil de los fondos, asegurando que estén almacenados de forma segura y puedan ser accedidos cuando sea necesario. El fin es evitar que en caso de un ataque se pierdan los fondos.

## Wallet de Prueba
para este proyecto utilice Metamask como wallet, por lo que para probar el proyecto es necesario tener una wallet compatible con Ethereum y conectada a la testnet de `Sepolia Testnet` y `Base Sepolia`. 

para agregar la red de `Base Sepolia` a Metamask, puedes seguir los pasos de esta [guia](https://revoke.cash/es/learn/wallets/add-network/base-sepolia)

## Faucets
### USDT 
- para este proyecto cree un token USDT simulado en la testnet de Sepolia, si usas Metamask puedes ir a la testnet de sepolia, importar el token y agregar la dirección del contrato del token y mintear algunos tokens USDT de prueba a tu billetera. La dirección del contrato del token es: `0x56C60aa5a381bBDFfDfdB6045c772C67f50F5C90` (nota: este es un token simulado y no tiene valor real).

### USDC
- https://faucet.circle.com/ : solo necesitas la dirección de tu wallet y seleccionar el token USDC en Base Sepolia Testnet.

### ETH para la Testnet Base Sepolia
- coinbase.com: necesita una cuenta de Coinbase, pero es la forma más fácil de obtener ETH y USDC de prueba para Base Sepolia Testnet.

### ETH  Sepolia Testnet
- https://cloud.google.com/application/web3/faucet/ethereum/sepolia: puedes obtener algo de ETH de prueba para Sepolia conectando tu wallet y completando un captcha.

## Solución de Problemas
### `Socket connection failed`
- Verifica que la variable `VITE_WS_URL` en el archivo `.env` del frontend apunte a la URL correcta del backend (por ejemplo, `http://localhost:3000`).
- Confirma que no haya un firewall bloqueando las actualizaciones de WebSocket.
- Verifica que la variable `CLIENT_URL` en el backend coincida con la URL del frontend.

### `Cannot mint mock USDT – missing revert data`
- Asegúrate de estar utilizando la clave privada del **owner** del contrato (la que desplegó el contrato).
- Verifica que la dirección del contrato en el archivo `.env` sea correcta.

### `Order not detected after payment`
- Asegúrate de que el backend esté corriendo y conectado a la red de Sepolia.
- Verifica que el `XPUB` configurado en el backend sea correcto y corresponda a la frase mnemotécnica utilizada para generar las direcciones de las órdenes.
- Comprueba que la transacción de pago se haya confirmado en la red de Sepolia y que se haya enviado a una dirección derivada del `XPUB`.

### `Database connection error`
- Verifica que las credenciales de la base de datos (host, puerto, usuario, contraseña, nombre) estén correctamente configuradas en el archivo `.env`.
- Verifica que el container de la base de datos esté corriendo y accesible desde el backend.
- Revisa los logs del backend para obtener más detalles sobre el error de conexión a la base de datos.

### `xpubs or addresses mismatch`
- Asegurate de que la frase mnemotécnica utilizada para generar el `XPUB` sea la misma que se usó para generar las direcciones de las órdenes.
- La ruta de derivación debe ser `m/44'/60'/0'` para el `XPUB` de la cuenta.
- La dirección del índice `0` debe coincidir con la primera dirección derivada de tu wallet.

### `Sweeper fails with "insufficient funds for gas"`
- Asegúrate de que la wallet que va a enviar fondos a la sweeper tenga suficiente ETH para cubrir las tarifas de gas. En caso de necesitar ETH de prueba, revisa la sección de [Faucets](#faucets).