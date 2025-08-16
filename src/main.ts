import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule } from '@nestjs/swagger';
import { swaggerConfig, swaggerOptions } from './infrastructure/config/swagger.config';
import { AuthExceptionFilter } from './infrastructure/common/filters/auth-exception.filter';
import { AuthLoggingInterceptor } from './infrastructure/common/interceptors/auth-logging.interceptor';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  
  const app = await NestFactory.create(AppModule);
  
  // Global pipes
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
  }));

  // Global filters
  app.useGlobalFilters(new AuthExceptionFilter());

  // Global interceptors
  app.useGlobalInterceptors(new AuthLoggingInterceptor());

  // CORS
  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    credentials: true,
  });

  // Swagger documentation
  if (process.env.NODE_ENV !== 'production') {
    const document = SwaggerModule.createDocument(app, swaggerConfig, swaggerOptions);
    SwaggerModule.setup('api', app, document);
    
    logger.log('Swagger documentation available at /api');
  }

  const port = process.env.PORT || 3000;
  await app.listen(port);
  
  logger.log(`🚀 Application is running on: http://localhost:${port}`);
  logger.log(`📚 Swagger docs: http://localhost:${port}/api`);
  logger.log(`🔐 Auth system fully implemented with refresh tokens, roles, and security middleware`);
}

bootstrap();
