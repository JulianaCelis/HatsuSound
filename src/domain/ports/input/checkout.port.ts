import { Transaction, TransactionStatus } from '../../entities/transaction.entity';

export interface CreateCheckoutRequest {
  amount: number;
  currency: string;
  customerEmail: string;
  customerName?: string;
  customerPhone?: string;
  description?: string;
  metadata?: Record<string, any>;
  reference?: string;
  
  // Product information
  productId: string;
  productName: string;
  productCategory: string;
  productArtist?: string;
  productGenre?: string;
  productFormat?: string;
  
  // Payment method
  paymentMethodToken?: string;
}

export interface CheckoutResponse {
  success: boolean;
  transaction?: Transaction;
  checkoutUrl?: string;
  error?: string;
  errorCode?: string;
  wompiTransactionId?: string;
  amount?: number;
  currency?: string;
  reference?: string;
  paymentType?: 'direct' | 'intent';
}

export interface CheckoutPort {
  createCheckout(request: CreateCheckoutRequest): Promise<CheckoutResponse>;
  processWebhook(payload: any): Promise<void>;
  getTransactionStatus(transactionId: string): Promise<TransactionStatus>;
}
