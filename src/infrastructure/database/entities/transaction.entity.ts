import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { TransactionStatus, TransactionType } from '../../../domain/entities/transaction.entity';

@Entity('transactions')
export class TransactionEntity extends BaseEntity {
  @Column({ unique: true })
  @Index()
  reference: string;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column({ length: 3 })
  currency: string;

  @Column({
    type: 'enum',
    enum: TransactionStatus,
    default: TransactionStatus.PENDING
  })
  status: TransactionStatus;

  @Column({
    type: 'enum',
    enum: TransactionType,
    default: TransactionType.PAYMENT
  })
  type: TransactionType;

  @Column({ nullable: true })
  @Index()
  wompiTransactionId?: string;

  @Column({ nullable: true })
  wompiSessionId?: string;

  @Column()
  @Index()
  customerEmail: string;

  @Column({ nullable: true })
  customerName?: string;

  @Column({ nullable: true })
  customerPhone?: string;

  @Column({ nullable: true })
  description?: string;

  @Column('jsonb', { nullable: true })
  metadata?: Record<string, any>;

  @Column({ nullable: true })
  errorMessage?: string;

  @Column({ nullable: true })
  processedAt?: Date;
}
