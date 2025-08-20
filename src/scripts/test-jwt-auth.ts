#!/usr/bin/env ts-node

import { config } from 'dotenv';
import axios from 'axios';

// Load environment variables
config();

async function testJwtAuth() {
  console.log('🔐 Probando autenticación JWT...\n');

  const baseUrl = 'http://localhost:3012';
  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI4ZDRjNDk4Ny01NjIwLTQ4N2UtYmJkNS1iYzczMjcxNzJmMDkiLCJlbWFpbCI6InVzZXJAZXhhbXBsZS5jb20iLCJ1c2VybmFtZSI6InVzZXJuYW1lMTIzIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzU1NTc4NDY1LCJleHAiOjE3NTU2NjQ4NjV9._E9Jk_0gB7FJ2YcDTFWLcagKqTF9ncpm9eEayoraRBU';

  console.log('📋 Token JWT:');
  console.log(`   ${token.slice(0, 50)}...${token.slice(-50)}`);
  console.log('');

  // Decode JWT payload (without verification)
  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    console.log('📊 Payload del JWT:');
    console.log(`   Subject (sub): ${payload.sub}`);
    console.log(`   Email: ${payload.email}`);
    console.log(`   Username: ${payload.username}`);
    console.log(`   Role: ${payload.role}`);
    console.log(`   Issued at (iat): ${new Date(payload.iat * 1000).toISOString()}`);
    console.log(`   Expires at (exp): ${new Date(payload.exp * 1000).toISOString()}`);
    
    const now = Math.floor(Date.now() / 1000);
    const isExpired = payload.exp < now;
    console.log(`   Current time: ${new Date(now * 1000).toISOString()}`);
    console.log(`   Expired: ${isExpired ? '❌ SÍ' : '✅ NO'}`);
    console.log('');
  } catch (error) {
    console.log('❌ Error decodificando JWT:', error.message);
    console.log('');
  }

  // Test endpoints
  const endpoints = [
    { name: 'Checkout Test Auth', url: '/checkout/test-auth', method: 'GET' },
    { name: 'Payment Test Auth', url: '/payment/test-auth', method: 'GET' },
    { name: 'Checkout Create', url: '/checkout', method: 'POST' },
    { name: 'Payment Provider Info', url: '/payment/provider-info', method: 'GET' },
  ];

  for (const endpoint of endpoints) {
    console.log(`🧪 Probando: ${endpoint.name}`);
    console.log(`   URL: ${endpoint.method} ${baseUrl}${endpoint.url}`);
    
    try {
      const config: any = {
        method: endpoint.method.toLowerCase(),
        url: `${baseUrl}${endpoint.url}`,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      };

      if (endpoint.method === 'POST' && endpoint.url === '/checkout') {
        config.data = {
          amount: 50000,
          currency: "COP",
          customerEmail: "customer@example.com",
          customerName: "Juan Pérez",
          customerPhone: "+573001234567",
          description: "Compra de álbum musical",
          metadata: {
            productId: "123",
            productName: "Álbum de Prueba"
          },
          reference: "TXN-123456"
        };
      }

      const response = await axios(config);
      console.log(`   ✅ Status: ${response.status}`);
      console.log(`   📄 Response: ${JSON.stringify(response.data, null, 2)}`);
    } catch (error: any) {
      if (error.response) {
        console.log(`   ❌ Status: ${error.response.status}`);
        console.log(`   📄 Error: ${JSON.stringify(error.response.data, null, 2)}`);
      } else {
        console.log(`   ❌ Error: ${error.message}`);
      }
    }
    console.log('');
  }

  console.log('📚 Sugerencias de solución:');
  console.log('   1. Verifica que el token JWT no haya expirado');
  console.log('   2. Confirma que el usuario existe en la base de datos');
  console.log('   3. Verifica que el usuario esté activo (isActive: true)');
  console.log('   4. Confirma que JWT_SECRET esté configurado correctamente');
  console.log('   5. Reinicia la aplicación después de los cambios');
}

// Run the test
testJwtAuth().catch(console.error);


