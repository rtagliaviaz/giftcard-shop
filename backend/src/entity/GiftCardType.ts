import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { GiftCard } from './GiftCardDatabase';

@Entity('gift_card_types')
export class GiftCardType {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ unique: true })
    name!: string;

    @Column()
    image!: string;

    @Column({ default: true })
    active!: boolean;

    @OneToMany(() => GiftCard, giftCard => giftCard.type)
    denominations!: GiftCard[];
}