import { Injectable, Inject } from '@nestjs/common';
import { 
  IAudioProductInputPort,
  AudioProductResponse,
  AudioProductListResponse,
  Result,
  Success,
  Failure,
  AudioProductError
} from '@/domain/ports';
import { IAudioProductRepositoryPort } from '@/domain/ports/output/audio-product.repository.port';
import { AudioFormat, AudioGenre, AgeRestriction } from '@/domain/entities/audio-product.entity';
import { AUDIO_PRODUCT_REPOSITORY } from '@/domain/ports/output/audio-product.repository.port';
import { AudioProduct as AudioProductDB } from '@/infrastructure/database/entities/audio-product.entity';
import { CreateAudioProductDto, UpdateAudioProductDto, SearchAudioProductsDto } from '../dto/audio-product.dto';

@Injectable()
export class AudioProductService implements IAudioProductInputPort {
  constructor(
    @Inject(AUDIO_PRODUCT_REPOSITORY)
    private readonly audioProductRepository: IAudioProductRepositoryPort
  ) {}

  async createProduct(request: CreateAudioProductDto): Promise<Result<AudioProductResponse, AudioProductError>> {
    try {
      // Validar request
      const validationResult = this.validateCreateRequest(request);
      if (validationResult.isFailure()) {
        return validationResult;
      }

      // Verificar unicidad
      const uniquenessResult = await this.verifyUniqueness(request);
      if (uniquenessResult.isFailure()) {
        return uniquenessResult;
      }

      // Crear producto
      const productData = {
        title: request.title,
        description: request.description,
        artist: request.artist,
        genre: request.genre,
        audioUrl: request.audioUrl,
        duration: request.duration,
        format: request.format,
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

      return new Success(this.mapToResponse(productResult.value));
    } catch (error) {
      return new Failure({
        type: 'VALIDATION_ERROR',
        message: 'Error interno del servidor: ' + error.message
      });
    }
  }

  async getProductById(id: string): Promise<Result<AudioProductResponse, AudioProductError>> {
    try {
      const productResult = await this.audioProductRepository.findById(id);
      if (productResult.isFailure()) {
        return new Failure({
          type: 'PRODUCT_NOT_FOUND',
          message: 'Producto no encontrado'
        });
      }

      return new Success(this.mapToResponse(productResult.value));
    } catch (error) {
      return new Failure({
        type: 'VALIDATION_ERROR',
        message: 'Error interno del servidor: ' + error.message
      });
    }
  }

  async updateProduct(id: string, request: UpdateAudioProductDto): Promise<Result<AudioProductResponse, AudioProductError>> {
    try {
      // Verificar que el producto existe
      const existingProduct = await this.audioProductRepository.findById(id);
      if (existingProduct.isFailure()) {
        return new Failure({
          type: 'PRODUCT_NOT_FOUND',
          message: 'Producto no encontrado'
        });
      }

      // Construir updateData tipado correctamente y validar enums
      const updateData: Partial<AudioProductDB> = {};

      if (request.title !== undefined) updateData.title = request.title;
      if (request.description !== undefined) updateData.description = request.description;
      if (request.artist !== undefined) updateData.artist = request.artist;
      if (request.audioUrl !== undefined) updateData.audioUrl = request.audioUrl;
      if (request.duration !== undefined) updateData.duration = request.duration;
      if (request.bitrate !== undefined) updateData.bitrate = request.bitrate;
      if (request.price !== undefined) updateData.price = request.price as any;
      if (request.stock !== undefined) updateData.stock = request.stock;
      if (request.tags !== undefined) updateData.tags = request.tags;
      if (request.releaseDate !== undefined) updateData.releaseDate = request.releaseDate as any;
      if (request.language !== undefined) updateData.language = request.language;
      if (request.isExplicit !== undefined) updateData.isExplicit = request.isExplicit;
      if (request.isActive !== undefined) updateData.isActive = request.isActive;

      if (request.ageRestriction !== undefined) {
        if (!Object.values(AgeRestriction).includes(request.ageRestriction)) {
          return new Failure({
            type: 'VALIDATION_ERROR',
            message: 'Restricción de edad no válida'
          });
        }
        updateData.ageRestriction = request.ageRestriction;
      }

      if (request.genre !== undefined) {
        if (!Object.values(AudioGenre).includes(request.genre)) {
          return new Failure({
            type: 'VALIDATION_ERROR',
            message: 'Género no válido'
          });
        }
        updateData.genre = request.genre;
      }

      if (request.format !== undefined) {
        if (!Object.values(AudioFormat).includes(request.format)) {
          return new Failure({
            type: 'INVALID_AUDIO_FORMAT',
            message: 'Formato de audio no válido'
          });
        }
        updateData.format = request.format;
      }

      const productResult = await this.audioProductRepository.update(id, updateData);
      if (productResult.isFailure()) {
        return new Failure({
          type: 'VALIDATION_ERROR',
          message: 'Error al actualizar producto: ' + productResult.error.message
        });
      }

      return new Success(this.mapToResponse(productResult.value));
    } catch (error) {
      return new Failure({
        type: 'VALIDATION_ERROR',
        message: 'Error interno del servidor: ' + error.message
      });
    }
  }

  async deleteProduct(id: string): Promise<Result<{ message: string }, AudioProductError>> {
    try {
      const deleteResult = await this.audioProductRepository.delete(id);
      if (deleteResult.isFailure()) {
        return new Failure({
          type: 'PRODUCT_NOT_FOUND',
          message: 'Producto no encontrado'
        });
      }

      return new Success({ message: 'Producto eliminado exitosamente' });
    } catch (error) {
      return new Failure({
        type: 'VALIDATION_ERROR',
        message: 'Error interno del servidor: ' + error.message
      });
    }
  }

  async listProducts(request: SearchAudioProductsDto): Promise<Result<AudioProductListResponse, AudioProductError>> {
    try {
      const productsResult = await this.audioProductRepository.findAll(request);
      if (productsResult.isFailure()) {
        return new Failure({
          type: 'VALIDATION_ERROR',
          message: 'Error al listar productos: ' + productsResult.error.message
        });
      }

      const products = productsResult.value.products.map(product => this.mapToResponse(product));
      return new Success({
        products,
        total: productsResult.value.total,
        page: productsResult.value.page,
        limit: productsResult.value.limit,
        totalPages: productsResult.value.totalPages
      });
    } catch (error) {
      return new Failure({
        type: 'VALIDATION_ERROR',
        message: 'Error interno del servidor: ' + error.message
      });
    }
  }

  async searchProducts(request: SearchAudioProductsDto): Promise<Result<AudioProductListResponse, AudioProductError>> {
    try {
      const searchResult = await this.audioProductRepository.search(request);
      if (searchResult.isFailure()) {
        return new Failure({
          type: 'VALIDATION_ERROR',
          message: 'Error al buscar productos: ' + searchResult.error.message
        });
      }

      const products = searchResult.value.products.map(product => this.mapToResponse(product));
      return new Success({
        products,
        total: searchResult.value.total,
        page: searchResult.value.page,
        limit: searchResult.value.limit,
        totalPages: searchResult.value.totalPages
      });
    } catch (error) {
      return new Failure({
        type: 'VALIDATION_ERROR',
        message: 'Error interno del servidor: ' + error.message
      });
    }
  }

  async updateStock(id: string, quantity: number, operation: 'increase' | 'decrease'): Promise<Result<AudioProductResponse, AudioProductError>> {
    try {
      const product = await this.audioProductRepository.findById(id);
      if (product.isFailure()) {
        return new Failure({
          type: 'PRODUCT_NOT_FOUND',
          message: 'Producto no encontrado'
        });
      }

      const currentStock = product.value.stock;
      let newStock: number;

      if (operation === 'increase') {
        newStock = currentStock + quantity;
      } else {
        if (currentStock < quantity) {
          return new Failure({
            type: 'INSUFFICIENT_STOCK',
            message: 'Stock insuficiente para la operación'
          });
        }
        newStock = currentStock - quantity;
      }

      const updateResult = await this.audioProductRepository.update(id, { stock: newStock });
      if (updateResult.isFailure()) {
        return new Failure({
          type: 'VALIDATION_ERROR',
          message: 'Error al actualizar stock: ' + updateResult.error.message
        });
      }

      return new Success(this.mapToResponse(updateResult.value));
    } catch (error) {
      return new Failure({
        type: 'VALIDATION_ERROR',
        message: 'Error interno del servidor: ' + error.message
      });
    }
  }

  async incrementPlayCount(id: string): Promise<Result<AudioProductResponse, AudioProductError>> {
    try {
      const product = await this.audioProductRepository.findById(id);
      if (product.isFailure()) {
        return new Failure({
          type: 'PRODUCT_NOT_FOUND',
          message: 'Producto no encontrado'
        });
      }

      const newPlayCount = product.value.playCount + 1;
      const updateResult = await this.audioProductRepository.update(id, { playCount: newPlayCount });
      if (updateResult.isFailure()) {
        return new Failure({
          type: 'VALIDATION_ERROR',
          message: 'Error al actualizar contador de reproducciones: ' + updateResult.error.message
        });
      }

      return new Success(this.mapToResponse(updateResult.value));
    } catch (error) {
      return new Failure({
        type: 'VALIDATION_ERROR',
        message: 'Error interno del servidor: ' + error.message
      });
    }
  }

  async incrementDownloadCount(id: string): Promise<Result<AudioProductResponse, AudioProductError>> {
    try {
      const product = await this.audioProductRepository.findById(id);
      if (product.isFailure()) {
        return new Failure({
          type: 'PRODUCT_NOT_FOUND',
          message: 'Producto no encontrado'
        });
      }

      const newDownloadCount = product.value.downloadCount + 1;
      const updateResult = await this.audioProductRepository.update(id, { downloadCount: newDownloadCount });
      if (updateResult.isFailure()) {
        return new Failure({
          type: 'VALIDATION_ERROR',
          message: 'Error al actualizar contador de descargas: ' + updateResult.error.message
        });
      }

      return new Success(this.mapToResponse(updateResult.value));
    } catch (error) {
      return new Failure({
        type: 'VALIDATION_ERROR',
        message: 'Error interno del servidor: ' + error.message
      });
    }
  }

  async activateProduct(id: string): Promise<Result<AudioProductResponse, AudioProductError>> {
    try {
      const updateResult = await this.audioProductRepository.update(id, { isActive: true });
      if (updateResult.isFailure()) {
        return new Failure({
          type: 'PRODUCT_NOT_FOUND',
          message: 'Producto no encontrado'
        });
      }

      return new Success(this.mapToResponse(updateResult.value));
    } catch (error) {
      return new Failure({
        type: 'VALIDATION_ERROR',
        message: 'Error interno del servidor: ' + error.message
      });
    }
  }

  async deactivateProduct(id: string): Promise<Result<AudioProductResponse, AudioProductError>> {
    try {
      const updateResult = await this.audioProductRepository.update(id, { isActive: false });
      if (updateResult.isFailure()) {
        return new Failure({
          type: 'PRODUCT_NOT_FOUND',
          message: 'Producto no encontrado'
        });
      }

      return new Success(this.mapToResponse(updateResult.value));
    } catch (error) {
      return new Failure({
        type: 'VALIDATION_ERROR',
        message: 'Error interno del servidor: ' + error.message
      });
    }
  }

  // Métodos auxiliares
  private validateCreateRequest(request: CreateAudioProductDto): Result<void, AudioProductError> {
    if (!request.title || !request.description || !request.artist || !request.audioUrl) {
      return new Failure({
        type: 'VALIDATION_ERROR',
        message: 'Todos los campos obligatorios son requeridos'
      });
    }

    if (!Object.values(AudioFormat).includes(request.format)) {
      return new Failure({
        type: 'INVALID_AUDIO_FORMAT',
        message: 'Formato de audio no válido'
      });
    }

    if (!Object.values(AudioGenre).includes(request.genre)) {
      return new Failure({
        type: 'VALIDATION_ERROR',
        message: 'Género no válido'
      });
    }

    if (request.price < 0) {
      return new Failure({
        type: 'PRICE_INVALID',
        message: 'El precio no puede ser negativo'
      });
    }

    if (request.stock < 0) {
      return new Failure({
        type: 'VALIDATION_ERROR',
        message: 'El stock no puede ser negativo'
      });
    }

    return new Success(undefined);
  }

  private async verifyUniqueness(request: CreateAudioProductDto): Promise<Result<void, AudioProductError>> {
    // Implementar verificación de unicidad si es necesario
    return new Success(undefined);
  }

  private mapToResponse(product: any): AudioProductResponse {
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
}
