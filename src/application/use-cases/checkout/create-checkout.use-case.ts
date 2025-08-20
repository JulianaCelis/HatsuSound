import { Injectable, Inject, Logger } from '@nestjs/common';
import { BaseUseCase } from '../base/base.use-case';
import {
  CreateCheckoutRequest,
  CheckoutResponse,
} from '../../../domain/ports/input/checkout.port';
import { TransactionRepositoryPort } from '../../../domain/ports/output/transaction.repository.port';
import { WompiServicePort } from '../../../domain/ports/output/wompi.service.port';
import {
  Transaction,
  TransactionStatus,
  TransactionType,
} from '../../../domain/entities/transaction.entity';
import { v4 as uuidv4 } from 'uuid';
import { Result, Success, Failure } from '../../../domain/ports';

@Injectable()
export class CreateCheckoutUseCase extends BaseUseCase<
  CreateCheckoutRequest,
  CheckoutResponse,
  CheckoutResponse
> {
  private readonly logger = new Logger(CreateCheckoutUseCase.name);

  constructor(
    @Inject('TransactionRepositoryPort')
    private readonly transactionRepository: TransactionRepositoryPort,
    @Inject('WompiServicePort')
    private readonly wompiService: WompiServicePort,
  ) {
    super();
  }

  async execute(request: CreateCheckoutRequest): Promise<Result<CheckoutResponse, CheckoutResponse>> {
    try {
      this.logger.log(`🛒 Iniciando checkout para ${request.customerEmail} - ${request.amount} ${request.currency}`);

      // Validar datos de entrada
      const validationResult = this.validateRequest(request);
      if (validationResult.isFailure()) {
        return validationResult;
      }

      // Generar referencia única si no se proporciona
      const reference = request.reference || this.generateReference(request);

      // Crear la transacción en la base de datos
      const transaction = await this.createLocalTransaction(request, reference);

      // Crear la transacción en Wompi
      const wompiResponse = await this.createWompiTransaction(request, reference);

      // Actualizar la transacción local con el ID de Wompi
      await this.updateLocalTransaction(transaction.id, wompiResponse);

      const payload: CheckoutResponse = {
        success: true,
        transaction: {
          ...transaction,
          wompiTransactionId: wompiResponse.data.id,
          status: this.mapWompiStatus(wompiResponse.data.status),
        },
        checkoutUrl: request.paymentMethodToken ? undefined : this.wompiService.getCheckoutUrl(wompiResponse.data.id),
        wompiTransactionId: wompiResponse.data.id,
        amount: request.amount,
        currency: request.currency,
        reference,
        paymentType: request.paymentMethodToken ? 'direct' : 'intent',
      };

      this.logger.log(`✅ Checkout creado exitosamente: ${reference} -> ${wompiResponse.data.id}`);
      return new Success(payload);

    } catch (error: any) {
      this.logger.error(`❌ Error creando checkout: ${error.message}`, error.stack);
      
      const payload: CheckoutResponse = {
        success: false,
        error: this.getUserFriendlyError(error),
        errorCode: this.getErrorCode(error),
      };

      return new Failure(payload);
    }
  }

  private validateRequest(request: CreateCheckoutRequest): Result<CheckoutResponse, CheckoutResponse> {
    if (!request.amount || request.amount < 1000) {
      const payload: CheckoutResponse = {
        success: false,
        error: 'El monto debe ser al menos 1000 centavos (10.00)',
        errorCode: 'INVALID_AMOUNT',
      };
      return new Failure(payload);
    }

    if (!request.currency || !['COP', 'USD', 'EUR'].includes(request.currency)) {
      const payload: CheckoutResponse = {
        success: false,
        error: 'Moneda no válida. Debe ser COP, USD o EUR',
        errorCode: 'INVALID_CURRENCY',
      };
      return new Failure(payload);
    }

    if (!request.customerEmail || !this.isValidEmail(request.customerEmail)) {
      const payload: CheckoutResponse = {
        success: false,
        error: 'Email del cliente no válido',
        errorCode: 'INVALID_EMAIL',
      };
      return new Failure(payload);
    }

    if (!request.productId || !request.productName || !request.productCategory) {
      const payload: CheckoutResponse = {
        success: false,
        error: 'Información del producto incompleta',
        errorCode: 'INVALID_PRODUCT_DATA',
      };
      return new Failure(payload);
    }

    return new Success({} as CheckoutResponse); // Solo para indicar que la validación pasó
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private generateReference(request: CreateCheckoutRequest): string {
    const timestamp = Date.now();
    const random = uuidv4().substring(0, 8);
    const product = request.productId.replace(/[^a-zA-Z0-9]/g, '').substring(0, 10);
    return `${product.toUpperCase()}-${timestamp}-${random}`;
  }

  private async createLocalTransaction(request: CreateCheckoutRequest, reference: string): Promise<Transaction> {
    const transaction: Partial<Transaction> = {
      reference,
      amount: request.amount,
      currency: request.currency,
      status: TransactionStatus.PENDING,
      type: TransactionType.PAYMENT,
      customerEmail: request.customerEmail,
      customerName: request.customerName,
      customerPhone: request.customerPhone,
      description: request.description || this.generateDescription(request),
      metadata: {
        ...request.metadata,
        productId: request.productId,
        productName: request.productName,
        productCategory: request.productCategory,
        productArtist: request.productArtist,
        productGenre: request.productGenre,
        productFormat: request.productFormat,
        createdAt: new Date().toISOString(),
      },
    };

    return await this.transactionRepository.create(transaction);
  }

  private generateDescription(request: CreateCheckoutRequest): string {
    const parts = [
      `Compra de ${request.productCategory.toLowerCase()}`,
      `"${request.productName}"`,
    ];

    if (request.productArtist) {
      parts.push(`por ${request.productArtist}`);
    }

    if (request.productFormat) {
      parts.push(`(${request.productFormat})`);
    }

    return parts.join(' ');
  }

  private async createWompiTransaction(request: CreateCheckoutRequest, reference: string): Promise<any> {
    // Determinar el tipo de transacción basado en si se proporciona paymentMethodToken
    if (request.paymentMethodToken) {
      // Flujo de pago directo con token
      return await this.createDirectPaymentTransaction(request, reference);
    } else {
      // Flujo de transacción de intención (checkout session)
      return await this.createIntentTransaction(request, reference);
    }
  }

  private async createDirectPaymentTransaction(request: CreateCheckoutRequest, reference: string): Promise<any> {
    const wompiRequest = {
      amount_in_cents: request.amount,
      currency: request.currency,
      customer_email: request.customerEmail,
      payment_method: {
        type: 'CARD',
        token: request.paymentMethodToken,
        installments: 1,
      },
      acceptance_token: 'TOKEN_ACEPTACION', // El servicio lo reemplaza automáticamente
      reference,
      customer_data: {
        phone_number: request.customerPhone,
        full_name: request.customerName || request.customerEmail.split('@')[0],
      },
      redirect_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/result`,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 horas
      metadata: {
        product_id: request.productId,
        product_name: request.productName,
        product_category: request.productCategory,
        product_artist: request.productArtist,
        product_genre: request.productGenre,
        product_format: request.productFormat,
        source: 'hatsusound_backend',
        version: '1.0.0',
        payment_type: 'direct',
      },
    };

    this.logger.log(`💳 Creando transacción de pago directo en Wompi: ${reference}`);
    return await this.wompiService.createTransaction(wompiRequest);
  }

  private async createIntentTransaction(request: CreateCheckoutRequest, reference: string): Promise<any> {
    const wompiRequest = {
      amount_in_cents: request.amount,
      currency: request.currency,
      customer_email: request.customerEmail,
      payment_method: {
        type: 'CARD',
        installments: 1, // Pago de contado
      },
      acceptance_token: 'TOKEN_ACEPTACION', // El servicio lo reemplaza automáticamente
      reference,
      customer_data: {
        phone_number: request.customerPhone,
        full_name: request.customerName || request.customerEmail.split('@')[0],
      },
      redirect_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/result`,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 horas
      metadata: {
        product_id: request.productId,
        product_name: request.productName,
        product_category: request.productCategory,
        product_artist: request.productArtist,
        product_genre: request.productGenre,
        product_format: request.productFormat,
        source: 'hatsusound_backend',
        version: '1.0.0',
        payment_type: 'intent',
      },
    };

    this.logger.log(`🔄 Creando transacción de intención en Wompi: ${reference}`);
    return await this.wompiService.createTransaction(wompiRequest);
  }

  private async updateLocalTransaction(transactionId: string, wompiResponse: any): Promise<void> {
    const updateData = {
      wompiTransactionId: wompiResponse.data.id,
      status: this.mapWompiStatus(wompiResponse.data.status),
      metadata: {
        wompiStatus: wompiResponse.data.status,
        wompiCreatedAt: wompiResponse.data.created_at,
        wompiUpdatedAt: wompiResponse.data.updated_at,
        wompiStatusMessage: wompiResponse.data.status_message,
      },
    };

    await this.transactionRepository.update(transactionId, updateData);
    this.logger.log(`📝 Transacción local actualizada: ${transactionId} -> ${wompiResponse.data.id}`);
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
    };

    return statusMap[wompiStatus.toLowerCase()] || TransactionStatus.PENDING;
  }

  private getUserFriendlyError(error: any): string {
    // Errores específicos de Wompi
    if (error.message.includes('Wompi')) {
      if (error.message.includes('401')) {
        return 'Error de autenticación con el servicio de pagos';
      }
      if (error.message.includes('403')) {
        return 'Acceso denegado al servicio de pagos';
      }
      if (error.message.includes('422')) {
        // Errores de validación específicos de Wompi
        if (error.message.includes('token') || error.message.includes('No está presente')) {
          return 'Token de método de pago inválido o expirado';
        }
        if (error.message.includes('payment_method')) {
          return 'Método de pago inválido o no soportado';
        }
        return 'Datos de pago inválidos';
      }
      if (error.message.includes('500')) {
        return 'El servicio de pagos no está disponible en este momento';
      }
      return 'Error en el servicio de pagos. Intenta más tarde.';
    }

    // Errores de validación
    if (error.message.includes('monto') || error.message.includes('amount')) {
      return 'El monto especificado no es válido';
    }
    if (error.message.includes('moneda') || error.message.includes('currency')) {
      return 'La moneda especificada no es válida';
    }
    if (error.message.includes('email')) {
      return 'El email del cliente no es válido';
    }
    if (error.message.includes('producto')) {
      return 'La información del producto está incompleta';
    }

    // Error genérico
    return 'Error al procesar el checkout. Verifica los datos e intenta nuevamente.';
  }

  private getErrorCode(error: any): string {
    if (error.message.includes('Wompi')) {
      if (error.message.includes('401')) return 'AUTH_ERROR';
      if (error.message.includes('403')) return 'FORBIDDEN';
      if (error.message.includes('422')) {
        // Códigos específicos para errores de validación
        if (error.message.includes('token') || error.message.includes('No está presente')) {
          return 'INVALID_PAYMENT_TOKEN';
        }
        if (error.message.includes('payment_method')) {
          return 'INVALID_PAYMENT_METHOD';
        }
        return 'VALIDATION_ERROR';
      }
      if (error.message.includes('500')) return 'SERVICE_UNAVAILABLE';
      return 'PAYMENT_GATEWAY_ERROR';
    }

    if (error.message.includes('monto') || error.message.includes('amount')) return 'INVALID_AMOUNT';
    if (error.message.includes('moneda') || error.message.includes('currency')) return 'INVALID_CURRENCY';
    if (error.message.includes('email')) return 'INVALID_EMAIL';
    if (error.message.includes('producto')) return 'INVALID_PRODUCT_DATA';

    return 'INTERNAL_ERROR';
  }
}
