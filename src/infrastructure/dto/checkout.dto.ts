import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNumber, IsString, IsOptional, IsObject, Min, IsEnum } from 'class-validator';

export class CreateCheckoutDto {
  @ApiProperty({
    description: 'Amount in cents (e.g., 50000 = $500.00)',
    example: 50000,
    minimum: 1000,
    type: 'number'
  })
  @IsNumber()
  @Min(1000)
  amount: number;

  @ApiProperty({
    description: 'Currency code',
    example: 'COP',
    default: 'COP',
    type: 'string',
    enum: ['COP', 'USD', 'EUR']
  })
  @IsEnum(['COP', 'USD', 'EUR'])
  currency: string;

  @ApiProperty({
    description: 'Customer email address',
    example: 'customer@example.com',
    type: 'string'
  })
  @IsEmail()
  customerEmail: string;

  // === PRODUCT INFORMATION ===
  @ApiProperty({
    description: 'Product ID being purchased',
    example: 'album_001',
    type: 'string'
  })
  @IsString()
  productId: string;

  @ApiProperty({
    description: 'Product name',
    example: 'HatsuSound Vol. 1',
    type: 'string'
  })
  @IsString()
  productName: string;

  @ApiProperty({
    description: 'Product category',
    example: 'Música',
    type: 'string'
  })
  @IsString()
  productCategory: string;

  @ApiPropertyOptional({
    description: 'Product artist/creator',
    example: 'HatsuSound Collective',
    type: 'string'
  })
  @IsOptional()
  @IsString()
  productArtist?: string;

  @ApiPropertyOptional({
    description: 'Product genre',
    example: 'Electronic',
    type: 'string'
  })
  @IsOptional()
  @IsString()
  productGenre?: string;

  @ApiPropertyOptional({
    description: 'Product format',
    example: 'Digital',
    type: 'string'
  })
  @IsOptional()
  @IsString()
  productFormat?: string;

  // === CUSTOMER INFORMATION ===
  @ApiPropertyOptional({
    description: 'Customer full name',
    example: 'Juan Pérez',
    type: 'string'
  })
  @IsOptional()
  @IsString()
  customerName?: string;

  @ApiPropertyOptional({
    description: 'Customer phone number with country code',
    example: '+573001234567',
    type: 'string'
  })
  @IsOptional()
  @IsString()
  customerPhone?: string;

  @ApiPropertyOptional({
    description: 'Transaction description (auto-generated if not provided)',
    example: 'Compra de álbum "HatsuSound Vol. 1"',
    type: 'string'
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Additional metadata for the transaction',
    example: { 
      releaseDate: '2025-01-15',
      trackCount: 12,
      duration: '45:30',
      quality: '320kbps'
    },
    type: 'object'
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Custom reference for the transaction',
    example: 'ALBUM-001-2025',
    type: 'string'
  })
  @IsOptional()
  @IsString()
  reference?: string;

  @ApiPropertyOptional({
    description: 'Payment method token for direct payment processing. If provided, payment will be processed immediately. If not provided, a checkout session will be created.',
    example: 'tok_test_12345',
    type: 'string'
  })
  @IsOptional()
  @IsString()
  paymentMethodToken?: string;
}

export class CheckoutResponseDto {
  @ApiProperty({
    description: 'Whether the checkout was created successfully',
    example: true,
    type: 'boolean'
  })
  success: boolean;

  @ApiPropertyOptional({
    description: 'Transaction details if successful',
    example: {
      id: 'txn_123456789',
      status: 'pending',
      amount: 50000,
      currency: 'COP',
      reference: 'TXN-123456',
      created_at: '2025-08-19T04:47:08.641Z'
    },
    type: 'object'
  })
  transaction?: any;

  @ApiPropertyOptional({
    description: 'URL to complete the checkout process',
    example: 'https://checkout.wompi.co/p/merchant_id?transaction_id=txn_123456789',
    type: 'string'
  })
  checkoutUrl?: string;

  @ApiPropertyOptional({
    description: 'Wompi transaction ID',
    example: 'txn_123456789',
    type: 'string'
  })
  wompiTransactionId?: string;

  @ApiPropertyOptional({
    description: 'Transaction amount in cents',
    example: 50000,
    type: 'number'
  })
  amount?: number;

  @ApiPropertyOptional({
    description: 'Transaction currency',
    example: 'COP',
    type: 'string'
  })
  currency?: string;

  @ApiPropertyOptional({
    description: 'Transaction reference',
    example: 'ALBUM-001-2025',
    type: 'string'
  })
  reference?: string;

  @ApiPropertyOptional({
    description: 'Error message if checkout failed',
    example: 'Payment gateway connection failed',
    type: 'string'
  })
  error?: string;

  @ApiPropertyOptional({
    description: 'Error code for programmatic handling',
    example: 'PAYMENT_GATEWAY_ERROR',
    type: 'string'
  })
  errorCode?: string;

  @ApiPropertyOptional({
    description: 'Type of payment transaction',
    example: 'direct',
    enum: ['direct', 'intent'],
    type: 'string'
  })
  paymentType?: 'direct' | 'intent';
}

export class WebhookPayloadDto {
  @ApiProperty({
    description: 'Webhook event type',
    example: 'transaction.updated'
  })
  event: string;

  @ApiProperty({
    description: 'Transaction data from Wompi'
  })
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

  @ApiProperty({
    description: 'Webhook timestamp',
    example: 1734566400
  })
  timestamp: number;

  @ApiProperty({
    description: 'Webhook signature for verification'
  })
  signature: {
    checksum: string;
    properties: string[];
  };
}
