import { Test, TestingModule } from '@nestjs/testing';
import { CreateCheckoutUseCase } from '../src/application/use-cases/checkout/create-checkout.use-case';
import { TransactionRepositoryPort } from '../src/domain/ports/output/transaction.repository.port';
import { WompiServicePort } from '../src/domain/ports/output/wompi.service.port';
import { CreateCheckoutRequest, CheckoutResponse } from '../src/domain/ports/input/checkout.port';
import { TransactionStatus, TransactionType } from '../src/domain/entities/transaction.entity';
import { Result, Success, Failure } from '../src/domain/ports';

describe('CreateCheckoutUseCase - Tests Exhaustivos', () => {
  let useCase: CreateCheckoutUseCase;
  let mockTransactionRepository: jest.Mocked<TransactionRepositoryPort>;
  let mockWompiService: jest.Mocked<WompiServicePort>;

  // Mock data más realista
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
      getAcceptanceToken: jest.fn(),
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

    // Setup default mocks
    mockTransactionRepository.create.mockResolvedValue(mockTransaction);
    mockTransactionRepository.update.mockResolvedValue(undefined);
    mockWompiService.createTransaction.mockResolvedValue(mockWompiResponse);
    mockWompiService.getCheckoutUrl.mockReturnValue('https://checkout.wompi.co/p/test');
    mockWompiService.getAcceptanceToken.mockResolvedValue('real_acceptance_token_123');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('✅ Casos de Éxito', () => {
    describe('🔄 Transacción de Intención (sin paymentMethodToken)', () => {
      it('debe crear checkout de intención exitosamente', async () => {
        const request = { ...validRequest };
        delete (request as any).paymentMethodToken;

        const result = await useCase.execute(request);

        expect(result.isSuccess()).toBe(true);
        if (result.isSuccess()) {
          const response = result.value;
          expect(response.success).toBe(true);
          expect(response.paymentType).toBe('intent');
          expect(response.checkoutUrl).toBeDefined();
          expect(response.wompiTransactionId).toBe('wompi_txn_456');
        }

        // Verificar que se llamó a createTransaction con payment_method básico
        expect(mockWompiService.createTransaction).toHaveBeenCalledWith(
          expect.objectContaining({
            payment_method: { type: 'CARD', installments: 1 },
            acceptance_token: 'real_acceptance_token_123',
          })
        );
      });

      it('debe usar acceptance token real de Wompi', async () => {
        const request = { ...validRequest };
        delete (request as any).paymentMethodToken;

        await useCase.execute(request);

        expect(mockWompiService.getAcceptanceToken).toHaveBeenCalled();
        expect(mockWompiService.createTransaction).toHaveBeenCalledWith(
          expect.objectContaining({
            acceptance_token: 'real_acceptance_token_123',
          })
        );
      });

      it('debe incluir payment_method básico para transacciones de intención', async () => {
        const request = { ...validRequest };
        delete (request as any).paymentMethodToken;

        await useCase.execute(request);

        expect(mockWompiService.createTransaction).toHaveBeenCalledWith(
          expect.objectContaining({
            payment_method: { type: 'CARD', installments: 1 },
          })
        );
      });
    });

    describe('💳 Transacción de Pago Directo (con paymentMethodToken)', () => {
      it('debe crear checkout de pago directo exitosamente', async () => {
        const request = { ...validRequest, paymentMethodToken: 'tok_test_123' };

        const result = await useCase.execute(request);

        expect(result.isSuccess()).toBe(true);
        if (result.isSuccess()) {
          const response = result.value;
          expect(response.success).toBe(true);
          expect(response.paymentType).toBe('direct');
          expect(response.checkoutUrl).toBeUndefined();
          expect(response.wompiTransactionId).toBe('wompi_txn_456');
        }
      });

      it('debe enviar payment_method completo con token', async () => {
        const request = { ...validRequest, paymentMethodToken: 'tok_test_123' };

        await useCase.execute(request);

        expect(mockWompiService.createTransaction).toHaveBeenCalledWith(
          expect.objectContaining({
            payment_method: {
              type: 'CARD',
              token: 'tok_test_123',
              installments: 1,
            },
          })
        );
      });

      it('debe usar acceptance token real para pago directo', async () => {
        const request = { ...validRequest, paymentMethodToken: 'tok_test_123' };

        await useCase.execute(request);

        expect(mockWompiService.getAcceptanceToken).toHaveBeenCalled();
        expect(mockWompiService.createTransaction).toHaveBeenCalledWith(
          expect.objectContaining({
            acceptance_token: 'real_acceptance_token_123',
          })
        );
      });
    });

    describe('📝 Validaciones de Datos', () => {
      it('debe generar referencia única si no se proporciona', async () => {
        const request = { ...validRequest };
        delete (request as any).reference;

        await useCase.execute(request);

        expect(mockTransactionRepository.create).toHaveBeenCalledWith(
          expect.objectContaining({
            reference: expect.stringMatching(/^[A-Z]+\d+-\d+-[a-f0-9]+$/),
          })
        );
      });

      it('debe incluir metadata completa del producto', async () => {
        const request = { ...validRequest };

        await useCase.execute(request);

        expect(mockTransactionRepository.create).toHaveBeenCalledWith(
          expect.objectContaining({
            metadata: expect.objectContaining({
              productId: 'album_001',
              productName: 'Test Album',
              productCategory: 'Música',
              productArtist: 'Test Artist',
              productGenre: 'Rock',
              productFormat: 'Digital',
              test: true,
              createdAt: expect.any(String),
            }),
          })
        );
      });
    });
  });

  describe('❌ Casos de Error', () => {
    describe('🚫 Validaciones de Entrada', () => {
            it('debe rechazar monto menor a 1000 centavos', async () => {
        const request = { ...validRequest, amount: 500 };

        const result = await useCase.execute(request);

        expect(result.isFailure()).toBe(true);      
        if (result.isFailure()) {
          const failure = result as any;
          expect(failure.error.error).toBe('El monto debe ser al menos 1000 centavos (10.00)');
          expect(failure.error.errorCode).toBe('INVALID_AMOUNT');
        }
      });

      it('debe rechazar moneda inválida', async () => {
        const request = { ...validRequest, currency: 'INVALID' as any };

        const result = await useCase.execute(request);

        expect(result.isFailure()).toBe(true);      
        if (result.isFailure()) {
          const failure = result as any;
          expect(failure.error.error).toBe('Moneda no válida. Debe ser COP, USD o EUR');
          expect(failure.error.errorCode).toBe('INVALID_CURRENCY');
        }
      });

      it('debe rechazar email inválido', async () => {
        const request = { ...validRequest, customerEmail: 'invalid-email' };

        const result = await useCase.execute(request);

        expect(result.isFailure()).toBe(true);      
        if (result.isFailure()) {
          const failure = result as any;
          expect(failure.error.error).toBe('Email del cliente no válido');
          expect(failure.error.errorCode).toBe('INVALID_EMAIL');
        }
      });

      it('debe rechazar datos de producto incompletos', async () => {
        const request = { ...validRequest };
        delete (request as any).productId;

        const result = await useCase.execute(request);

        expect(result.isFailure()).toBe(true);      
        if (result.isFailure()) {
          const failure = result as any;
          expect(failure.error.error).toBe('Información del producto incompleta');
          expect(failure.error.errorCode).toBe('INVALID_PRODUCT_DATA');
        }
      });
    });

    describe('💥 Errores de Wompi', () => {
      it('debe manejar error 422 de Wompi (método de pago inválido)', async () => {
        const wompiError = new Error('Wompi 422 UNPROCESSABLE: No se especificó método de pago o fuente de pago');
        mockWompiService.createTransaction.mockRejectedValue(wompiError);

        const result = await useCase.execute(validRequest);

        expect(result.isFailure()).toBe(true);
        if (result.isFailure()) {
          const failure = result as any;
          expect(failure.error.error).toBe('Datos de pago inválidos');
          expect(failure.error.errorCode).toBe('VALIDATION_ERROR');
        }
      });

      it('debe manejar error 401 de Wompi (autenticación)', async () => {
        const wompiError = new Error('Wompi 401 UNAUTHORIZED: Invalid credentials');
        mockWompiService.createTransaction.mockRejectedValue(wompiError);

        const result = await useCase.execute(validRequest);

        expect(result.isFailure()).toBe(true);
        if (result.isFailure()) {
          const failure = result as any;
          expect(failure.error.error).toBe('Error de autenticación con el servicio de pagos');
          expect(failure.error.errorCode).toBe('AUTH_ERROR');
        }
      });

      it('debe manejar error 403 de Wompi (forbidden)', async () => {
        const wompiError = new Error('Wompi 403 FORBIDDEN: Access denied');
        mockWompiService.createTransaction.mockRejectedValue(wompiError);

        const result = await useCase.execute(validRequest);

        expect(result.isFailure()).toBe(true);
        if (result.isFailure()) {
          const failure = result as any;
          expect(failure.error.error).toBe('Acceso denegado al servicio de pagos');
          expect(failure.error.errorCode).toBe('FORBIDDEN');
        }
      });

      it('debe manejar error 500 de Wompi (servicio no disponible)', async () => {
        const wompiError = new Error('Wompi 500 INTERNAL_SERVER_ERROR: Service unavailable');
        mockWompiService.createTransaction.mockRejectedValue(wompiError);

        const result = await useCase.execute(validRequest);

        expect(result.isFailure()).toBe(true);
        if (result.isFailure()) {
          const failure = result as any;
          expect(failure.error.error).toBe('El servicio de pagos no está disponible en este momento');
          expect(failure.error.errorCode).toBe('SERVICE_UNAVAILABLE');
        }
      });

      it('debe manejar error de token inválido específicamente', async () => {
        const wompiError = new Error('Wompi 422 UNPROCESSABLE: Token de método de pago no está presente');
        mockWompiService.createTransaction.mockRejectedValue(wompiError);

        const request = { ...validRequest, paymentMethodToken: 'invalid_token' };
        const result = await useCase.execute(request);

        expect(result.isFailure()).toBe(true);
        if (result.isFailure()) {
          const failure = result as any;
          expect(failure.error.error).toBe('Datos de pago inválidos');
          expect(failure.error.errorCode).toBe('VALIDATION_ERROR');
        }
      });

      it('debe manejar error de método de pago inválido específicamente', async () => {
        const wompiError = new Error('Wompi 422 UNPROCESSABLE: Método de pago no soportado');
        mockWompiService.createTransaction.mockRejectedValue(wompiError);

        const result = await useCase.execute(validRequest);

        expect(result.isFailure()).toBe(true);
        if (result.isFailure()) {
          const failure = result as any;
          expect(failure.error.error).toBe('Datos de pago inválidos');
          expect(failure.error.errorCode).toBe('VALIDATION_ERROR');
        }
      });
    });

    describe('💾 Errores de Base de Datos', () => {
      it('debe manejar error al crear transacción local', async () => {
        const dbError = new Error('Database connection failed');
        mockTransactionRepository.create.mockRejectedValue(dbError);

        const result = await useCase.execute(validRequest);

        expect(result.isFailure()).toBe(true);
        if (result.isFailure()) {
          const failure = result as any;
          expect(failure.error.error).toBe('Error al procesar el checkout. Verifica los datos e intenta nuevamente.');
          expect(failure.error.errorCode).toBe('INTERNAL_ERROR');
        }
      });

      it('debe manejar error al actualizar transacción local', async () => {
        const dbError = new Error('Update failed');
        mockTransactionRepository.update.mockRejectedValue(dbError);

        const result = await useCase.execute(validRequest);

        expect(result.isFailure()).toBe(true);
        if (result.isFailure()) {
          const failure = result as any;
          expect(failure.error.error).toBe('Error al procesar el checkout. Verifica los datos e intenta nuevamente.');
          expect(failure.error.errorCode).toBe('INTERNAL_ERROR');
        }
      });
    });

    describe('🔑 Errores de Acceptance Token', () => {
      it('debe manejar error al obtener acceptance token', async () => {
        const tokenError = new Error('Failed to get acceptance token');
        mockWompiService.getAcceptanceToken.mockRejectedValue(tokenError);

        const result = await useCase.execute(validRequest);

        expect(result.isFailure()).toBe(true);
        if (result.isFailure()) {
          const failure = result as any;
          expect(failure.error.error).toBe('Error al procesar el checkout. Verifica los datos e intenta nuevamente.');
          expect(failure.error.errorCode).toBe('INTERNAL_ERROR');
        }
      });

      it('debe manejar acceptance token vacío', async () => {
        mockWompiService.getAcceptanceToken.mockResolvedValue('');

        const result = await useCase.execute(validRequest);

        expect(result.isFailure()).toBe(true);
        if (result.isFailure()) {
          const failure = result as any;
          expect(failure.error.error).toBe('Error al procesar el checkout. Verifica los datos e intenta nuevamente.');
          expect(failure.error.errorCode).toBe('INTERNAL_ERROR');
        }
      });
    });
  });

  describe('🔍 Tests de Integración Simulada', () => {
    it('debe crear transacción local antes de llamar a Wompi', async () => {
      const request = { ...validRequest };

      await useCase.execute(request);

      // Verificar que createTransaction se llamó después de create
      expect(mockTransactionRepository.create).toHaveBeenCalled();
      expect(mockWompiService.createTransaction).toHaveBeenCalled();
      
      // Verificar el orden de las llamadas
      const createCallOrder = mockTransactionRepository.create.mock.invocationCallOrder[0];
      const wompiCallOrder = mockWompiService.createTransaction.mock.invocationCallOrder[0];
      expect(createCallOrder).toBeLessThan(wompiCallOrder);
    });

    it('debe actualizar transacción local después de respuesta exitosa de Wompi', async () => {
      const request = { ...validRequest };

      await useCase.execute(request);

      // Verificar que update se llamó después de createTransaction
      expect(mockTransactionRepository.update).toHaveBeenCalled();
      expect(mockWompiService.createTransaction).toHaveBeenCalled();
      
      // Verificar el orden de las llamadas
      const wompiCallOrder = mockWompiService.createTransaction.mock.invocationCallOrder[0];
      const updateCallOrder = mockTransactionRepository.update.mock.invocationCallOrder[0];
      expect(wompiCallOrder).toBeLessThan(updateCallOrder);
    });

    it('debe usar la misma referencia en transacción local y Wompi', async () => {
      const request = { ...validRequest };

      await useCase.execute(request);

      const localCall = mockTransactionRepository.create.mock.calls[0][0];
      const wompiCall = mockWompiService.createTransaction.mock.calls[0][0];

      expect(localCall.reference).toBe(wompiCall.reference);
    });

    it('debe mapear correctamente el status de Wompi a status local', async () => {
      const request = { ...validRequest };

      await useCase.execute(request);

      expect(mockTransactionRepository.update).toHaveBeenCalledWith(
        'txn_123',
        expect.objectContaining({
          status: TransactionStatus.PENDING,
        })
      );
    });
  });

  describe('🧪 Tests de Edge Cases', () => {
    it('debe manejar request sin customerName (usar email)', async () => {
      const request = { ...validRequest };
      delete (request as any).customerName;

      await useCase.execute(request);

      expect(mockWompiService.createTransaction).toHaveBeenCalledWith(
        expect.objectContaining({
          customer_data: expect.objectContaining({
            full_name: 'test',
          }),
        })
      );
    });

    it('debe manejar request sin customerPhone', async () => {
      const request = { ...validRequest };
      delete (request as any).customerPhone;

      await useCase.execute(request);

      expect(mockWompiService.createTransaction).toHaveBeenCalledWith(
        expect.objectContaining({
          customer_data: expect.objectContaining({
            phone_number: undefined,
          }),
        })
      );
    });

    it('debe manejar request sin description (generar automáticamente)', async () => {
      const request = { ...validRequest };
      delete (request as any).description;

      await useCase.execute(request);

      expect(mockTransactionRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          description: expect.stringContaining('Compra de música'),
        })
      );
    });

    it('debe manejar request sin metadata (crear objeto vacío)', async () => {
      const request = { ...validRequest };
      delete (request as any).metadata;

      await useCase.execute(request);

      expect(mockTransactionRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: expect.objectContaining({
            productId: 'album_001',
            createdAt: expect.any(String),
          }),
        })
      );
    });

    it('debe manejar monto máximo (999999999 centavos)', async () => {
      const request = { ...validRequest, amount: 999999999 };

      const result = await useCase.execute(request);

      expect(result.isSuccess()).toBe(true);
    });

    it('debe manejar diferentes monedas válidas', async () => {
      const currencies = ['COP', 'USD', 'EUR'];

      for (const currency of currencies) {
        const request = { ...validRequest, currency };
        const result = await useCase.execute(request);
        expect(result.isSuccess()).toBe(true);
      }
    });
  });

  describe('📊 Tests de Performance y Robustez', () => {
    it('debe manejar múltiples requests concurrentes', async () => {
      const requests = Array(5).fill(null).map((_, i) => ({
        ...validRequest,
        customerEmail: `test${i}@example.com`,
        amount: 10000 + (i * 1000),
      }));

      const results = await Promise.all(
        requests.map(request => useCase.execute(request))
      );

      expect(results).toHaveLength(5);
      results.forEach(result => {
        expect(result.isSuccess()).toBe(true);
      });
    });

    it('debe limpiar mocks entre tests', () => {
      expect(mockWompiService.createTransaction).not.toHaveBeenCalled();
      expect(mockTransactionRepository.create).not.toHaveBeenCalled();
    });

    it('debe validar estructura completa de respuesta exitosa', async () => {
      const result = await useCase.execute(validRequest);

      expect(result.isSuccess()).toBe(true);
      if (result.isSuccess()) {
        const response = result.value;
        expect(response).toHaveProperty('success', true);
        expect(response).toHaveProperty('transaction');
        expect(response).toHaveProperty('wompiTransactionId');
        expect(response).toHaveProperty('amount');
        expect(response).toHaveProperty('currency');
        expect(response).toHaveProperty('reference');
        expect(response).toHaveProperty('paymentType');
        expect(response).toHaveProperty('checkoutUrl');
      }
    });
  });
});
