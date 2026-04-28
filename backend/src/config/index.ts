
import { MySQLConfigInterface, AppConfigInterface, NetworkConfigInterface   } from '../types/ConfigInterfaces';
import dotenv from 'dotenv';
dotenv.config();


const config: AppConfigInterface = {
  networks:{
    sepolia: {
      NAME: process.env.SEPOLIA_NAME,
      CHAIN_ID: Number(process.env.SEPOLIA_CHAIN_ID),
      RPC_URL: process.env.SEPOLIA_RPC_URL,
      XPUB: process.env.XPUB,
      CURRENCY_CONTRACT_ADDRESS: process.env.SEPOLIA_MOCK_USDT_ADDRESS,
      RPC_WS_URL: process.env.SEPOLIA_RPC_WS_URL,
      CURRENCY: process.env.SEPOLIA_CURRENCY,
      DECIMALS: Number(process.env.SEPOLIA_DECIMALS),
    } as NetworkConfigInterface,
    baseSepolia: {
      NAME: process.env.BASE_SEPOLIA_NAME,
      CHAIN_ID: Number(process.env.BASE_SEPOLIA_CHAIN_ID),
      RPC_URL: process.env.BASE_SEPOLIA_RPC_URL,
      RPC_WS_URL: process.env.BASE_SEPOLIA_WS_URL, 
      CURRENCY_CONTRACT_ADDRESS: process.env.BASE_SEPOLIA_USDC_ADDRESS, 
      CURRENCY: process.env.BASE_SEPOLIA_CURRENCY,
      DECIMALS: Number(process.env.BASE_SEPOLIA_DECIMALS),
    } as NetworkConfigInterface 
  },
  port: process.env.PORT,
  clientUrl: process.env.CLIENT_URL,
  mysql: {
    giftcardShopDb: {
      host: process.env.MYSQL_DATABASE_HOST,
      user: process.env.MYSQL_DATABASE_USER,
      password: process.env.MYSQL_DATABASE_PASSWORD,
      database: process.env.MYSQL_DATABASE_NAME,
      port: process.env.MYSQL_DATABASE_PORT
    } as MySQLConfigInterface
  }

}

export default config