import { Injectable, Inject, Logger } from '@nestjs/common';
import { BaseUseCase } from '../base/base.use-case';
import { TransactionRepositoryPort } from '../../../domain/ports/output/transaction.repository.port';
import { WompiServicePort } from '../../../domain/ports/output/wompi.service.port';
import { TransactionStatus } from '../../../domain/entities/transaction.entity';
import { Result, Success, Failure } from '../../../domain/ports';

export interface WebhookPayload {
  event: string;
  data: {
    transaction: {
      id: string;
      status: string;
      reference: string;
      amount_in_cents: number;
      currency: string;
      customer_email: string;
      status_message?: string;
      created_at: string;
      updated_at: string;
    };
  };
  timestamp: number;
  signature: {
    checksum: string;
    properties: string[];
  };
}

@Injectable()
export class ProcessWebhookUseCase extends BaseUseCase<WebhookPayload, void, never> {
  private readonly logger = new Logger(ProcessWebhookUseCase.name);

  constructor(
    @Inject('TransactionRepositoryPort')
    private readonly transactionRepository: TransactionRepositoryPort,
    @Inject('WompiServicePort')
    private readonly wompiService: WompiServicePort,
  ) {
    super();
  }

  async execute(payload: WebhookPayload): Promise<Result<void, never>> {
    try {
      this.logger.log(`🔄 Procesando webhook: ${payload.event} para transacción ${payload.data.transaction.id}`);

      // Validar el payload del webhook
      this.validateWebhookPayload(payload);

      // Verificar la firma del webhook
      const isValidSignature = await this.verifyWebhookSignature(payload);
      if (!isValidSignature) {
        this.logger.warn(`⚠️ Firma de webhook inválida para transacción ${payload.data.transaction.id}`);
        throw new Error('Invalid webhook signature');
      }

      // Buscar la transacción por el ID de Wompi
      const transaction = await this.findTransaction(payload.data.transaction.id);

      // Mapear el estado de Wompi al estado interno
      const newStatus = this.mapWompiStatus(payload.data.transaction.status);

      // Actualizar la transacción
      await this.updateTransaction(transaction.id, payload, newStatus);

      // Procesar acciones adicionales según el estado
      await this.processStatusActions(transaction, newStatus, payload);

      this.logger.log(`✅ Webhook procesado exitosamente: ${payload.event} -> ${newStatus}`);
      return new Success(undefined);

    } catch (error: any) {
      this.logger.error(`❌ Error procesando webhook: ${error.message}`, error.stack);
      return new Failure(error as never);
    }
  }

  private validateWebhookPayload(payload: WebhookPayload): void {
    if (!payload.event || !payload.data?.transaction?.id) {
      throw new Error('Invalid webhook payload structure');
    }

    if (!payload.data.transaction.status) {
      throw new Error('Transaction status is required');
    }

    if (!payload.data.transaction.reference) {
      throw new Error('Transaction reference is required');
    }

    if (!payload.data.transaction.amount_in_cents || payload.data.transaction.amount_in_cents <= 0) {
      throw new Error('Invalid transaction amount');
    }

    if (!payload.data.transaction.customer_email) {
      throw new Error('Customer email is required');
    }

    if (!payload.timestamp || payload.timestamp <= 0) {
      throw new Error('Invalid timestamp');
    }

    if (!payload.signature?.checksum) {
      throw new Error('Webhook signature is required');
    }
  }

  private async verifyWebhookSignature(payload: WebhookPayload): Promise<boolean> {
    try {
      // Crear el payload para verificación (excluyendo la firma)
      const payloadForVerification = {
        event: payload.event,
        data: payload.data,
        timestamp: payload.timestamp,
      };

      const payloadString = JSON.stringify(payloadForVerification);
      return await this.wompiService.verifySignature(payloadString, payload.signature.checksum);
    } catch (error) {
      this.logger.error(`❌ Error verificando firma: ${error.message}`);
      return false;
    }
  }

  private async findTransaction(wompiTransactionId: string): Promise<any> {
    const transaction = await this.transactionRepository.findByWompiTransactionId(wompiTransactionId);

    if (!transaction) {
      this.logger.warn(`⚠️ Transacción no encontrada para Wompi ID: ${wompiTransactionId}`);
      throw new Error(`Transaction not found for Wompi ID: ${wompiTransactionId}`);
    }

    this.logger.log(`📋 Transacción encontrada: ${transaction.reference} (${transaction.id})`);
    return transaction;
  }

