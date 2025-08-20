import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  environment: process.env.NODE_ENV || 'development',
  apiPrefix: process.env.API_PREFIX || 'api',
  wompi: {
    environment: process.env.WOMPI_ENVIRONMENT || 'staging',
    webhookUrl: process.env.WEBHOOK_URL || 'http://localhost:3012',
  },
}));
