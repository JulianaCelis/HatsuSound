import { Injectable, Inject } from '@nestjs/common';
import { BaseUseCase } from '../base/base.use-case';
import { CreateAudioProductRequest, AudioProductResponse } from '@/domain/ports/input/audio-product.port';
import { IAudioProductRepositoryPort } from '@/domain/ports/output/audio-product.repository.port';
import { AudioFormat, AudioGenre, AgeRestriction } from '@/domain/entities/audio-product.entity';
import { AudioProductEntity } from '@/infrastructure/database/entities/audio-product.entity';
import { Result, Success, Failure } from '@/domain/ports';
import { AudioProductError } from '@/domain/ports/input/audio-product.port';

@Injectable()
export class CreateAudioProductUseCase extends BaseUseCase<CreateAudioProductRequest, AudioProductResponse, AudioProductError> {
  constructor(
    @Inject('AUDIO_PRODUCT_REPOSITORY')
    private readonly audioProductRepository: IAudioProductRepositoryPort,
  ) {
    super();
  }

  async execute(request: CreateAudioProductRequest): Promise<Result<AudioProductResponse, AudioProductError>> {
    try {
      // Crear la entidad de base de datos
      const audioProduct = new AudioProductEntity();
      Object.assign(audioProduct, {
        title: request.title,
        description: request.description,
        artist: request.artist,
        genre: request.genre,
        audioUrl: request.audioUrl,
        duration: request.duration,
        format: request.format,
        bitrate: request.bitrate,
        price: request.price,
        stock: request.stock || 0,
        tags: request.tags || [],
        releaseDate: request.releaseDate,
        language: request.language || 'es',
        isExplicit: request.isExplicit || false,
        ageRestriction: request.ageRestriction || AgeRestriction.ALL_AGES,
      });

      const result = await this.audioProductRepository.create(audioProduct);

      if (result.isSuccess()) {
        return new Success(result.value);
      } else {
        return new Failure({ type: 'VALIDATION_ERROR', message: 'Error creating audio product' });
      }
    } catch (error) {
      return new Failure({ type: 'VALIDATION_ERROR', message: 'Error interno del servidor: ' + error.message });
    }
  }
}
