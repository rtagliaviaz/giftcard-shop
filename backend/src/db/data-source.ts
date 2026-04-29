// db/data-source.ts
import "reflect-metadata";
import { DataSource } from "typeorm";
import { GiftCard, OrderItems, Orders, GiftCardCodes, Settings, GiftCardType, SweepLog } from "../entity/GiftCardDatabase";
import config from "../config";

const isTest = process.env.NODE_ENV === 'test';

export const AppDataSource = new DataSource(
  isTest
    ? {
        type: "sqlite",
        database: ":memory:",
        synchronize: true,
        entities: [GiftCard, OrderItems, Orders, GiftCardCodes, Settings, GiftCardType, SweepLog],
      }
    : {
        type: "mysql",
        host: config.mysql.giftcardShopDb.host,
        port: config.mysql.giftcardShopDb.port,
        username: config.mysql.giftcardShopDb.user,
        password: config.mysql.giftcardShopDb.password,
        database: config.mysql.giftcardShopDb.database,
        synchronize: false,
        logging: false,
        entities: [GiftCard, OrderItems, Orders, GiftCardCodes, Settings, GiftCardType, SweepLog],
        migrations: [],
      }
);