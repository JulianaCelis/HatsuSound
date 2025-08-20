import { Injectable, Inject } from '@nestjs/common';
import { BaseUseCase } from '../base/base.use-case';
import { AudioProductResponse, AudioProductError } from '@/domain/ports/input/audio-product.port';
import { IAudioProductRepositoryPort } from '@/domain/ports/output/audio-product.repository.port';
import { Result, Success, Failure } from '@/domain/ports';

@Injectable()
export class GetAudioProductUseCase extends BaseUseCase<string, AudioProductResponse, AudioProductError> {
  constructor(
    @Inject('AUDIO_PRODUCT_REPOSITORY')
    private readonly audioProductRepository: IAudioProductRepositoryPort,
  ) {
    super();
  }

  async execute(id: string): Promise<Result<AudioProductResponse, AudioProductError>> {
    try {
      if (!id || id.trim() === '') {
        return new Failure({ type: 'VALIDATION_ERROR', message: 'ID is required' });
      }

      const result = await this.audioProductRepository.findById(id);

      if (result.isSuccess()) {
        const audioProduct = result.value;
        
        // Convertir la entidad a la respuesta esperada
        const response: AudioProductResponse = {
          id: audioProduct.id,
          title: audioProduct.title,
          description: audioProduct.description,
          artist: audioProduct.artist,
          genre: audioProduct.genre,
          audioUrl: audioProduct.audioUrl,
          duration: audioProduct.duration,
          format: audioProduct.format,
          bitrate: audioProduct.bitrate,
          price: audioProduct.price,
          stock: audioProduct.stock,
          isActive: audioProduct.isActive,
          tags: audioProduct.tags,
          releaseDate: audioProduct.releaseDate,
          language: audioProduct.language,
          isExplicit: audioProduct.isExplicit,
          ageRestriction: audioProduct.ageRestriction,
          playCount: audioProduct.playCount,
          downloadCount: audioProduct.downloadCount,
          createdAt: audioProduct.createdAt,
          updatedAt: audioProduct.updatedAt,
        };

        return new Success(response);
      } else {
        return new Failure({ type: 'PRODUCT_NOT_FOUND', message: 'Audio product not found' });
      }
    } catch (error) {
      return new Failure({ type: 'VALIDATION_ERROR', message: 'Error interno del servidor: ' + error.message });
    }
  }
}
