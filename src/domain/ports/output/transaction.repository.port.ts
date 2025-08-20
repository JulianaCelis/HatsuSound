import { Transaction, TransactionStatus } from '../../entities/transaction.entity';
import { IBaseRepository } from '../../repositories/base.repository.interface';

export interface TransactionRepositoryPort extends IBaseRepository<Transaction> {
  findByReference(reference: string): Promise<Transaction | null>;
  findByWompiTransactionId(wompiTransactionId: string): Promise<Transaction | null>;
  findByStatus(status: TransactionStatus): Promise<Transaction[]>;
  findByCustomerEmail(email: string): Promise<Transaction[]>;
  create(transactionData: Partial<Transaction>): Promise<Transaction>;
  update(id: string, transactionData: Partial<Transaction>): Promise<Transaction | null>;
}
