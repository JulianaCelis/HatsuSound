import { Injectable, Inject } from '@nestjs/common';
import { 
  IAudioProductInputPort,
  CreateAudioProductRequest,
  AudioProductResponse,
  Result,
  Success,
  Failure,
  AudioProductError
} from '@/domain/ports';
import { IAudioProductRepositoryPort } from '@/domain/ports/output/audio-product.repository.port';
import { AudioFormat, AudioGenre, AgeRestriction } from '@/domain/entities/audio-product.entity';
import { AudioProduct as AudioProductDB } from '@/infrastructure/database/entities/audio-product.entity';
import { AUDIO_PRODUCT_REPOSITORY } from '@/domain/ports/output/audio-product.repository.port';

@Injectable()
export class CreateAudioProductUseCase implements IAudioProductInputPort {
  constructor(
    @Inject(AUDIO_PRODUCT_REPOSITORY)
    private readonly audioProductRepository: IAudioProductRepositoryPort
  ) {}

  async createProduct(request: CreateAudioProductRequest): Promise<Result<AudioProductResponse, AudioProductError>> {
    try {
      // 1. Validar request
      const validationResult = this.validateRequest(request);
      if (validationResult.isFailure()) {
        return validationResult;
      }

      // 2. Verificar unicidad
      const uniquenessResult = await this.verifyUniqueness(request);
      if (uniquenessResult.isFailure()) {
        return uniquenessResult;
      }

      // 3. Crear producto
      const productData = {
        title: request.title,
        description: request.description,
        artist: request.artist,
        genre: request.genre as AudioGenre,
        audioUrl: request.audioUrl,
        duration: request.duration,
        format: request.format as AudioFormat,
        bitrate: request.bitrate,
        price: request.price,
        stock: request.stock,
        isActive: true,
        tags: request.tags,
        releaseDate: request.releaseDate,
        language: request.language,
        isExplicit: request.isExplicit || false,
        ageRestriction: request.ageRestriction || AgeRestriction.ALL_AGES,
        playCount: 0,
        downloadCount: 0
      };

      const productResult = await this.audioProductRepository.create(productData);
      if (productResult.isFailure()) {
        return new Failure({
          type: 'VALIDATION_ERROR',
          message: 'Error al crear producto: ' + productResult.error.message
        });
      }

      // 4. Preparar respuesta
      return new Success(this.mapToResponse(productResult.value));

    } catch (error) {
      return new Failure({
        type: 'VALIDATION_ERROR',
        message: 'Error interno del servidor: ' + error.message
      });
    }
  }

  // Métodos auxiliares
  private validateRequest(request: CreateAudioProductRequest): Result<void, AudioProductError> {
    // Validaciones básicas
    if (!request.title || !request.description || !request.artist || !request.audioUrl) {
      return new Failure({
        type: 'VALIDATION_ERROR',
        message: 'Todos los campos obligatorios son requeridos'
      });
    }

    // Validar formato de audio
    if (!Object.values(AudioFormat).includes(request.format as AudioFormat)) {
      return new Failure({
        type: 'INVALID_AUDIO_FORMAT',
        message: 'Formato de audio no válido'
      });
    }

    // Validar género
    if (!Object.values(AudioGenre).includes(request.genre as AudioGenre)) {
      return new Failure({
        type: 'VALIDATION_ERROR',
        message: 'Género no válido'
      });
    }

    // Validar duración
    if (request.duration <= 0 || request.duration > 7200) { // Máximo 2 horas
      return new Failure({
        type: 'VALIDATION_ERROR',
        message: 'La duración debe estar entre 1 segundo y 2 horas'
      });
    }

    // Validar bitrate
    if (request.bitrate <= 0 || request.bitrate > 320) {
      return new Failure({
        type: 'VALIDATION_ERROR',
        message: 'El bitrate debe estar entre 1 y 320 kbps'
      });
    }

    // Validar precio
    if (request.price < 0) {
      return new Failure({
        type: 'PRICE_INVALID',
        message: 'El precio no puede ser negativo'
      });
    }

    // Validar stock
    if (request.stock < 0) {
      return new Failure({
        type: 'VALIDATION_ERROR',
        message: 'El stock no puede ser negativo'
      });
    }

    // Validar URL de audio
    if (!this.isValidAudioUrl(request.audioUrl)) {
      return new Failure({
        type: 'INVALID_AUDIO_URL',
        message: 'URL de audio no válida'
      });
    }

    return new Success(undefined);
  }

