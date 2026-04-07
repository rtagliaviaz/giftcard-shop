import {Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn} from "typeorm";
import { GiftCard } from "./GiftCard";

@Entity({ name: "gift_card_inventory" }) // Maps this class to the 'gift_card_inventory' table
export class GiftCardInventory {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: "int" })
    quantity!: number;

    //Relation to GiftCard entity can be added later if needed, for now we just store the gift_card_id as a foreign key reference

    @ManyToOne(() => GiftCard, (giftCard) => giftCard.id, {
        onDelete: "CASCADE", // If a gift card is deleted, remove its inventory records
        onUpdate: "CASCADE", // If a gift card's ID changes, update the inventory records
    })
    @JoinColumn({ name: "gift_card_id" }) // Specifies the foreign key column
    giftCard!: GiftCard; // This will allow us to easily access the related GiftCard entity when needed   
}