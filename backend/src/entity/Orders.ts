import {Entity, PrimaryGeneratedColumn, Column, OneToMany, Index, CreateDateColumn} from "typeorm";
import { OrderItems, PaymentTransactions } from "./GiftCardDatabase";

@Entity({name: "orders"}) // Maps this class to the 'orders' table
export class Orders {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: "varchar", length: 32, unique: true })
    @Index()
    uid!: string;   // public order identifier

    @Column({ type: "varchar", length: 42 })
    address!: string; // Ethereum address of the buyer

    @Column({ type: "int", name: "address_index" })
    addressIndex!: number; // Index used to derive the Ethereum address from the XPUB

    @Column({ type: "varchar", length: 10})
    currency!: string; // Currency code, e.g. "USDT"

    @Column({type: "varchar", name: "network"})
    network!: string; // Network name, e.g. "sepolia"

    @Column({ type: "varchar", length: 255})
    email!: string; // Buyer's email address

    @Column({ type: "varchar", length: 20, default: "pending" })
    status!: string; // Order status: "pending", "paid", "expired"

    @Column({ type: "bigint", name: "expected_amount" })
    expectedAmount!: number

    @Column({ type: "datetime", nullable: true , name: "paid_at" })
    paidAt!: Date | null; // Timestamp when the order was paid

    @Column({ type: "datetime", name: "expires_at" })
    expiresAt!: Date; // Timestamp when the order expires

    @Column({ type: "datetime", nullable: true, name: "whitdrawal_deadline" })
    withdrawnDeadline!: Date | null; // Timestamp by which the order must be withdrawn if not paid

    @Column({ type: "boolean", default: false, name: "terms_accepted" })
    termsAccepted!: boolean; // Whether the buyer accepted the terms and conditions

    @CreateDateColumn({ type: "datetime", name: "created_at" })
    createdAt!: Date; // Timestamp when the order was created

    @Column({ type: "boolean", default: false })
    swept!: boolean; // Whether the order has been swept to the main wallet

    //Relationships
    @OneToMany(() => OrderItems, (orderItem) => orderItem.order)
    orderItems!: OrderItems[]; // This will allow us to easily access the related OrderItems entities when needed

    @OneToMany(() => PaymentTransactions, (transaction) => transaction.order)
    paymentTransactions!: PaymentTransactions[]; // This will allow us to easily access the related PaymentTransactions entities when needed
}
