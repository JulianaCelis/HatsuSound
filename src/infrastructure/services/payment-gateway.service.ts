import { Injectable, Logger, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WompiServicePort } from '../../domain/ports/output/wompi.service.port';

export interface PaymentGatewayConfig {
  provider: 'wompi' | 'stripe' | 'paypal';
  environment: 'sandbox' | 'staging' | 'production';
  apiKeys: Record<string, string>;
  wompiDetails?: any;
}

export interface CreatePaymentRequest {
  amount: number;
  currency: string;
  customerEmail: string;
  customerName?: string;
  customerPhone?: string;
  description?: string;
  metadata?: Record<string, any>;
  reference?: string;
}

export interface PaymentResponse {
  success: boolean;
  transactionId?: string;
  checkoutUrl?: string;
  error?: string;
  provider: string;
}

@Injectable()
export class PaymentGatewayService {
  private readonly logger = new Logger(PaymentGatewayService.name);
  private readonly config: PaymentGatewayConfig;
  private readonly wompiService: WompiServicePort;

  constructor(
    private readonly configService: ConfigService,
    @Inject('WompiServicePort')
    wompiService: WompiServicePort,
  ) {
    this.wompiService = wompiService;
    
    // Configuración del gateway de pagos
    this.config = {
      provider: this.configService.get<string>('PAYMENT_PROVIDER', 'wompi') as 'wompi' | 'stripe' | 'paypal',
      environment: this.configService.get<string>('PAYMENT_ENVIRONMENT', 'staging') as 'sandbox' | 'staging' | 'production',
      apiKeys: {
        wompi: this.configService.get<string>('WOMPI_PUBLIC_KEY'),
        stripe: this.configService.get<string>('STRIPE_PUBLISHABLE_KEY'),
        paypal: this.configService.get<string>('PAYPAL_CLIENT_ID'),
      },
    };

    this.logger.log(`Payment gateway initialized with provider: ${this.config.provider}`);
  }

  async createPayment(request: CreatePaymentRequest): Promise<PaymentResponse> {
    try {
      switch (this.config.provider) {
        case 'wompi':
          return await this.createWompiPayment(request);
        case 'stripe':
          return await this.createStripePayment(request);
        case 'paypal':
          return await this.createPayPalPayment(request);
        default:
          throw new Error(`Unsupported payment provider: ${this.config.provider}`);
      }
    } catch (error) {
      this.logger.error(`Error creating payment with ${this.config.provider}:`, error);
      return {
        success: false,
        error: error.message,
        provider: this.config.provider,
      };
    }
  }

  async getPaymentStatus(transactionId: string): Promise<any> {
    try {
      switch (this.config.provider) {
        case 'wompi':
          return await this.wompiService.getTransaction(transactionId);
        case 'stripe':
          return await this.getStripePaymentStatus(transactionId);
        case 'paypal':
          return await this.getPayPalPaymentStatus(transactionId);
        default:
          throw new Error(`Unsupported payment provider: ${this.config.provider}`);
      }
    } catch (error) {
      this.logger.error(`Error getting payment status with ${this.config.provider}:`, error);
      throw error;
    }
  }

  async testWompiConnection(): Promise<any> {
    if (this.config.provider !== 'wompi') {
      throw new Error('Wompi is not the configured payment provider');
    }

    try {
      // Test basic connectivity
      const configInfo = this.wompiService.getConfigurationInfo();
      this.logger.log('Wompi configuration info:', configInfo);

      // Test merchant info retrieval
      const merchantInfo = await this.wompiService.getMerchantInfo();
      this.logger.log('Wompi merchant info:', merchantInfo);

      return {
        success: true,
        message: 'Wompi connection test successful',
        config: configInfo,
        merchant: merchantInfo,
      };
    } catch (error) {
      this.logger.error('Wompi connection test failed:', error);
      return {
        success: false,
        message: 'Wompi connection test failed',
        error: error.message,
      };
    }
  }

  private async createWompiPayment(request: CreatePaymentRequest): Promise<PaymentResponse> {
    try {
      const wompiRequest = {
        amount_in_cents: request.amount,
        currency: request.currency,
        customer_email: request.customerEmail,
        payment_method: {
          type: 'CARD',
          installments: 1,
        },
        acceptance_token: 'TOKEN_ACEPTACION', // Will be replaced by service
        reference: request.reference || `PAY-${Date.now()}`,
        customer_data: {
          phone_number: request.customerPhone,
          full_name: request.customerName,
        },
        redirect_url: `${this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000')}/payment/result`,
        metadata: {
          ...request.metadata,
          source: 'payment_gateway_service',
        },
      };

      const wompiResponse = await this.wompiService.createTransaction(wompiRequest);

      return {
        success: true,
        transactionId: wompiResponse.data.id,
        checkoutUrl: this.wompiService.getCheckoutUrl(wompiResponse.data.id),
        provider: 'wompi',
      };
    } catch (error) {
      this.logger.error('Error creating Wompi payment:', error);
      return {
        success: false,
        error: error.message,
        provider: 'wompi',
      };
    }
  }

  private async createStripePayment(request: CreatePaymentRequest): Promise<PaymentResponse> {
    // Implementación para Stripe (placeholder)
    this.logger.warn('Stripe payment not implemented yet');
    return {
      success: false,
      error: 'Stripe payments not implemented yet',
      provider: 'stripe',
    };
  }

  private async createPayPalPayment(request: CreatePaymentRequest): Promise<PaymentResponse> {
    // Implementación para PayPal (placeholder)
    this.logger.warn('PayPal payment not implemented yet');
    return {
      success: false,
      error: 'PayPal payments not implemented yet',
      provider: 'paypal',
    };
  }

  private async getStripePaymentStatus(transactionId: string): Promise<any> {
    // Implementación para Stripe (placeholder)
    this.logger.warn('Stripe payment status not implemented yet');
    throw new Error('Stripe payment status not implemented yet');
  }

  private async getPayPalPaymentStatus(transactionId: string): Promise<any> {
    // Implementación para PayPal (placeholder)
    this.logger.warn('PayPal payment status not implemented yet');
    throw new Error('PayPal payment status not implemented yet');
  }

  getConfiguration(): PaymentGatewayConfig {
    return this.config;
  }

  getSupportedProviders(): string[] {
    return ['wompi', 'stripe', 'paypal'];
  }

  isProviderSupported(provider: string): boolean {
    return this.getSupportedProviders().includes(provider);
  }
}
