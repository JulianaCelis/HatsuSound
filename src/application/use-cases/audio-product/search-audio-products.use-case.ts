import { Injectable, Inject } from '@nestjs/common';
import { BaseUseCase } from '../base/base.use-case';
import { SearchAudioProductsRequest, AudioProductListResponse, AudioProductResponse, AudioProductError } from '@/domain/ports/input/audio-product.port';
import { IAudioProductRepositoryPort } from '@/domain/ports/output/audio-product.repository.port';
import { Result, Success, Failure } from '@/domain/ports';

@Injectable()
export class SearchAudioProductsUseCase extends BaseUseCase<SearchAudioProductsRequest, AudioProductListResponse, AudioProductError> {
  constructor(
    @Inject('AUDIO_PRODUCT_REPOSITORY')
    private readonly audioProductRepository: IAudioProductRepositoryPort,
  ) {
    super();
  }

  async execute(request: SearchAudioProductsRequest): Promise<Result<AudioProductListResponse, AudioProductError>> {
    try {
      // Validar y normalizar parámetros de búsqueda
      const searchRequest: SearchAudioProductsRequest = {
        query: request.query?.trim() || undefined,
        genre: request.genre,
        artist: request.artist?.trim() || undefined,
        minPrice: request.minPrice !== undefined && request.minPrice >= 0 ? request.minPrice : undefined,
        maxPrice: request.maxPrice !== undefined && request.maxPrice >= 0 ? request.maxPrice : undefined,
        isActive: request.isActive,
        page: request.page && request.page > 0 ? request.page : 1,
        limit: request.limit && request.limit > 0 ? Math.min(request.limit, 100) : 20,
        sortBy: request.sortBy || 'title',
        sortOrder: request.sortOrder || 'asc',
      };

      // Validar que minPrice no sea mayor que maxPrice
      if (searchRequest.minPrice !== undefined && searchRequest.maxPrice !== undefined) {
        if (searchRequest.minPrice > searchRequest.maxPrice) {
          return new Failure({ type: 'VALIDATION_ERROR', message: 'minPrice cannot be greater than maxPrice' });
        }
      }

      const result = await this.audioProductRepository.search(searchRequest);

      if (result.isSuccess()) {
        const audioProducts = result.value;
        
        // Convertir entidades a respuestas
        const products: AudioProductResponse[] = audioProducts.map(audioProduct => ({
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
        }));

        // Calcular paginación
        const total = products.length;
        const totalPages = Math.ceil(total / searchRequest.limit);

        const response: AudioProductListResponse = {
          products,
          total,
          page: searchRequest.page,
          limit: searchRequest.limit,
          totalPages,
        };

        return new Success(response);
      } else {
        return new Failure({ type: 'VALIDATION_ERROR', message: 'Error searching audio products' });
      }
    } catch (error) {
      return new Failure({ type: 'VALIDATION_ERROR', message: 'Error interno del servidor: ' + error.message });
    }
  }
}
