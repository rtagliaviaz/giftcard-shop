import {Entity, PrimaryGeneratedColumn, Column, OneToMany, Index, CreateDateColumn} from "typeorm";
import { OrderItems } from "./GiftCardDatabase";

@Entity({name: "orders"}) 
export class Orders {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: "varchar", length: 32, unique: true })
    @Index()
    uid!: string; 

    @Column({ type: "varchar", length: 42 })
    address!: string; // Ethereum address derived from the XPUB and address index

    @Column({ type: "int", name: "address_index" })
    addressIndex!: number; // Index used to derive the Ethereum address from the XPUB

    @Column({ type: "varchar", length: 10})
    currency!: string; // Currency code "USDT"

    @Column({type: "varchar", name: "network"})
    network!: string; // Network name "sepolia"

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

    @CreateDateColumn({ type: "datetime", name: "created_at" })
    createdAt!: Date; // Timestamp when the order was created

    @Column({ type: "boolean", default: false })
    swept!: boolean; // Whether the order has been swept to the main wallet

    //Relationships
    @OneToMany(() => OrderItems, (orderItem) => orderItem.order)
    orderItems!: OrderItems[];

}
