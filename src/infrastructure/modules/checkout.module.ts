import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CheckoutController } from '../controllers/checkout.controller';
import { CreateCheckoutUseCase, ProcessWebhookUseCase } from '../../application/use-cases/checkout';
import { TransactionRepository } from '../repositories/transaction.repository';
import { WompiService } from '../services/wompi.service';
import { TransactionEntity } from '../database/entities/transaction.entity';
import { AuthModule } from './auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([TransactionEntity]),
    AuthModule, // Import AuthModule to make JWT guards available
  ],
  controllers: [CheckoutController],
  providers: [
    CreateCheckoutUseCase,
    ProcessWebhookUseCase,
    {
      provide: 'TransactionRepositoryPort',
      useClass: TransactionRepository,
    },
    {
      provide: 'WompiServicePort',
      useClass: WompiService,
    },
    TransactionRepository,
    WompiService,
  ],
  exports: [
    CreateCheckoutUseCase,
    ProcessWebhookUseCase,
    TransactionRepository,
    WompiService,
  ],
})
export class CheckoutModule {}
