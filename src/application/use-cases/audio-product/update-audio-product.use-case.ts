import { Injectable, Inject } from '@nestjs/common';
import { BaseUseCase } from '../base/base.use-case';
import { UpdateAudioProductRequest, AudioProductResponse, AudioProductError } from '@/domain/ports/input/audio-product.port';
import { IAudioProductRepositoryPort } from '@/domain/ports/output/audio-product.repository.port';
import { Result, Success, Failure } from '@/domain/ports';

@Injectable()
export class UpdateAudioProductUseCase extends BaseUseCase<{ id: string; data: UpdateAudioProductRequest }, AudioProductResponse, AudioProductError> {
  constructor(
    @Inject('AUDIO_PRODUCT_REPOSITORY')
    private readonly audioProductRepository: IAudioProductRepositoryPort,
  ) {
    super();
  }

  async execute(request: { id: string; data: UpdateAudioProductRequest }): Promise<Result<AudioProductResponse, AudioProductError>> {
    try {
      const { id, data } = request;

      if (!id || id.trim() === '') {
        return new Failure({ type: 'VALIDATION_ERROR', message: 'ID is required' });
      }

      if (!data || Object.keys(data).length === 0) {
        return new Failure({ type: 'VALIDATION_ERROR', message: 'Update data is required' });
      }

      // Validar campos específicos si están presentes
      if (data.price !== undefined && data.price < 0) {
        return new Failure({ type: 'PRICE_INVALID', message: 'Price cannot be negative' });
      }

      if (data.stock !== undefined && data.stock < 0) {
        return new Failure({ type: 'VALIDATION_ERROR', message: 'Stock cannot be negative' });
      }

      if (data.duration !== undefined && data.duration <= 0) {
        return new Failure({ type: 'VALIDATION_ERROR', message: 'Duration must be positive' });
      }

      if (data.bitrate !== undefined && data.bitrate <= 0) {
        return new Failure({ type: 'VALIDATION_ERROR', message: 'Bitrate must be positive' });
      }

      const result = await this.audioProductRepository.update(id, data);

      if (result.isSuccess()) {
        const audioProduct = result.value;
        
        // Convertir la entidad actualizada a la respuesta esperada
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
