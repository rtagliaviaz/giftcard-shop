import {Entity, PrimaryGeneratedColumn, Column, ManyToMany, ManyToOne, JoinColumn} from "typeorm";
import { GiftCard, Orders } from "./GiftCardDatabase";

@Entity({ name: "order_items" })
export class OrderItems {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: "bigint", unsigned: true, name: "order_id" })
    orderId!: number; // foreign key reference to Orders 
    
    @Column({ type: "int", name: "gift_card_id" })
    giftCardId!: number; // foreign key reference to GiftCard 

    @Column({ type: "int", name: "quantity" })
    quantity!: number; // quantity of this gift card 
    
    @Column({ type: "int", name: "unit_amount_usd" })
    unitAmount!: number; // unit price of the gift card 

    @Column({ type: "int", name: "total_amount_usd" })
    totalAmount!: number; // total price (quantity * unitAmount)


    //Relationships
    @ManyToOne(() => Orders, (order) => order.id, {
        onDelete: "CASCADE", 
        onUpdate: "CASCADE", 
    })
   
    @JoinColumn({ name: "order_id" }) 
    order!: Orders; 

    @ManyToOne(() => GiftCard, (giftCard) => giftCard.id, {
        onDelete: "CASCADE",
        onUpdate: "CASCADE", 
    })
    @JoinColumn({ name: "gift_card_id" }) 
    giftCard!: GiftCard;  
  }