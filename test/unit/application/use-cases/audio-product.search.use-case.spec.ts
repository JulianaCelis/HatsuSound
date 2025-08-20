import { Test, TestingModule } from '@nestjs/testing';
import { SearchAudioProductsUseCase } from '@/application/use-cases/audio-product/search-audio-products.use-case';
import { IAudioProductRepositoryPort } from '@/domain/ports/output/audio-product.repository.port';
import { AudioProduct } from '@/domain/entities/audio-product.entity';
import { SearchAudioProductsRequest, AudioProductListResponse, AudioProductResponse } from '@/domain/ports/input/audio-product.port';
import { Result, Success, Failure } from '@/domain/ports';
import { AudioProductError } from '@/domain/ports/input/audio-product.port';
import { 
  createMockAudioProduct, 
  createMockAudioProductEntity,
  validateAudioProductResponse,
  TEST_DATA,
  ERROR_MESSAGES
} from '../../../audio-product.test.config';

describe('SearchAudioProductsUseCase', () => {
  let useCase: SearchAudioProductsUseCase;
  let mockAudioProductRepository: jest.Mocked<IAudioProductRepositoryPort>;

  const mockAudioProduct = createMockAudioProduct();

  beforeEach(async () => {
    const mockRepo = {
      create: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      search: jest.fn(),
      findAll: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchAudioProductsUseCase,
        {
          provide: 'AUDIO_PRODUCT_REPOSITORY',
          useValue: mockRepo,
        },
      ],
    }).compile();

    useCase = module.get<SearchAudioProductsUseCase>(SearchAudioProductsUseCase);
    mockAudioProductRepository = mockRepo as jest.Mocked<IAudioProductRepositoryPort>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should search audio products successfully with basic parameters', async () => {
      const searchRequest: SearchAudioProductsRequest = {
        query: 'rock music',
        page: 1,
        limit: 10,
      };

      const mockProducts = [
        createMockAudioProduct({ id: 'audio-1', title: 'Rock Song 1' }),
        createMockAudioProduct({ id: 'audio-2', title: 'Rock Song 2' }),
      ];

      mockAudioProductRepository.search.mockResolvedValue(
        new Success(mockProducts)
      );

      const result = await useCase.execute(searchRequest);

      expect(result.isSuccess()).toBe(true);
      if (result.isSuccess()) {
        const response = result.value;
        expect(response.products).toHaveLength(2);
        expect(response.total).toBe(2);
        expect(response.page).toBe(1);
        expect(response.limit).toBe(10);
        expect(response.totalPages).toBe(1);
      }

      // Verify that normalized parameters were passed to repository
      expect(mockAudioProductRepository.search).toHaveBeenCalledWith({
        query: 'rock music',
        page: 1,
        limit: 10,
        sortBy: 'title',
        sortOrder: 'asc',
      });
    });

    it('should normalize and validate search parameters', async () => {
      const searchRequest: SearchAudioProductsRequest = {
        query: '  rock music  ',
        artist: '  john doe  ',
        minPrice: 0,
        maxPrice: 100,
        page: 0,
        limit: 0,
      };

      const mockProducts = [createMockAudioProduct()];

      mockAudioProductRepository.search.mockResolvedValue(
        new Success(mockProducts)
      );

      const result = await useCase.execute(searchRequest);

      expect(result.isSuccess()).toBe(true);
      if (result.isSuccess()) {
        const response = result.value;
        expect(response.page).toBe(1); // Normalized from 0
        expect(response.limit).toBe(20); // Normalized from 0
      }

      // Verify normalized parameters were passed to repository
      expect(mockAudioProductRepository.search).toHaveBeenCalledWith({
        query: 'rock music', // Trimmed
        artist: 'john doe', // Trimmed
        minPrice: 0,
        maxPrice: 100,
        page: 1, // Normalized
        limit: 20, // Normalized
        sortBy: 'title', // Default
        sortOrder: 'asc', // Default
      });
    });

    it('should return failure when minPrice is greater than maxPrice', async () => {
      const searchRequest: SearchAudioProductsRequest = {
        minPrice: 100,
        maxPrice: 50,
      };

      const result = await useCase.execute(searchRequest);

      expect(result.isFailure()).toBe(true);
      if (result.isFailure()) {
        expect(result.error.type).toBe('VALIDATION_ERROR');
        expect(result.error.message).toBe('minPrice cannot be greater than maxPrice');
      }

      expect(mockAudioProductRepository.search).not.toHaveBeenCalled();
    });

    it('should handle negative minPrice and maxPrice', async () => {
      const searchRequest: SearchAudioProductsRequest = {
        minPrice: -10,
        maxPrice: -5,
      };

      const mockProducts = [createMockAudioProduct()];

      mockAudioProductRepository.search.mockResolvedValue(
        new Success(mockProducts)
      );

      const result = await useCase.execute(searchRequest);

      expect(result.isSuccess()).toBe(true);
      if (result.isSuccess()) {
        const response = result.value;
        expect(response.products).toHaveLength(1);
      }

      // Verify negative prices are filtered out
      expect(mockAudioProductRepository.search).toHaveBeenCalledWith({
        minPrice: undefined, // Filtered out
        maxPrice: undefined, // Filtered out
        page: 1,
        limit: 20,
        sortBy: 'title',
        sortOrder: 'asc',
      });
    });

    it('should set default pagination values', async () => {
      const searchRequest: SearchAudioProductsRequest = {};

      const mockProducts = [createMockAudioProduct()];

      mockAudioProductRepository.search.mockResolvedValue(
        new Success(mockProducts)
      );

      const result = await useCase.execute(searchRequest);

      expect(result.isSuccess()).toBe(true);
      if (result.isSuccess()) {
        const response = result.value;
        expect(response.page).toBe(1);
        expect(response.limit).toBe(20);
        expect(response.totalPages).toBe(1);
      }

      expect(mockAudioProductRepository.search).toHaveBeenCalledWith({
        page: 1,
        limit: 20,
        sortBy: 'title',
        sortOrder: 'asc',
      });
    });

    it('should enforce maximum limit', async () => {
      const searchRequest: SearchAudioProductsRequest = {
        limit: 150, // Above maximum
      };

      const mockProducts = [createMockAudioProduct()];

      mockAudioProductRepository.search.mockResolvedValue(
        new Success(mockProducts)
      );

      const result = await useCase.execute(searchRequest);

      expect(result.isSuccess()).toBe(true);
      if (result.isSuccess()) {
        const response = result.value;
        expect(response.limit).toBe(100); // Capped at maximum
      }

      expect(mockAudioProductRepository.search).toHaveBeenCalledWith({
        limit: 100, // Capped
        page: 1,
        sortBy: 'title',
        sortOrder: 'asc',
      });
    });

    it('should handle empty search results', async () => {
      const searchRequest: SearchAudioProductsRequest = {
        query: 'nonexistent',
        page: 1,
        limit: 10,
      };

      mockAudioProductRepository.search.mockResolvedValue(
        new Success([])
      );

      const result = await useCase.execute(searchRequest);

      expect(result.isSuccess()).toBe(true);
      if (result.isSuccess()) {
        const response = result.value;
        expect(response.products).toHaveLength(0);
        expect(response.total).toBe(0);
        expect(response.totalPages).toBe(0);
      }
    });

    it('should calculate pagination correctly', async () => {
      const searchRequest: SearchAudioProductsRequest = {
        page: 2,
        limit: 5,
      };

      const mockProducts = [
        createMockAudioProduct({ id: 'audio-1' }),
        createMockAudioProduct({ id: 'audio-2' }),
        createMockAudioProduct({ id: 'audio-3' }),
        createMockAudioProduct({ id: 'audio-4' }),
        createMockAudioProduct({ id: 'audio-5' }),
      ];

      mockAudioProductRepository.search.mockResolvedValue(
        new Success(mockProducts)
      );

      const result = await useCase.execute(searchRequest);

      expect(result.isSuccess()).toBe(true);
      if (result.isSuccess()) {
        const response = result.value;
        expect(response.products).toHaveLength(5);
        expect(response.total).toBe(5);
        expect(response.page).toBe(2);
        expect(response.limit).toBe(5);
        expect(response.totalPages).toBe(1);
      }
    });

    it('should handle complex search filters', async () => {
      const searchRequest: SearchAudioProductsRequest = {
        query: 'jazz',
        genre: 'JAZZ' as any, // Using string for test, will be validated by enum
        artist: 'Miles Davis',
        minPrice: 10,
        maxPrice: 50,
        isActive: true,
        page: 1,
        limit: 15,
        sortBy: 'price',
        sortOrder: 'desc',
      };

      const mockProducts = [createMockAudioProduct()];

      mockAudioProductRepository.search.mockResolvedValue(
        new Success(mockProducts)
      );

      const result = await useCase.execute(searchRequest);

      expect(result.isSuccess()).toBe(true);
      if (result.isSuccess()) {
        const response = result.value;
        expect(response.products).toHaveLength(1);
      }

      expect(mockAudioProductRepository.search).toHaveBeenCalledWith({
        query: 'jazz',
        genre: 'JAZZ',
        artist: 'Miles Davis',
        minPrice: 10,
        maxPrice: 50,
        isActive: true,
        page: 1,
        limit: 15,
        sortBy: 'price',
        sortOrder: 'desc',
      });
    });

    it('should return failure when repository search fails', async () => {
      const searchRequest: SearchAudioProductsRequest = {
        query: 'test',
      };

      mockAudioProductRepository.search.mockResolvedValue(
        new Failure({ type: 'VALIDATION_ERROR', message: 'Search failed' })
      );

      const result = await useCase.execute(searchRequest);

      expect(result.isFailure()).toBe(true);
      if (result.isFailure()) {
        expect(result.error.type).toBe('VALIDATION_ERROR');
        expect(result.error.message).toBe('Error searching audio products');
      }
    });

    it('should return failure when repository throws an error', async () => {
      const searchRequest: SearchAudioProductsRequest = {
        query: 'test',
      };

      const searchError = new Error('Database connection failed');
      mockAudioProductRepository.search.mockRejectedValue(searchError);

      const result = await useCase.execute(searchRequest);

      expect(result.isFailure()).toBe(true);
      if (result.isFailure()) {
        expect(result.error.type).toBe('VALIDATION_ERROR');
        expect(result.error.message).toBe('Error interno del servidor: Database connection failed');
      }
    });

    it('should correctly map entities to response format', async () => {
      const searchRequest: SearchAudioProductsRequest = {
        query: 'test',
      };

              const mockEntities = [
          createMockAudioProduct({ id: 'audio-1' }),
          createMockAudioProduct({ id: 'audio-2' }),
        ];

        mockAudioProductRepository.search.mockResolvedValue(
          new Success(mockEntities)
        );

      const result = await useCase.execute(searchRequest);

      expect(result.isSuccess()).toBe(true);
      if (result.isSuccess()) {
        const response = result.value;
        expect(response.products).toHaveLength(2);
        
        // Verify first product mapping
        const firstProduct = response.products[0];
        const firstEntity = mockEntities[0];
        
        expect(firstProduct.id).toBe(firstEntity.id);
        expect(firstProduct.title).toBe(firstEntity.title);
        expect(firstProduct.description).toBe(firstEntity.description);
        expect(firstProduct.artist).toBe(firstEntity.artist);
        expect(firstProduct.genre).toBe(firstEntity.genre);
        expect(firstProduct.audioUrl).toBe(firstEntity.audioUrl);
        expect(firstProduct.duration).toBe(firstEntity.duration);
        expect(firstProduct.format).toBe(firstEntity.format);
        expect(firstProduct.bitrate).toBe(firstEntity.bitrate);
        expect(firstProduct.price).toBe(firstEntity.price);
        expect(firstProduct.stock).toBe(firstEntity.stock);
        expect(firstProduct.isActive).toBe(firstEntity.isActive);
        expect(firstProduct.tags).toEqual(firstEntity.tags);
        expect(firstProduct.releaseDate).toBe(firstEntity.releaseDate);
        expect(firstProduct.language).toBe(firstEntity.language);
        expect(firstProduct.isExplicit).toBe(firstEntity.isExplicit);
        expect(firstProduct.ageRestriction).toBe(firstEntity.ageRestriction);
        expect(firstProduct.playCount).toBe(firstEntity.playCount);
        expect(firstProduct.downloadCount).toBe(firstEntity.downloadCount);
        expect(firstProduct.createdAt).toBe(firstEntity.createdAt);
        expect(firstProduct.updatedAt).toBe(firstEntity.updatedAt);
      }
    });

    it('should handle edge case with very large page numbers', async () => {
      const searchRequest: SearchAudioProductsRequest = {
        page: 999999,
        limit: 1,
      };

      const mockProducts = [createMockAudioProduct()];

      mockAudioProductRepository.search.mockResolvedValue(
        new Success(mockProducts)
      );

      const result = await useCase.execute(searchRequest);

      expect(result.isSuccess()).toBe(true);
      if (result.isSuccess()) {
        const response = result.value;
        expect(response.page).toBe(999999);
        expect(response.limit).toBe(1);
        expect(response.totalPages).toBe(1);
      }
    });
  });
});
