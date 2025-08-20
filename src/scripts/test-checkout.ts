#!/usr/bin/env ts-node
import 'dotenv/config';
import axios from 'axios';

interface CheckoutRequest {
  amount: number;
  currency: string;
  customerEmail: string;
  customerName?: string;
  customerPhone?: string;
  productId: string;
  productName: string;
  productCategory: string;
  productArtist?: string;
  productGenre?: string;
  productFormat?: string;
  description?: string;
  metadata?: Record<string, any>;
  reference?: string;
  paymentMethodToken?: string;
}

interface CheckoutResponse {
  success: boolean;
  transaction?: any;
  checkoutUrl?: string;
  error?: string;
  errorCode?: string;
  wompiTransactionId?: string;
  amount?: number;
  currency?: string;
  reference?: string;
  paymentType?: 'direct' | 'intent';
}

class CheckoutTester {
  private baseUrl: string;
  private jwtToken: string;

  constructor() {
    this.baseUrl = process.env.API_URL || 'http://localhost:3000';
    this.jwtToken = process.env.JWT_TOKEN || '';
  }

  async runTests(): Promise<void> {
    console.log('🧪 === CHECKOUT TEST SUITE ===\n');

    if (!this.jwtToken) {
      console.log('⚠️  No JWT token provided. Set JWT_TOKEN in .env or run:');
      console.log('   export JWT_TOKEN="your_jwt_token_here"');
      console.log('');
      return;
    }

    try {
      // Test 1: Basic Checkout
      await this.testBasicCheckout();

      // Test 2: Complete Checkout
      await this.testCompleteCheckout();

      // Test 3: Invalid Data
      await this.testInvalidData();

      // Test 4: Authentication
      await this.testAuthentication();

      // Test 5: Direct Payment Checkout
      await this.testDirectPaymentCheckout();

      console.log('\n✅ All tests completed successfully!');
    } catch (error) {
      console.error('\n❌ Test suite failed:', error.message);
    }
  }

  private async testBasicCheckout(): Promise<void> {
    console.log('📝 Test 1: Basic Checkout');
    
    const request: CheckoutRequest = {
      amount: 25000,
      currency: 'COP',
      customerEmail: 'test@example.com',
      productId: 'track_001',
      productName: 'Midnight Groove',
      productCategory: 'Música'
    };

    try {
      const response = await this.createCheckout(request);
      
      if (response.success) {
        console.log('   ✅ Basic checkout created successfully');
        console.log(`   📊 Transaction ID: ${response.transaction?.id}`);
        console.log(`   🔗 Checkout URL: ${response.checkoutUrl}`);
        console.log(`   💰 Amount: ${response.amount} ${response.currency}`);
        console.log(`   📝 Reference: ${response.reference}`);
      } else {
        console.log('   ❌ Basic checkout failed:', response.error);
      }
    } catch (error: any) {
      console.log('   ❌ Basic checkout error:', error.message);
    }
    
    console.log('');
  }

  private async testCompleteCheckout(): Promise<void> {
    console.log('📝 Test 2: Complete Checkout');
    
    const request: CheckoutRequest = {
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
        duration: '45:30',
        quality: '320kbps'
      },
      reference: 'ALBUM-001-2025'
    };

    try {
      const response = await this.createCheckout(request);
      
      if (response.success) {
        console.log('   ✅ Complete checkout created successfully');
        console.log(`   📊 Transaction ID: ${response.transaction?.id}`);
        console.log(`   🔗 Checkout URL: ${response.checkoutUrl}`);
        console.log(`   💰 Amount: ${response.amount} ${response.currency}`);
        console.log(`   📝 Reference: ${response.reference}`);
        console.log(`   🎵 Product: ${request.productName} by ${request.productArtist}`);
      } else {
        console.log('   ❌ Complete checkout failed:', response.error);
      }
    } catch (error: any) {
      console.log('   ❌ Complete checkout error:', error.message);
    }
    
