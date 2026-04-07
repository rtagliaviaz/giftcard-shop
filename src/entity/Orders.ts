import {Entity, PrimaryGeneratedColumn, Column, OneToMany} from "typeorm";
import { OrderItems, PaymentTransactions } from "./GiftCardDatabase";

@Entity({name: "orders"}) // Maps this class to the 'orders' table
export class Orders {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: "varchar", length: 42 })
    address!: string; // Ethereum address of the buyer

    @Column({ type: "int" })
    addressIndex!: number; // Index used to derive the Ethereum address from the XPUB

    @Column({ type: "varchar", length: 10})
    currency!: string; // Currency code, e.g. "USDT"

    @Column({ type: "varchar", length: 255})
    email!: string; // Buyer's email address

    @Column({ type: "varchar", length: 20, default: "pending" })
    status!: string; // Order status: "pending", "paid", "expired"

    @Column({ type: "timestamp" })
    paidAt!: Date; // Timestamp when the order was paid

    @Column({ type: "timestamp" })
    expiresAt!: Date; // Timestamp when the order expires

    @Column({ type: "timestamp" })
    withdrawnDeadline!: Date; // Timestamp by which the order must be withdrawn if not paid

    @Column({ type: "boolean", default: false })
    termsAccepted!: boolean; // Whether the buyer accepted the terms and conditions

    @Column({ type: "timestamp" })
    createdAt!: Date; // Timestamp when the order was created

    @Column({ type: "boolean", default: false })
    swept!: boolean; // Whether the order has been swept to the main wallet

    //Relationships
    @OneToMany(() => OrderItems, (orderItem) => orderItem.order)
    orderItems!: OrderItems[]; // This will allow us to easily access the related OrderItems entities when needed

    @OneToMany(() => PaymentTransactions, (transaction) => transaction.order)
    paymentTransactions!: PaymentTransactions[]; // This will allow us to easily access the related PaymentTransactions entities when needed
}
