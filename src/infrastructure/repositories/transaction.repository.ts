import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransactionEntity } from '../database/entities/transaction.entity';
import { TransactionRepositoryPort } from '../../domain/ports/output/transaction.repository.port';
import { Transaction, TransactionStatus } from '../../domain/entities/transaction.entity';

@Injectable()
export class TransactionRepository implements TransactionRepositoryPort {
  constructor(
    @InjectRepository(TransactionEntity)
    private readonly repository: Repository<TransactionEntity>,
  ) {}

  async findByReference(reference: string): Promise<Transaction | null> {
    const entity = await this.repository.findOne({ where: { reference } });
    return entity ? this.mapToDomain(entity) : null;
  }

  async findByWompiTransactionId(wompiTransactionId: string): Promise<Transaction | null> {
    const entity = await this.repository.findOne({ where: { wompiTransactionId } });
    return entity ? this.mapToDomain(entity) : null;
  }

  async findByStatus(status: TransactionStatus): Promise<Transaction[]> {
    const entities = await this.repository.find({ where: { status } });
    return entities.map(entity => this.mapToDomain(entity));
  }

  async findByCustomerEmail(email: string): Promise<Transaction[]> {
    const entities = await this.repository.find({ where: { customerEmail: email } });
    return entities.map(entity => this.mapToDomain(entity));
  }

  async create(transactionData: Partial<Transaction>): Promise<Transaction> {
    const entity = new TransactionEntity();
    Object.assign(entity, transactionData);
    const savedEntity = await this.repository.save(entity);
    return this.mapToDomain(savedEntity);
  }

  async update(id: string, transactionData: Partial<Transaction>): Promise<Transaction | null> {
    await this.repository.update(id, transactionData as any);
    const updatedEntity = await this.repository.findOne({ where: { id } });
    return updatedEntity ? this.mapToDomain(updatedEntity) : null;
  }

  async findById(id: string): Promise<Transaction | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? this.mapToDomain(entity) : null;
  }

  async findAll(): Promise<Transaction[]> {
    const entities = await this.repository.find();
    return entities.map(entity => this.mapToDomain(entity));
  }

  async save(transaction: Transaction): Promise<Transaction> {
    const entity = new TransactionEntity();
    Object.assign(entity, transaction);
    const savedEntity = await this.repository.save(entity);
    return this.mapToDomain(savedEntity);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return result.affected !== 0;
  }

  private mapToDomain(entity: TransactionEntity): Transaction {
    return {
      id: entity.id,
      reference: entity.reference,
      amount: entity.amount,
      currency: entity.currency,
      status: entity.status,
      type: entity.type,
      wompiTransactionId: entity.wompiTransactionId,
      wompiSessionId: entity.wompiSessionId,
      customerEmail: entity.customerEmail,
      customerName: entity.customerName,
      customerPhone: entity.customerPhone,
      description: entity.description,
      metadata: entity.metadata,
      errorMessage: entity.errorMessage,
      processedAt: entity.processedAt,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
