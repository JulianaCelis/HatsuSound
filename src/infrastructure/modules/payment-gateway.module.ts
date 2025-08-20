import { Module } from '@nestjs/common';
import { PaymentGatewayController } from '../controllers/payment-gateway.controller';
import { PaymentGatewayService } from '../services/payment-gateway.service';
import { WompiService } from '../services/wompi.service';
import { AuthModule } from './auth.module';

@Module({
  imports: [AuthModule], // Import AuthModule to make JWT guards available
  controllers: [PaymentGatewayController],
  providers: [
    PaymentGatewayService,
    {
      provide: 'WompiServicePort',
      useClass: WompiService,
    },
    WompiService,
  ],
  exports: [PaymentGatewayService],
})
export class PaymentGatewayModule {}
