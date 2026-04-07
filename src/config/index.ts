
import { SepoliaConfigInterface, MySQLConfigInterface } from '../types/ConfigInterfaces';
import dotenv from 'dotenv';
dotenv.config();


const config = {
  //sepolia with type safety
  sepolia: {
    SEPOLIA_RPC_URL: process.env.SEPOLIA_RPC_URL,
    SEPOLIA_XPUB: process.env.SEPOLIA_XPUB,
    SEPOLIA_MOCK_USDT_ADDRESS: process.env.SEPOLIA_MOCK_USDT_ADDRESS
  } as SepoliaConfigInterface,
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