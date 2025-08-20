import { Injectable, Inject } from '@nestjs/common';
import { BaseUseCase } from '../base/base.use-case';
import { AudioProductError } from '@/domain/ports/input/audio-product.port';
import { IAudioProductRepositoryPort } from '@/domain/ports/output/audio-product.repository.port';
import { Result, Success, Failure } from '@/domain/ports';

@Injectable()
export class DeleteAudioProductUseCase extends BaseUseCase<string, { message: string }, AudioProductError> {
  constructor(
    @Inject('AUDIO_PRODUCT_REPOSITORY')
    private readonly audioProductRepository: IAudioProductRepositoryPort,
  ) {
    super();
  }

  async execute(id: string): Promise<Result<{ message: string }, AudioProductError>> {
    try {
      if (!id || id.trim() === '') {
        return new Failure({ type: 'VALIDATION_ERROR', message: 'ID is required' });
      }

      // Primero verificar que el producto existe
      const findResult = await this.audioProductRepository.findById(id);
      
      if (!findResult.isSuccess()) {
        return new Failure({ type: 'PRODUCT_NOT_FOUND', message: 'Audio product not found' });
      }

      const deleteResult = await this.audioProductRepository.delete(id);

      if (deleteResult.isSuccess()) {
        return new Success({ message: 'Audio product deleted successfully' });
      } else {
        return new Failure({ type: 'VALIDATION_ERROR', message: 'Error deleting audio product' });
      }
    } catch (error) {
      return new Failure({ type: 'VALIDATION_ERROR', message: 'Error interno del servidor: ' + error.message });
    }
  }
}
