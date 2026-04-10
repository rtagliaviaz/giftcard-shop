import {Entity, PrimaryGeneratedColumn, Column, ManyToMany, ManyToOne, JoinColumn} from "typeorm";
import { GiftCard, Orders } from "./GiftCardDatabase";

@Entity({ name: "order_items" }) // Maps this class to the 'order_items' table
export class OrderItems {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: "bigint", unsigned: true, name: "order_id" })
    orderId!: number; // Foreign key reference to Orders table
    
    @Column({ type: "int", name: "gift_card_id" })
    giftCardId!: number; // Foreign key reference to GiftCard table

    @Column({ type: "int", name: "quantity" })
    quantity!: number; // Quantity of this gift card in the order
    
    @Column({ type: "int", name: "unit_amount_usd" })
    unitAmount!: number; // Unit price of the gift card at the time of order

    @Column({ type: "int", name: "total_amount_usd" })
    totalAmount!: number; // Total price for this line item (quantity * unitAmount)


    //Relationships
    @ManyToOne(() => Orders, (order) => order.id, {
        onDelete: "CASCADE", // If an order is deleted, remove its items
        onUpdate: "CASCADE", // If an order's ID changes, update the item records
    })
   
    @JoinColumn({ name: "order_id" }) // Specifies the foreign key column
    order!: Orders; // This will allow us to easily access the related Order entity when needed

    @ManyToOne(() => GiftCard, (giftCard) => giftCard.id, {
        onDelete: "CASCADE", // If a gift card is deleted, remove its item records
        onUpdate: "CASCADE", // If a gift card's ID changes, update the item records
    })
    @JoinColumn({ name: "gift_card_id" }) // Specifies the foreign key column
    giftCard!: GiftCard; // This will allow us to easily access the related GiftCard entity when needed 
  }