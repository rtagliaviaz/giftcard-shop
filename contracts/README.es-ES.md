# Contracts

Este directorio contiene el contrato MockUSDT para el proyecto Giftcard Shop.

## Requisitos previos
- Node.js y npm instalados en tu máquina.
- hardhat instalado globalmente o como una dependencia de desarrollo en el proyecto.
- Una billetera compatible con Ethereum (por ejemplo, MetaMask) conectada a la red Sepolia Testnet.

## Instalación
1. Navega al directorio `contracts` en tu terminal.
2. Instala las dependencias necesarias ejecutando:
```bash
npm install
```
## Pruebas
Para ejecutar las pruebas del contrato MockUSDT, utiliza el siguiente comando en el directorio `contracts`:
```bash
npx hardhat test
```

## Variables de entorno
Antes de desplegar los contratos o ejecutar el script de minting, asegúrate de configurar las variables de entorno necesarias. Puedes crear un archivo `.env` en el directorio `contracts` basado en el archivo `.env.example` proporcionado. Las variables necesarias incluyen:
- `SEPOLIA_RPC_URL`: La URL RPC para la red Sepolia Testnet (se puede obtener en servicios como Infura o Alchemy).
- `SEPOLIA_PRIVATE_KEY`: La clave privada de la wallet que deseas usar para el despliegue y las transacciones (asegúrate de mantener esta clave segura y nunca compartirla).
- `MOCK_USDT_CONTRACT_ADDRESS`: La dirección del contrato MockUSDT desplegado en la red de Sepolia Testnet.
- `WALLET_ADDRESS`: La dirección de la wallet que recibirá los minted tokens.

nota: si estás usando Metamask, puedes obtener la clave privada yendo a la sección de cuentas -> haz clic en los tres puntos junto a la cuenta que deseas usar > haz clic en "Detalles de la cuenta" > haz clic en "Claves privadas" y sigue las instrucciones.

## Despliegue
Para desplegar el contrato MockUSDT a la red Sepolia Testnet, usa el siguiente comando:
```bash
npm run deploy:sepolia
```

Esto ejecutará el script de despliegue y desplegará el contrato a la red especificada. Después del despliegue, asegúrate de actualizar la variable `MOCK_USDT_CONTRACT_ADDRESS` en el archivo `.env` con la dirección del contrato recién desplegado.

## Minting Tokens

Para mintear/mintar tokens usando el contrato MockUSDT, ejecuta el script de minting con el siguiente comando:
```bash
npm run mint:sepolia
```