import { Entity, PrimaryGeneratedColumn, Column, ManyToOne} from "typeorm";
import { Orders } from "./GiftCardDatabase";

@Entity({ name: "payment_transactions" }) // Maps this class to the 'payment_transactions' table
export class PaymentTransactions {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: "varchar", length: 66, nullable: false })
    transactionHash!: string; // Ethereum transaction hash

    @Column({ type: "varchar", length: 42, nullable: false })
    fromAddress!: string; // Ethereum address of the sender

    @Column({ type: "bigint", nullable: false })
    amount!: string; // Amount of Ether transferred

    @Column({ type: "int", nullable: false })
    confirmations!: number; // Number of confirmations for the transaction

    @Column({ type: "datetime", default: () => "CURRENT_TIMESTAMP" })
    receivedAt!: Date; // Timestamp when the transaction was recorded

    @ManyToOne(() => Orders, (order) => order.id, {
        onDelete: "CASCADE", // If an order is deleted, remove its transaction records
        onUpdate: "CASCADE", // If an order's ID changes, update the transaction records
    })
    order!: Orders; // This will allow us to easily access the related Order entity when needed
}