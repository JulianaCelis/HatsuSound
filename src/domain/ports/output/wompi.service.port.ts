import { TransactionStatus } from '../../entities/transaction.entity';

export interface WompiCreateTransactionRequest {
  amount_in_cents: number;
  currency: string;
  customer_email: string;
  payment_method: {
    type: string;
    installments?: number;
  };
  acceptance_token: string;
  reference: string;
  customer_data?: {
    phone_number?: string;
    full_name?: string;
  };
  shipping_address?: {
    address_line_1: string;
    address_line_2?: string;
    city: string;
    region: string;
    country: string;
    postal_code: string;
  };
  payment_link_id?: string;
  expires_at?: string;
  redirect_url?: string;
  metadata?: Record<string, any>;
}

export interface WompiTransactionResponse {
  data: {
    id: string;
    status: string;
    amount_in_cents: number;
    currency: string;
    reference: string;
    customer_email: string;
    payment_method: {
      type: string;
      installments?: number;
    };
    status_message?: string;
    created_at: string;
    updated_at: string;
  };
}

export interface WompiServicePort {
  createTransaction(request: WompiCreateTransactionRequest): Promise<WompiTransactionResponse>;
  getTransaction(transactionId: string): Promise<WompiTransactionResponse>;
  createPaymentLink(request: any): Promise<any>;
  verifySignature(payload: string, signature: string): Promise<boolean>;
  
  // 👉 necesario para usarlo desde el use-case
  getCheckoutUrl(transactionId: string): string;
  getApiUrl(): string;
  
  // 👉 métodos adicionales para el controlador
  getConfigurationInfo(): any;
  validateConfiguration(): Promise<boolean>;
  getMerchantInfo(): Promise<any>;
  
  // 👉 método para crear tokens de métodos de pago
  createPaymentMethodToken(cardData: {
    number: string;
    cvc: string;
    expMonth: string;
    expYear: string;
    cardHolderName: string;
  }): Promise<string>;
}
