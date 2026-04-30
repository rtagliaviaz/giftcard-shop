import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Orders } from './Orders';

@Entity({ name: 'sweep_log' })
export class SweepLog {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'order_id', type: 'bigint', unsigned: true })
  orderId!: number;

  @ManyToOne(() => Orders)
  @JoinColumn({ name: 'order_id' })
  order!: Orders;

  @Column({ name: 'tx_hash', length: 66 })
  txHash!: string;

  @Column({ name: 'from_address', length: 42 })
  fromAddress!: string;

  @Column({ type: 'bigint' })
  amount!: number; 

  @CreateDateColumn({ name: 'swept_at', type: 'datetime' })
  sweptAt!: Date;
}