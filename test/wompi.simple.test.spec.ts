import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { WompiService } from '../src/infrastructure/services/wompi.service';

describe('Wompi Simple Test', () => {
  let wompiService: WompiService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WompiService,
        {
          provide: ConfigService,
          useValue: {
            get: (key: string) => {
              const config = {
                WOMPI_PUBLIC_KEY: 'pub_stagtest_g2u0HQd3ZMh05hsSgTS2lUV8t3s4mOt7',
                WOMPI_PRIVATE_KEY: 'prv_stagtest_5I0ZGIGQqFWg',
                WOMPI_INTEGRITY_KEY: 'stagtest_integrity_nAlBuqayW70XpUqJS4qf4STYilSd89Fp',
                WOMPI_EVENTS_KEY: 'stagtest_events_w39N',
                WOMPI_ENVIRONMENT: 'uat_sandbox',
                WOMPI_FRONTEND_URL: 'http://localhost:3000',
              };
              return config[key];
            },
          },
        },
      ],
    }).compile();

    wompiService = module.get<WompiService>(WompiService);
  });

  it('✅ Debería crear una transacción NEQUI exitosamente', async () => {
    try {
      const result = await wompiService.createIntentCheckout({
        amount_in_cents: 150000, // 1500 COP (mínimo de Wompi)
        currency: 'COP',
        customer_email: 'test@hatsusound.com',
        reference: 'TEST_SIMPLE_001',
        customer_data: {
          phone_number: '3991111111' // Número de prueba de Wompi
        }
      });

      expect(result?.data?.id).toBeDefined();
      expect(result?.data?.status).toBeDefined();
      
    } catch (error: any) {
      throw error;
    }
  }, 30000);
});
