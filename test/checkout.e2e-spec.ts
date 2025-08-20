import { Test, TestingModule } from '@nestjs/testing';
import { CreateCheckoutUseCase } from '../src/application/use-cases/checkout/create-checkout.use-case';

describe('Checkout E2E Tests', () => {
  let useCase: CreateCheckoutUseCase;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      providers: [
        CreateCheckoutUseCase,
        {
          provide: 'TransactionRepositoryPort',
          useValue: {
            create: jest.fn().mockResolvedValue({
              id: 'txn_123',
              reference: 'TEST-123',
              amount: 50000,
              currency: 'COP',
              status: 'PENDING',
              type: 'PAYMENT',
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
            }),
            update: jest.fn().mockResolvedValue(true),
          },
        },
        {
          provide: 'WompiServicePort',
          useValue: {
            createTransaction: jest.fn().mockResolvedValue({
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
            }),
            getCheckoutUrl: jest.fn().mockReturnValue('https://checkout.wompi.co/123'),
            createPaymentMethodToken: jest.fn().mockResolvedValue('tok_test_12345'),
          },
        },
      ],
    }).compile();

    useCase = moduleFixture.get<CreateCheckoutUseCase>(CreateCheckoutUseCase);
  });

  describe('Checkout Use Case', () => {
    it('should create checkout without payment method token (intent)', async () => {
      const checkoutData = {
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
        description: 'Compra de álbum HatsuSound Vol. 1',
        metadata: {
          releaseDate: '2025-01-15',
          trackCount: 12,
          duration: '45:30'
        }
      };

      const result = await useCase.execute(checkoutData);

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
      
      console.log('✅ Checkout intent creado exitosamente');
    });

    it('should create checkout with payment method token (direct)', async () => {
      const checkoutData = {
        amount: 75000,
        currency: 'COP',
        customerEmail: 'customer@example.com',
        customerName: 'María García',
        customerPhone: '+573001234568',
        productId: 'album_002',
        productName: 'HatsuSound Vol. 2',
        productCategory: 'Música',
        productArtist: 'HatsuSound Collective',
        productGenre: 'Electronic',
        productFormat: 'Digital',
        description: 'Compra de álbum HatsuSound Vol. 2',
        paymentMethodToken: 'tok_test_12345',
        metadata: {
          releaseDate: '2025-02-15',
          trackCount: 15,
          duration: '52:15'
        }
      };

      const result = await useCase.execute(checkoutData);

      expect(result.isSuccess()).toBe(true);
      
      if (result.isSuccess()) {
        const response = result.value;
        expect(response.success).toBe(true);
        expect(response.paymentType).toBe('direct');
        expect(response.checkoutUrl).toBeUndefined(); // No debe tener URL para pagos directos
        expect(response.wompiTransactionId).toBe('wompi_txn_456');
        expect(response.amount).toBe(75000);
        expect(response.currency).toBe('COP');
      }
      
      console.log('✅ Checkout directo creado exitosamente');
    });

    it('should handle validation errors gracefully', async () => {
      const invalidData = {
        amount: 500, // Menos de 1000
        currency: 'COP',
        customerEmail: 'invalid-email',
        productId: 'album_001',
        productName: 'HatsuSound Vol. 1',
        productCategory: 'Música'
      };

      const result = await useCase.execute(invalidData);

      expect(result.isFailure()).toBe(true);
      
      if (result.isFailure()) {
        const response = result.error;
        expect(response.success).toBe(false);
        expect(response.error).toBeDefined();
        expect(response.errorCode).toBeDefined();
      }
      
      console.log('✅ Validación de errores funcionando correctamente');
    });
  });
});
