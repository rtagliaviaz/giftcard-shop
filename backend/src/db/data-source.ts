// db/data-source.ts
import "reflect-metadata";
import { DataSource } from "typeorm";
import { GiftCard, GiftCardInventory, OrderItems, Orders, PaymentTransactions, GiftCardCodes, Settings } from "../entity/GiftCardDatabase";
import config from "../config";

const isTest = process.env.NODE_ENV === 'test';

export const AppDataSource = new DataSource(
  isTest
    ? {
        type: "sqlite",
        database: ":memory:",
        synchronize: true,
        entities: [GiftCard, GiftCardInventory, OrderItems, Orders, PaymentTransactions, GiftCardCodes, Settings],
      }
    : {
        type: "mysql",
        host: config.mysql.giftcardShopDb.host,
        port: config.mysql.giftcardShopDb.port,
        username: config.mysql.giftcardShopDb.user,
        password: config.mysql.giftcardShopDb.password,
        database: config.mysql.giftcardShopDb.database,
        synchronize: false,
        logging: true,
        entities: [GiftCard, GiftCardInventory, OrderItems, Orders, PaymentTransactions, GiftCardCodes, Settings],
        migrations: [],
      }
);