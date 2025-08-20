import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentGatewayService, CreatePaymentRequest, PaymentResponse } from '../services/payment-gateway.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('Payment Gateway')
@Controller('payment')
export class PaymentGatewayController {
  constructor(private readonly paymentGatewayService: PaymentGatewayService) {}

  @Post('create')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user', 'admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new payment with the configured provider' })
  @ApiResponse({ 
    status: 201, 
    description: 'Payment created successfully',
    type: PaymentResponse 
  })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async createPayment(@Body() request: CreatePaymentRequest): Promise<PaymentResponse> {
    return this.paymentGatewayService.createPayment(request);
  }

  @Get('provider-info')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get current payment provider configuration' })
  @ApiResponse({ status: 200, description: 'Provider info retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  async getProviderInfo() {
    return this.paymentGatewayService.getConfiguration();
  }

  @Get('test-wompi-connection')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Test Wompi connection and get merchant information' })
  @ApiResponse({ status: 200, description: 'Connection test completed' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  async testWompiConnection() {
    return this.paymentGatewayService.testWompiConnection();
  }

  @Get('test-auth')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Test JWT authentication',
    description: 'Simple endpoint to test if JWT authentication is working'
  })
  @ApiResponse({ status: 200, description: 'Authentication successful' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
  async testAuth(): Promise<any> {
    return { 
      message: 'JWT authentication is working in Payment Gateway!',
      timestamp: new Date().toISOString()
    };
  }

  @Get('status/:transactionId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get payment status from the configured provider' })
  @ApiResponse({ status: 200, description: 'Payment status retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getPaymentStatus(transactionId: string) {
    return this.paymentGatewayService.getPaymentStatus(transactionId);
  }
}