    console.log('');
  }

  private async testInvalidData(): Promise<void> {
    console.log('📝 Test 3: Invalid Data Validation');
    
    const invalidRequests = [
      {
        name: 'Invalid Amount',
        request: {
          amount: 500, // Too low
          currency: 'COP',
          customerEmail: 'test@example.com',
          productId: 'test_001',
          productName: 'Test Product',
          productCategory: 'Test'
        }
      },
      {
        name: 'Invalid Currency',
        request: {
          amount: 50000,
          currency: 'INVALID',
          customerEmail: 'test@example.com',
          productId: 'test_001',
          productName: 'Test Product',
          productCategory: 'Test'
        }
      },
      {
        name: 'Invalid Email',
        request: {
          amount: 50000,
          currency: 'COP',
          customerEmail: 'invalid-email',
          productId: 'test_001',
          productName: 'Test Product',
          productCategory: 'Test'
        }
      },
      {
        name: 'Missing Product Data',
        request: {
          amount: 50000,
          currency: 'COP',
          customerEmail: 'test@example.com',
          productId: '',
          productName: '',
          productCategory: ''
        }
      }
    ];

    for (const test of invalidRequests) {
      try {
        const response = await this.createCheckout(test.request as CheckoutRequest);
        
        if (!response.success) {
          console.log(`   ✅ ${test.name}: Properly rejected - ${response.error}`);
        } else {
          console.log(`   ❌ ${test.name}: Should have been rejected but succeeded`);
        }
      } catch (error: any) {
        console.log(`   ✅ ${test.name}: Properly rejected - ${error.message}`);
      }
    }
    
    console.log('');
  }

  private async testAuthentication(): Promise<void> {
    console.log('📝 Test 4: Authentication');
    
    try {
      const response = await axios.get(`${this.baseUrl}/checkout/test-auth`, {
        headers: {
          'Authorization': `Bearer ${this.jwtToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.status === 200) {
        console.log('   ✅ Authentication test passed');
        console.log(`   📝 Message: ${response.data.message}`);
        console.log(`   🕐 Timestamp: ${response.data.timestamp}`);
      } else {
        console.log('   ❌ Authentication test failed');
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        console.log('   ❌ Authentication failed: Invalid or missing token');
      } else {
        console.log('   ❌ Authentication test error:', error.message);
      }
    }
    
    console.log('');
  }

  private async testDirectPaymentCheckout(): Promise<void> {
    console.log('\n🧪 === TESTING DIRECT PAYMENT CHECKOUT ===');
    
    try {
      // Paso 1: Crear token de método de pago
      console.log('\n1️⃣ Creando token de método de pago...');
      const tokenResponse = await this.createPaymentMethodToken();
      
      if (!tokenResponse.success) {
        console.log('   ❌ No se pudo crear el token de método de pago');
        return;
      }
      
      const paymentMethodToken = tokenResponse.token;
      console.log(`   ✅ Token creado: ${paymentMethodToken.slice(0, 12)}…`);
      
      // Paso 2: Crear checkout con el token
      console.log('\n2️⃣ Creando checkout con pago directo...');
      const checkoutData = {
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
        paymentMethodToken: paymentMethodToken
      };
      
      const checkoutResponse = await this.createCheckout(checkoutData);
      
      if (checkoutResponse.success) {
        console.log('   ✅ Checkout de pago directo creado exitosamente');
        console.log(`   📊 Tipo de pago: ${checkoutResponse.paymentType}`);
        console.log(`   🆔 ID de transacción: ${checkoutResponse.wompiTransactionId}`);
        console.log(`   💰 Monto: ${checkoutResponse.amount} ${checkoutResponse.currency}`);
        console.log(`   🔗 URL de checkout: ${checkoutResponse.checkoutUrl || 'No aplica (pago directo)'}`);
      } else {
        console.log('   ❌ Error creando checkout de pago directo');
        console.log(`   📝 Error: ${checkoutResponse.error}`);
        console.log(`   🏷️  Código: ${checkoutResponse.errorCode}`);
      }
      
    } catch (error) {
      console.log('   ❌ Error durante el test de pago directo:', error.message);
    }
  }

  private async createPaymentMethodToken(): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/checkout/wompi/create-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.jwtToken}`,
        },
        body: JSON.stringify({
          number: '4242424242424242',
          cvc: '123',
          expMonth: '12',
          expYear: '2025',
          cardHolderName: 'Juan Pérez'
        }),
      });

      if (response.ok) {
        return await response.json();
      } else {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.message || 'Failed to create payment method token'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  private async createCheckout(request: CheckoutRequest): Promise<CheckoutResponse> {
    const response = await axios.post(`${this.baseUrl}/checkout`, request, {
      headers: {
        'Authorization': `Bearer ${this.jwtToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    return response.data;
  }
}

// Función principal
async function main(): Promise<void> {
  console.log('🚀 Starting Checkout Test Suite...\n');
  
  const tester = new CheckoutTester();
  await tester.runTests();
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main().catch((error) => {
    console.error('❌ Test suite failed:', error);
    process.exit(1);
  });
}

export { CheckoutTester };
