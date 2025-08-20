import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { DatabaseModule } from './infrastructure/database/database.module';
import { UserModule } from './infrastructure/modules/user.module';
import { AuthModule } from './infrastructure/modules/auth.module';
import { AudioProductModule } from './infrastructure/modules/audio-product.module';
import { CheckoutModule } from './infrastructure/modules/checkout.module';
import { PaymentGatewayModule } from './infrastructure/modules/payment-gateway.module';
import { LoggerMiddleware } from './infrastructure/common/middleware/logger.middleware';
import { RateLimitMiddleware } from './infrastructure/common/middleware/rate-limit.middleware';
import { TokenCleanupService } from './infrastructure/services/token-cleanup.service';
import { HealthController } from './infrastructure/controllers/health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ScheduleModule.forRoot(),
    DatabaseModule,
    UserModule,
    AuthModule,
    AudioProductModule,
    CheckoutModule,
    PaymentGatewayModule,
  ],
  controllers: [HealthController],
  providers: [TokenCleanupService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware, RateLimitMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
