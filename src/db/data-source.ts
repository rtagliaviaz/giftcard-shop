import "reflect-metadata";
import { DataSource } from "typeorm";
// import { GiftCard } from "../entity/GiftCard"; 
import { GiftCard, GiftCardInventory, OrderItems, Orders, PaymentTransactions, GiftCardCodes } from "../entity/GiftCardDatabase";
import config from "../config"; 

const { mysql } = config;

export const AppDataSource = new DataSource({
    type: "mysql",
    host: mysql.giftcardShopDb.host,
    port: mysql.giftcardShopDb.port,
    username: mysql.giftcardShopDb.user,
    password: mysql.giftcardShopDb.password,
    database: mysql.giftcardShopDb.database,
    synchronize: false, // Set to false in production! We'll use migrations.
    logging: true,      // Logs SQL queries to the console
    entities: [GiftCard, GiftCardInventory, OrderItems, Orders, PaymentTransactions, GiftCardCodes], // Add all your entities here
    migrations: [],      // We'll add migration paths later
    subscribers: [],
});