  private async updateTransaction(transactionId: string, payload: WebhookPayload, newStatus: TransactionStatus): Promise<void> {
    const updateData = {
      status: newStatus,
      processedAt: new Date(),
      errorMessage: payload.data.transaction.status_message,
      metadata: {
        ...payload.data.transaction,
        webhookEvent: payload.event,
        webhookTimestamp: new Date(payload.timestamp * 1000).toISOString(),
        lastWebhookProcessed: new Date().toISOString(),
      },
    };

    await this.transactionRepository.update(transactionId, updateData);
    this.logger.log(`📝 Transacción actualizada: ${transactionId} -> ${newStatus}`);
  }

  private async processStatusActions(transaction: any, newStatus: TransactionStatus, payload: WebhookPayload): Promise<void> {
    try {
      switch (newStatus) {
        case TransactionStatus.APPROVED:
          await this.handleApprovedTransaction(transaction, payload);
          break;
        case TransactionStatus.DECLINED:
          await this.handleDeclinedTransaction(transaction, payload);
          break;
        case TransactionStatus.ERROR:
          await this.handleErrorTransaction(transaction, payload);
          break;
        case TransactionStatus.EXPIRED:
          await this.handleExpiredTransaction(transaction, payload);
          break;
        default:
          this.logger.log(`ℹ️ Estado ${newStatus} no requiere acciones adicionales`);
      }
    } catch (error) {
      this.logger.error(`⚠️ Error procesando acciones para estado ${newStatus}: ${error.message}`);
      // No lanzar error para evitar que falle el webhook completo
    }
  }

  private async handleApprovedTransaction(transaction: any, payload: WebhookPayload): Promise<void> {
    this.logger.log(`🎉 Transacción aprobada: ${transaction.reference}`);
    
    // Aquí puedes agregar lógica adicional para transacciones aprobadas:
    // - Enviar email de confirmación al cliente
    // - Generar factura
    // - Actualizar inventario
    // - Notificar a otros servicios
    // - etc.
    
    // Ejemplo de metadata adicional
    const additionalMetadata = {
      approvedAt: new Date().toISOString(),
      wompiApprovalData: {
        transactionId: payload.data.transaction.id,
        statusMessage: payload.data.transaction.status_message,
        approvedAt: payload.data.transaction.updated_at,
      },
    };

    await this.transactionRepository.update(transaction.id, {
      metadata: {
        ...transaction.metadata,
        ...additionalMetadata,
      },
    });
  }

  private async handleDeclinedTransaction(transaction: any, payload: WebhookPayload): Promise<void> {
    this.logger.log(`❌ Transacción declinada: ${transaction.reference}`);
    
    // Lógica para transacciones declinadas:
    // - Enviar email de notificación al cliente
    // - Liberar inventario reservado
    // - Registrar motivo del rechazo
    // - etc.
  }

  private async handleErrorTransaction(transaction: any, payload: WebhookPayload): Promise<void> {
    this.logger.log(`🚨 Transacción con error: ${transaction.reference}`);
    
    // Lógica para transacciones con error:
    // - Notificar al equipo técnico
    // - Registrar detalles del error
    // - Intentar recuperación automática si es posible
    // - etc.
  }

  private async handleExpiredTransaction(transaction: any, payload: WebhookPayload): Promise<void> {
    this.logger.log(`⏰ Transacción expirada: ${transaction.reference}`);
    
    // Lógica para transacciones expiradas:
    // - Liberar inventario reservado
    // - Notificar al cliente sobre la expiración
    // - Ofrecer crear nueva transacción
    // - etc.
  }

  private mapWompiStatus(wompiStatus: string): TransactionStatus {
    const statusMap: Record<string, TransactionStatus> = {
      'approved': TransactionStatus.APPROVED,
      'declined': TransactionStatus.DECLINED,
      'error': TransactionStatus.ERROR,
      'expired': TransactionStatus.EXPIRED,
      'pending': TransactionStatus.PENDING,
      'in_process': TransactionStatus.PENDING,
      'voided': TransactionStatus.DECLINED,
      'failed': TransactionStatus.ERROR,
      'cancelled': TransactionStatus.DECLINED,
      'rejected': TransactionStatus.DECLINED,
    };

    const mappedStatus = statusMap[wompiStatus.toLowerCase()];
    if (!mappedStatus) {
      this.logger.warn(`⚠️ Estado de Wompi no reconocido: ${wompiStatus}, usando PENDING`);
      return TransactionStatus.PENDING;
    }

    return mappedStatus;
  }
}
