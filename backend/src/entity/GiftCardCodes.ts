// GiftCardCodes.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { GiftCard, OrderItems } from "./GiftCardDatabase";

@Entity({ name: "gift_card_codes" })
export class GiftCardCodes {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: "varchar", length: 255, nullable: false, unique: true })
    code!: string;

    @ManyToOne(() => GiftCard)
    @JoinColumn({ name: "gift_card_id" }) 
    giftCard!: GiftCard;

    @ManyToOne(() => OrderItems, { nullable: true })
    @JoinColumn({ name: "order_item_id" }) 
    orderItem!: OrderItems | null;

    @Column({ type: "datetime", nullable: true, name: "delivered_at" })
    deliveredAt!: Date | null;

    @Column({ type: "boolean", default: false })
    used!: boolean; // to track if the backend already sent this code to a customer (to avoid sending duplicates in case of retries)
}