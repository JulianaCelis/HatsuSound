import { Controller, Post, Body, Get, Param, HttpCode, HttpStatus, UseGuards, HttpException, Query, Inject } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody, ApiParam, ApiQuery } from '@nestjs/swagger';
import { CreateCheckoutUseCase, ProcessWebhookUseCase } from '../../application/use-cases/checkout';
import { CreateCheckoutRequest, CheckoutResponse } from '../../domain/ports/input/checkout.port';
import { WebhookPayload } from '../../application/use-cases/checkout/process-webhook.use-case';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CreateCheckoutDto, CheckoutResponseDto, WebhookPayloadDto } from '../dto/checkout.dto';
import { WompiServicePort } from '../../domain/ports/output/wompi.service.port';
import { TransactionRepositoryPort } from '../../domain/ports/output/transaction.repository.port';

@ApiTags('Checkout & Payments')
@Controller('checkout')
export class CheckoutController {
  constructor(
    private readonly createCheckoutUseCase: CreateCheckoutUseCase,
    private readonly processWebhookUseCase: ProcessWebhookUseCase,
    @Inject('WompiServicePort')
    private readonly wompiService: WompiServicePort,
    @Inject('TransactionRepositoryPort')
    private readonly transactionRepository: TransactionRepositoryPort,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user', 'admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Create a new checkout session',
    description: 'Creates a new checkout session with Wompi payment gateway. The amount should be in cents (e.g., 50000 = $500.00). Returns a checkout URL that the customer can use to complete the payment.',
    tags: ['Checkout']
  })
  @ApiBody({ 
    type: CreateCheckoutDto,
    description: 'Checkout request data with product and customer information',
    examples: {
      basic: {
        summary: 'Basic Checkout',
        description: 'Basic checkout with required fields only',
        value: {
          amount: 50000,
          currency: 'COP',
          customerEmail: 'customer@example.com',
          productId: 'album_001',
          productName: 'HatsuSound Vol. 1',
          productCategory: 'Música'
        }
      },
      complete: {
        summary: 'Complete Checkout',
        description: 'Complete checkout with all product and customer fields',
        value: {
          amount: 50000,
          currency: 'COP',
          customerEmail: 'customer@example.com',
          customerName: 'Juan Pérez',
          customerPhone: '+573001234567',
          productId: 'album_001',
          productName: 'HatsuSound Vol. 1',
          productCategory: 'Música',
          productArtist: 'HatsuSound Collective',
          productGenre: 'Electronic',
          productFormat: 'Digital',
          description: 'Compra de álbum "HatsuSound Vol. 1"',
          metadata: {
            releaseDate: '2025-01-15',
            trackCount: 12,
            duration: '45:30',
            quality: '320kbps'
          },
          reference: 'ALBUM-001-2025'
        }
      },
      musicAlbum: {
        summary: 'Music Album Purchase',
        description: 'Example for purchasing a music album with full details',
        value: {
          amount: 25000,
          currency: 'COP',
          customerEmail: 'musiclover@example.com',
          customerName: 'María García',
          customerPhone: '+573001234567',
          productId: 'album_001',
          productName: 'HatsuSound Vol. 1',
          productCategory: 'Música',
          productArtist: 'HatsuSound Collective',
          productGenre: 'Electronic',
          productFormat: 'Digital',
          description: 'Compra de álbum "HatsuSound Vol. 1"',
          metadata: {
            releaseDate: '2025-01-15',
            trackCount: 12,
            duration: '45:30',
            quality: '320kbps',
            featured: true,
            exclusive: false
          },
          reference: 'ALBUM-001-2025'
        }
      },
      singleTrack: {
        summary: 'Single Track Purchase',
        description: 'Example for purchasing a single track',
        value: {
          amount: 5000,
          currency: 'COP',
          customerEmail: 'tracklover@example.com',
          customerName: 'Carlos Rodríguez',
          productId: 'track_001',
          productName: 'Midnight Groove',
          productCategory: 'Música',
          productArtist: 'HatsuSound Collective',
          productGenre: 'House',
          productFormat: 'Digital',
          description: 'Compra de track "Midnight Groove"',
          metadata: {
            duration: '3:45',
            quality: '320kbps',
            remix: false,
            featured: true
          },
          reference: 'TRACK-001-2025'
        }
      },
      directPayment: {
        summary: 'Direct Payment with Token',
        description: 'Example for direct payment using a payment method token',
        value: {
          amount: 50000,
          currency: 'COP',
          customerEmail: 'directpayer@example.com',
          customerName: 'Ana Martínez',
          customerPhone: '+573001234567',
          productId: 'album_001',
          productName: 'HatsuSound Vol. 1',
          productCategory: 'Música',
          productArtist: 'HatsuSound Collective',
          productGenre: 'Electronic',
          productFormat: 'Digital',
          description: 'Compra de álbum HatsuSound Vol. 1',
          metadata: {
            releaseDate: '2025-01-15',
            trackCount: 12,
            duration: '45:30'
          },
          reference: 'ALBUM-001-2025',
          paymentMethodToken: 'tok_test_12345'
        }
      }
    }
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Checkout created successfully',
    type: CheckoutResponseDto
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad request - Invalid input data or validation error'
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Invalid or missing JWT token'
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Forbidden - Insufficient permissions (requires user or admin role)'
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Internal server error - Check server logs for details'
  })
  async createCheckout(@Body() request: CreateCheckoutDto): Promise<CheckoutResponse> {
    try {
      const result = await this.createCheckoutUseCase.execute(request);
      
      if (result.isFailure()) {
        throw new HttpException(result.error || 'Checkout creation failed', HttpStatus.BAD_REQUEST);
      }
      
      return result.value;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Process Wompi webhook',
    description: 'Receives and processes webhooks from Wompi payment gateway. This endpoint is called by Wompi when payment status changes.',
    tags: ['Webhooks']
  })
  @ApiBody({ 
    type: WebhookPayloadDto,
    description: 'Webhook payload from Wompi',
    examples: {
      transactionUpdated: {
        summary: 'Transaction Updated',
        description: 'Webhook when transaction status changes',
        value: {
          event: 'transaction.updated',
          data: {
            transaction: {
              id: 'txn_123456789',
              status: 'approved',
              reference: 'ALBUM-001-2025',
              amount_in_cents: 50000,
              currency: 'COP',
              customer_email: 'customer@example.com',
              status_message: 'Payment approved',
              created_at: '2025-08-19T04:47:08.641Z',
              updated_at: '2025-08-19T04:47:15.123Z'
            }
          },
          timestamp: 1734566400,
          signature: {
            checksum: 'abc123def456...',
            properties: ['event', 'data', 'timestamp']
          }
        }
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Webhook processed successfully'
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Invalid webhook payload or signature'
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Internal server error during webhook processing'
  })
  async processWebhook(@Body() payload: WebhookPayloadDto): Promise<void> {
    try {
      const result = await this.processWebhookUseCase.execute(payload);
      
      if (result.isFailure()) {
        throw new HttpException(
          result.error || 'Webhook processing failed',
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }
      
      return result.value;
    } catch (error) {
      throw new HttpException(
        error.message || 'Webhook processing failed',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('status/:transactionId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Get transaction status',
    description: 'Retrieves the current status of a transaction by its ID or reference',
    tags: ['Transactions']
  })
  @ApiParam({
    name: 'transactionId',
    description: 'Transaction ID or reference',
    example: 'ALBUM-001-2025'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Transaction status retrieved successfully'
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Invalid or missing token'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Transaction not found'
  })
  async getTransactionStatus(@Param('transactionId') transactionId: string): Promise<any> {
    try {
      // Buscar por ID o referencia
      let transaction = await this.transactionRepository.findById(transactionId);
      
      if (!transaction) {
        transaction = await this.transactionRepository.findByReference(transactionId);
      }

      if (!transaction) {
        throw new HttpException('Transaction not found', HttpStatus.NOT_FOUND);
      }

      return {
        id: transaction.id,
        reference: transaction.reference,
        status: transaction.status,
        amount: transaction.amount,
        currency: transaction.currency,
        customerEmail: transaction.customerEmail,
        customerName: transaction.customerName,
        wompiTransactionId: transaction.wompiTransactionId,
        created_at: transaction.createdAt,
        processedAt: transaction.processedAt,
        errorMessage: transaction.errorMessage
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        error.message || 'Failed to get transaction status',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('wompi/status/:wompiTransactionId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Get Wompi transaction status',
    description: 'Retrieves the current status of a transaction directly from Wompi',
    tags: ['Wompi Integration']
  })
  @ApiParam({
    name: 'wompiTransactionId',
    description: 'Wompi transaction ID',
    example: 'txn_123456789'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Wompi transaction status retrieved successfully'
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Invalid or missing token'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Wompi transaction not found'
  })
  async getWompiTransactionStatus(@Param('wompiTransactionId') wompiTransactionId: string): Promise<any> {
    try {
      const wompiTransaction = await this.wompiService.getTransaction(wompiTransactionId);
      return wompiTransaction;
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to get Wompi transaction status',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('wompi/config')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Get Wompi configuration info',
    description: 'Retrieves Wompi service configuration information (admin only)',
    tags: ['Admin', 'Wompi Integration']
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Wompi configuration retrieved successfully'
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Invalid or missing token'
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Forbidden - Admin role required'
  })
  async getWompiConfig(): Promise<any> {
    try {
      return this.wompiService.getConfigurationInfo();
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to get Wompi configuration',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('wompi/validate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Validate Wompi configuration',
    description: 'Validates Wompi service configuration and connectivity (admin only)',
    tags: ['Admin', 'Wompi Integration']
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Wompi configuration validation result'
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Invalid or missing token'
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Forbidden - Admin role required'
  })
  async validateWompiConfig(): Promise<any> {
    try {
      const isValid = await this.wompiService.validateConfiguration();
      return {
        valid: isValid,
        message: isValid ? 'Wompi configuration is valid' : 'Wompi configuration is invalid',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        valid: false,
        message: `Validation failed: ${error.message}`,
        timestamp: new Date().toISOString()
      };
    }
  }

  @Post('wompi/create-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Create payment method token',
    description: 'Creates a payment method token for testing direct payments (admin only)',
    tags: ['Admin', 'Wompi Integration']
  })
  @ApiBody({
    description: 'Card data to create payment method token',
    examples: {
      testCard: {
        summary: 'Test Card',
        description: 'Example with test card data',
        value: {
          number: '4242424242424242',
          cvc: '123',
          expMonth: '12',
          expYear: '2025',
          cardHolderName: 'Juan Pérez'
        }
      }
    }
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Payment method token created successfully'
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Invalid card data'
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Invalid or missing token'
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Forbidden - Admin role required'
  })
  async createPaymentMethodToken(@Body() cardData: {
    number: string;
    cvc: string;
    expMonth: string;
    expYear: string;
    cardHolderName: string;
  }): Promise<any> {
    try {
      const token = await this.wompiService.createPaymentMethodToken(cardData);
      return {
        success: true,
        token,
        message: 'Payment method token created successfully',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to create payment method token',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Get('test-auth')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Test JWT authentication',
    description: 'Simple endpoint to test if JWT authentication is working',
    tags: ['Authentication']
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Authentication successful'
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Invalid or missing token'
  })
  async testAuth(): Promise<any> {
    return { 
      message: 'JWT authentication is working!',
      timestamp: new Date().toISOString()
    };
  }
}
