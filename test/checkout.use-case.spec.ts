import { Test, TestingModule } from '@nestjs/testing';
import { CreateCheckoutUseCase } from '../src/application/use-cases/checkout/create-checkout.use-case';
import { TransactionRepositoryPort } from '../src/domain/ports/output/transaction.repository.port';
import { WompiServicePort } from '../src/domain/ports/output/wompi.service.port';
import { CreateCheckoutRequest, CheckoutResponse } from '../src/domain/ports/input/checkout.port';
import { TransactionStatus, TransactionType } from '../src/domain/entities/transaction.entity';
import { Result, Success, Failure } from '../src/domain/ports';

describe('CreateCheckoutUseCase', () => {
  let useCase: CreateCheckoutUseCase;
  let mockTransactionRepository: jest.Mocked<TransactionRepositoryPort>;
  let mockWompiService: jest.Mocked<WompiServicePort>;

  const mockTransaction = {
    id: 'txn_123',
    reference: 'TEST-123',
    amount: 50000,
    currency: 'COP',
    status: TransactionStatus.PENDING,
    type: TransactionType.PAYMENT,
    customerEmail: 'test@example.com',
    customerName: 'Test User',
    customerPhone: '+573001234567',
    description: 'Test transaction',
    metadata: {},
    createdAt: new Date(),
    updatedAt: new Date(),
    wompiTransactionId: null,
    wompiSessionId: null,
    errorMessage: null,
    processedAt: null,
  };

  const mockWompiResponse = {
    data: {
      id: 'wompi_txn_456',
      status: 'pending',
      amount_in_cents: 50000,
      currency: 'COP',
      reference: 'TEST-123',
      customer_email: 'test@example.com',
      payment_method: { type: 'CARD', installments: 1 },
      status_message: 'Transaction created',
      created_at: '2025-08-20T00:00:00Z',
      updated_at: '2025-08-20T00:00:00Z',
    },
  };

  const validRequest: CreateCheckoutRequest = {
    amount: 50000,
    currency: 'COP',
    customerEmail: 'test@example.com',
    customerName: 'Test User',
    customerPhone: '+573001234567',
    productId: 'album_001',
    productName: 'Test Album',
    productCategory: 'Música',
    productArtist: 'Test Artist',
    productGenre: 'Rock',
    productFormat: 'Digital',
    description: 'Test purchase',
    metadata: { test: true },
  };

  beforeEach(async () => {
    const mockTransactionRepositoryImpl = {
      create: jest.fn(),
      update: jest.fn(),
      findById: jest.fn(),
      findByReference: jest.fn(),
      findAll: jest.fn(),
      delete: jest.fn(),
    };

    const mockWompiServiceImpl = {
      createTransaction: jest.fn(),
      getTransaction: jest.fn(),
      createPaymentLink: jest.fn(),
      verifySignature: jest.fn(),
      getCheckoutUrl: jest.fn(),
      getApiUrl: jest.fn(),
      getConfigurationInfo: jest.fn(),
      validateConfiguration: jest.fn(),
      getMerchantInfo: jest.fn(),
      createPaymentMethodToken: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateCheckoutUseCase,
        {
          provide: 'TransactionRepositoryPort',
          useValue: mockTransactionRepositoryImpl,
        },
        {
          provide: 'WompiServicePort',
          useValue: mockWompiServiceImpl,
        },
      ],
    }).compile();

    useCase = module.get<CreateCheckoutUseCase>(CreateCheckoutUseCase);
    mockTransactionRepository = module.get('TransactionRepositoryPort');
    mockWompiService = module.get('WompiServicePort');

    // Configurar mocks por defecto
    mockTransactionRepository.create.mockResolvedValue(mockTransaction);
    mockTransactionRepository.update.mockResolvedValue(undefined);
    mockWompiService.createTransaction.mockResolvedValue(mockWompiResponse);
    mockWompiService.getCheckoutUrl.mockReturnValue('https://checkout.wompi.co/test');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should create checkout successfully without payment method token (intent)', async () => {
      const result = await useCase.execute(validRequest);

      expect(result).toBeInstanceOf(Success);
      expect(result.isSuccess()).toBe(true);
      
      if (result.isSuccess()) {
        const response = result.value;
        expect(response.success).toBe(true);
        expect(response.paymentType).toBe('intent');
        expect(response.checkoutUrl).toBeDefined();
        expect(response.wompiTransactionId).toBe('wompi_txn_456');
        expect(response.amount).toBe(50000);
        expect(response.currency).toBe('COP');
      }

      expect(mockTransactionRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: 50000,
          currency: 'COP',
          status: TransactionStatus.PENDING,
          type: TransactionType.PAYMENT,
        })
      );

      expect(mockWompiService.createTransaction).toHaveBeenCalledWith(
        expect.objectContaining({
          amount_in_cents: 50000,
          currency: 'COP',
          payment_method: { type: 'CARD', installments: 1 },
        })
      );
    });

    it('should create checkout successfully with payment method token (direct)', async () => {
      const requestWithToken = {
        ...validRequest,
        paymentMethodToken: 'tok_test_12345',
      };

      const result = await useCase.execute(requestWithToken);

      expect(result).toBeInstanceOf(Success);
      expect(result.isSuccess()).toBe(true);
      
      if (result.isSuccess()) {
        const response = result.value;
        expect(response.success).toBe(true);
        expect(response.paymentType).toBe('direct');
        expect(response.checkoutUrl).toBeUndefined(); // No debe tener URL para pagos directos
        expect(response.wompiTransactionId).toBe('wompi_txn_456');
      }

      expect(mockWompiService.createTransaction).toHaveBeenCalledWith(
        expect.objectContaining({
          payment_method: {
            type: 'CARD',
            token: 'tok_test_12345',
            installments: 1,
          },
        })
      );
    });

    it('should generate reference when not provided', async () => {
      const requestWithoutReference = { ...validRequest };
      delete requestWithoutReference.reference;

      await useCase.execute(requestWithoutReference);

      expect(mockTransactionRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          reference: expect.stringMatching(/^ALBUM001-\d+-[a-f0-9]{8}$/),
        })
      );
    });

    it('should use provided reference when available', async () => {
      const requestWithReference = {
        ...validRequest,
        reference: 'CUSTOM-REF-123',
      };

      await useCase.execute(requestWithReference);

      expect(mockTransactionRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          reference: 'CUSTOM-REF-123',
        })
      );
    });

    it('should generate description when not provided', async () => {
      const requestWithoutDescription = { ...validRequest };
      delete requestWithoutDescription.description;

      await useCase.execute(requestWithoutDescription);

      expect(mockTransactionRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          description: 'Compra de música "Test Album" por Test Artist (Digital)',
        })
      );
    });

    it('should update local transaction with Wompi data', async () => {
      await useCase.execute(validRequest);

      expect(mockTransactionRepository.update).toHaveBeenCalledWith(
        'txn_123',
        expect.objectContaining({
          wompiTransactionId: 'wompi_txn_456',
          status: TransactionStatus.PENDING,
          metadata: expect.objectContaining({
            wompiStatus: 'pending',
            wompiCreatedAt: '2025-08-20T00:00:00Z',
            wompiUpdatedAt: '2025-08-20T00:00:00Z',
          }),
        })
      );
    });
  });

  describe('validation', () => {
    it('should reject request with invalid amount', async () => {
      const invalidRequest = { ...validRequest, amount: 500 }; // Menos de 1000

      const result = await useCase.execute(invalidRequest);

      expect(result).toBeInstanceOf(Failure);
      expect(result.isFailure()).toBe(true);
      
      if (result.isFailure()) {
        const response = result.error;
        expect(response.success).toBe(false);
        expect(response.error).toContain('monto');
        expect(response.errorCode).toBe('INVALID_AMOUNT');
      }
    });

    it('should reject request with invalid currency', async () => {
      const invalidRequest = { ...validRequest, currency: 'INVALID' };

      const result = await useCase.execute(invalidRequest);

      expect(result).toBeInstanceOf(Failure);
      expect(result.isFailure()).toBe(true);
      
      if (result.isFailure()) {
        const response = result.error;
        expect(response.success).toBe(false);
        expect(response.error).toContain('Moneda no válida');
        expect(response.errorCode).toBe('INVALID_CURRENCY');
      }
    });

    it('should reject request with invalid email', async () => {
      const invalidRequest = { ...validRequest, customerEmail: 'invalid-email' };

      const result = await useCase.execute(invalidRequest);

      expect(result).toBeInstanceOf(Failure);
      expect(result.isFailure()).toBe(true);
      
      if (result.isFailure()) {
        const response = result.error;
        expect(response.success).toBe(false);
        expect(response.error).toContain('Email del cliente no válido');
        expect(response.errorCode).toBe('INVALID_EMAIL');
      }
    });

    it('should reject request with missing product information', async () => {
      const invalidRequest = { ...validRequest };
      delete invalidRequest.productId;

      const result = await useCase.execute(invalidRequest);

      expect(result).toBeInstanceOf(Failure);
      expect(result.isFailure()).toBe(true);
      
      if (result.isFailure()) {
        const response = result.error;
        expect(response.success).toBe(false);
        expect(response.error).toContain('producto');
        expect(response.errorCode).toBe('INVALID_PRODUCT_DATA');
      }
    });
  });

  describe('error handling', () => {
    it('should handle Wompi service errors gracefully', async () => {
      const wompiError = new Error('Wompi 422 INPUT_VALIDATION_ERROR: Request failed with status code 422');
      mockWompiService.createTransaction.mockRejectedValue(wompiError);

      const result = await useCase.execute(validRequest);

      expect(result).toBeInstanceOf(Failure);
      expect(result.isFailure()).toBe(true);
      
      if (result.isFailure()) {
        const response = result.error;
        expect(response.success).toBe(false);
        expect(response.error).toContain('Datos de pago inválidos');
        expect(response.errorCode).toBe('VALIDATION_ERROR');
      }
    });

    it('should handle database errors gracefully', async () => {
      const dbError = new Error('Database connection failed');
      mockTransactionRepository.create.mockRejectedValue(dbError);

      const result = await useCase.execute(validRequest);

      expect(result).toBeInstanceOf(Failure);
      expect(result.isFailure()).toBe(true);
      
      if (result.isFailure()) {
        const response = result.error;
        expect(response.success).toBe(false);
        expect(response.error).toContain('Error al procesar el checkout');
        expect(response.errorCode).toBe('INTERNAL_ERROR');
      }
    });

    it('should handle specific Wompi token errors', async () => {
      const tokenError = new Error('Wompi 422 INPUT_VALIDATION_ERROR: token: ["Formato inválido"]');
      mockWompiService.createTransaction.mockRejectedValue(tokenError);

      const requestWithToken = {
        ...validRequest,
        paymentMethodToken: 'invalid_token',
      };

      const result = await useCase.execute(requestWithToken);

      expect(result).toBeInstanceOf(Failure);
      expect(result.isFailure()).toBe(true);
      
      if (result.isFailure()) {
        const response = result.error;
        expect(response.success).toBe(false);
        expect(response.error).toContain('Token de método de pago inválido o expirado');
        expect(response.errorCode).toBe('INVALID_PAYMENT_TOKEN');
      }
    });
  });

  describe('status mapping', () => {
    it('should map Wompi statuses correctly', async () => {
      // Simular diferentes respuestas de Wompi
      const statuses = [
        { wompiStatus: 'approved', expected: TransactionStatus.APPROVED },
        { wompiStatus: 'declined', expected: TransactionStatus.DECLINED },
        { wompiStatus: 'error', expected: TransactionStatus.ERROR },
        { wompiStatus: 'expired', expected: TransactionStatus.EXPIRED },
        { wompiStatus: 'pending', expected: TransactionStatus.PENDING },
        { wompiStatus: 'in_process', expected: TransactionStatus.PENDING },
        { wompiStatus: 'voided', expected: TransactionStatus.DECLINED },
        { wompiStatus: 'failed', expected: TransactionStatus.ERROR },
        { wompiStatus: 'unknown', expected: TransactionStatus.PENDING }, // Default
      ];

      for (const { wompiStatus, expected } of statuses) {
        mockWompiService.createTransaction.mockResolvedValue({
          data: { ...mockWompiResponse.data, status: wompiStatus },
        });

        const result = await useCase.execute(validRequest);
        expect(result).toBeInstanceOf(Success);
        
        if (result.isSuccess()) {
          const response = result.value;
          expect(response.transaction?.status).toBe(expected);
        }
      }
    });
  });
});
