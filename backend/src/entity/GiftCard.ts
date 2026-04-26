import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { GiftCardType } from './GiftCardType';

@Entity('gift_cards')
export class GiftCard {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    denomination!: number;

    @Column({ default: true })
    active!: boolean;

    @Column({ name: 'created_at', default: () => 'CURRENT_TIMESTAMP' })
    createdAt!: Date;

    @ManyToOne(() => GiftCardType)
    @JoinColumn({ name: 'type_id' })
    type!: GiftCardType;
}