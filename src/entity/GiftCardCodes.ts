import {Entity, PrimaryGeneratedColumn, Column, ManyToOne} from "typeorm";
import { GiftCard, OrderItems } from "./GiftCardDatabase";

@Entity({ name: "gift_card_codes" }) // Maps this class to the 'gift_card_codes' table
export class GiftCardCodes {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: "varchar", length: 255, nullable: false, unique: true })
    code!: string;

    @ManyToOne(() => GiftCard, (giftCard) => giftCard.id, {
        onDelete: "CASCADE", // If a gift card is deleted, remove its code records
        onUpdate: "CASCADE", // If a gift card's ID changes, update the code records
    })
    giftCard!: GiftCard; // This will allow us to easily access the related GiftCard entity when needed
    @ManyToOne(() => OrderItems, (orderItem) => orderItem.id, {
        onDelete: "SET NULL", // If an order item is deleted, set the orderItem reference to null
        onUpdate: "CASCADE", // If an order item's ID changes, update the code records
    })
    orderItem!: OrderItems | null; // This will allow us to easily access the related OrderItems entity when needed, but it can be null if the code is not yet associated with an order item

    @Column({ type: "timestamp", nullable: true })
    createdAt!: Date; // Timestamp when the gift card code was created

    @Column({ type: "timestamp", nullable: true })
    expiresAt!: Date | null; // Timestamp when the gift card code expires, null if not yet expired 
}