  private async verifyUniqueness(request: CreateAudioProductRequest): Promise<Result<void, AudioProductError>> {
    // Verificar si ya existe un producto con el mismo título y artista
    const titleExistsResult = await this.audioProductRepository.existsByTitle(request.title, request.artist);
    if (titleExistsResult.isFailure()) {
      return new Failure({
        type: 'VALIDATION_ERROR',
        message: 'Error al verificar título: ' + titleExistsResult.error.message
      });
    }

    if (titleExistsResult.value) {
      return new Failure({
        type: 'DUPLICATE_PRODUCT',
        message: 'Ya existe un producto con el mismo título y artista'
      });
    }

    // Verificar si ya existe un producto con la misma URL de audio
    const urlExistsResult = await this.audioProductRepository.existsByAudioUrl(request.audioUrl);
    if (urlExistsResult.isFailure()) {
      return new Failure({
        type: 'VALIDATION_ERROR',
        message: 'Error al verificar URL: ' + urlExistsResult.error.message
      });
    }

    if (urlExistsResult.value) {
      return new Failure({
        type: 'DUPLICATE_PRODUCT',
        message: 'Ya existe un producto con la misma URL de audio'
      });
    }

    return new Success(undefined);
  }

  private isValidAudioUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'https:' && urlObj.hostname.includes('s3');
    } catch {
      return false;
    }
  }

  private mapToResponse(product: AudioProductDB): AudioProductResponse {
    return {
      id: product.id,
      title: product.title,
      description: product.description,
      artist: product.artist,
      genre: product.genre,
      audioUrl: product.audioUrl,
      duration: product.duration,
      format: product.format,
      bitrate: product.bitrate,
      price: product.price,
      stock: product.stock,
      isActive: product.isActive,
      tags: product.tags,
      releaseDate: product.releaseDate,
      language: product.language,
      isExplicit: product.isExplicit,
      ageRestriction: product.ageRestriction,
      playCount: product.playCount,
      downloadCount: product.downloadCount,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt
    };
  }

  // Implementación de otros métodos del puerto (placeholder)
  async getProductById(id: string): Promise<Result<AudioProductResponse, AudioProductError>> {
    throw new Error('Not implemented');
  }

  async updateProduct(id: string, request: any): Promise<Result<AudioProductResponse, AudioProductError>> {
    throw new Error('Not implemented');
  }

  async deleteProduct(id: string): Promise<Result<{ message: string }, AudioProductError>> {
    throw new Error('Not implemented');
  }

  async listProducts(request: any): Promise<Result<any, AudioProductError>> {
    throw new Error('Not implemented');
  }

  async searchProducts(request: any): Promise<Result<any, AudioProductError>> {
    throw new Error('Not implemented');
  }

  async updateStock(id: string, quantity: number, operation: 'increase' | 'decrease'): Promise<Result<AudioProductResponse, AudioProductError>> {
    throw new Error('Not implemented');
  }

  async incrementPlayCount(id: string): Promise<Result<AudioProductResponse, AudioProductError>> {
    throw new Error('Not implemented');
  }

  async incrementDownloadCount(id: string): Promise<Result<AudioProductResponse, AudioProductError>> {
    throw new Error('Not implemented');
  }

  async activateProduct(id: string): Promise<Result<AudioProductResponse, AudioProductError>> {
    throw new Error('Not implemented');
  }

  async deactivateProduct(id: string): Promise<Result<AudioProductResponse, AudioProductError>> {
    throw new Error('Not implemented');
  }
}
