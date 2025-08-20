import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AudioProductController } from '../controllers/audio-product.controller';
import { AudioProductService } from '../services/audio-product.service';
import { AudioProductRepository } from '../repositories/audio-product.repository';
import { AudioProductEntity } from '../database/entities/audio-product.entity';
import { AUDIO_PRODUCT_REPOSITORY } from '@/domain/ports/output/audio-product.repository.port';

@Module({
  imports: [
    TypeOrmModule.forFeature([AudioProductEntity]),
  ],
  controllers: [AudioProductController],
  providers: [
    AudioProductService,
    AudioProductRepository,
    {
      provide: AUDIO_PRODUCT_REPOSITORY,
      useClass: AudioProductRepository,
    },
  ],
  exports: [
    AudioProductService,
    AudioProductRepository,
    {
      provide: AUDIO_PRODUCT_REPOSITORY,
      useClass: AudioProductRepository,
    },
  ],
})
export class AudioProductModule {}
