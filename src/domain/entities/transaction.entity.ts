import { BaseEntity } from './base.entity';

export enum TransactionStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  DECLINED = 'declined',
  ERROR = 'error',
  EXPIRED = 'expired'
}

export enum TransactionType {
  PAYMENT = 'payment',
  REFUND = 'refund'
}

export interface Transaction extends BaseEntity {
  reference: string;
  amount: number;
  currency: string;
  status: TransactionStatus;
  type: TransactionType;
  wompiTransactionId?: string;
  wompiSessionId?: string;
  customerEmail: string;
  customerName?: string;
  customerPhone?: string;
  description?: string;
  metadata?: Record<string, any>;
  errorMessage?: string;
  processedAt?: Date;
}
