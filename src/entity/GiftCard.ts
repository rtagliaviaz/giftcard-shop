// src/entity/GiftCard.ts
import { Entity, PrimaryGeneratedColumn, Column, Unique, OneToMany } from "typeorm";
import { OrderItems, GiftCardInventory } from "./GiftCardDatabase";

@Entity({ name: "gift_cards" }) // Maps this class to the 'gift_cards' table
@Unique(["name", "denomination"]) // Implements your unique key constraint
export class GiftCard {
    @PrimaryGeneratedColumn()
    id!: number; 
    @Column({ type: "varchar", length: 100 })
    name!: string;
    @Column({ type: "decimal", precision: 10, scale: 2 })
    denomination!: number;
    @Column({ type: "boolean", default: true })
    active!: boolean;
    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    created_at!: Date;

    //Relationships
    @OneToMany(() => OrderItems, (orderItem) => orderItem.giftCard)
    orderItems!: OrderItems[]; // This will allow us to easily access the related OrderItems entities when needed

    @OneToMany(() => GiftCardInventory, (inventory) => inventory.giftCard)
    inventory!: GiftCardInventory[]; // This will allow us to easily access the related GiftCardInventory entities when needed
}