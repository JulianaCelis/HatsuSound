import { Test, TestingModule } from '@nestjs/testing';
import { AudioProductService } from '@/infrastructure/services/audio-product.service';
import { IAudioProductRepositoryPort, AUDIO_PRODUCT_REPOSITORY } from '@/domain/ports/output/audio-product.repository.port';
import { AudioProduct, AudioFormat, AudioGenre, AgeRestriction } from '@/domain/entities/audio-product.entity';
import { CreateAudioProductDto, UpdateAudioProductDto, SearchAudioProductsDto } from '@/infrastructure/dto/audio-product.dto';
import { Result, Success, Failure } from '@/domain/ports';
import { AudioProductError } from '@/domain/ports/input/audio-product.port';
import { 
  createMockAudioProduct, 
  createMockCreateAudioProductDto, 
  createMockUpdateAudioProductDto, 
  createMockSearchAudioProductsDto,
  createAudioProductServiceTestModule,
  validateAudioProductResponse,
  TEST_DATA,
  ERROR_MESSAGES
} from '../../../audio-product.test.config';

describe('AudioProductService', () => {
  let service: AudioProductService;
  let mockAudioProductRepository: jest.Mocked<IAudioProductRepositoryPort>;

  const mockAudioProduct = createMockAudioProduct();
  const mockCreateDto = createMockCreateAudioProductDto();
  const mockUpdateDto = createMockUpdateAudioProductDto();
  const mockSearchDto = createMockSearchAudioProductsDto();

  beforeEach(async () => {
    const { service: serviceInstance, mockAudioProductRepository: mockRepo } = 
      await createAudioProductServiceTestModule();
    
    service = serviceInstance;
    mockAudioProductRepository = mockRepo;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create an audio product successfully', async () => {
      const expectedAudioProduct = createMockAudioProduct({
        id: 'new-audio-123',
        title: mockCreateDto.title,
        description: mockCreateDto.description,
        artist: mockCreateDto.artist,
        genre: mockCreateDto.genre,
      });

      mockAudioProductRepository.create.mockResolvedValue(
        new Success(expectedAudioProduct)
      );

      const result = await service.create(mockCreateDto);

      expect(result.isSuccess()).toBe(true);
      if (result.isSuccess()) {
        const createdProduct = result.value;
        validateAudioProductResponse(createdProduct, expectedAudioProduct);
      }

      expect(mockAudioProductRepository.create).toHaveBeenCalledWith(mockCreateDto);
    });

    it('should handle creation failure', async () => {
      const error: AudioProductError = {
        type: 'VALIDATION_ERROR',
        message: ERROR_MESSAGES.VALIDATION_ERROR
      };

      mockAudioProductRepository.create.mockResolvedValue(
        new Failure(error)
      );

      const result = await service.create(mockCreateDto);

      expect(result.isSuccess()).toBe(false);
      if (!result.isSuccess()) {
        expect(result.error).toEqual(error);
      }

      expect(mockAudioProductRepository.create).toHaveBeenCalledWith(mockCreateDto);
    });

    it('should handle repository errors during creation', async () => {
      const error: AudioProductError = {
        type: 'VALIDATION_ERROR',
        message: 'Database connection failed'
      };

      mockAudioProductRepository.create.mockResolvedValue(
        new Failure(error)
      );

      const result = await service.create(mockCreateDto);

      expect(result.isSuccess()).toBe(false);
      if (!result.isSuccess()) {
        expect(result.error.message).toBe('Database connection failed');
      }
    });

    it('should create audio product with all required fields', async () => {
      const completeDto = createMockCreateAudioProductDto({
        title: 'Complete Song',
        description: 'A complete song description',
        artist: 'Complete Artist',
        genre: AudioGenre.JAZZ,
        audioUrl: 'https://example.com/audio/complete.mp3',
        duration: 300,
        format: AudioFormat.WAV,
        bitrate: 1411,
        price: 15.99,
        stock: 200,
        tags: ['jazz', 'complete'],
        releaseDate: new Date('2024-01-01'),
        language: 'es',
        isExplicit: true,
        ageRestriction: AgeRestriction.ADULT,
      });

      const expectedProduct = createMockAudioProduct({
        id: 'complete-123',
        title: 'Complete Song',
        description: 'A complete song description',
        artist: 'Complete Artist',
        genre: AudioGenre.JAZZ,
        audioUrl: 'https://example.com/audio/complete.mp3',
        duration: 300,
        format: AudioFormat.WAV,
        bitrate: 1411,
        price: 15.99,
        stock: 200,
        tags: ['jazz', 'complete'],
        releaseDate: new Date('2024-01-01'),
        language: 'es',
        isExplicit: true,
        ageRestriction: AgeRestriction.ADULT,
      });

      mockAudioProductRepository.create.mockResolvedValue(
        new Success(expectedProduct)
      );

      const result = await service.create(completeDto);

      expect(result.isSuccess()).toBe(true);
      if (result.isSuccess()) {
        const createdProduct = result.value;
        validateAudioProductResponse(createdProduct, expectedProduct);
      }
    });
  });

  describe('findById', () => {
    it('should find audio product by ID successfully', async () => {
      const expectedAudioProduct = createMockAudioProduct({
        id: 'audio-123',
        title: 'Found Song',
        artist: 'Found Artist',
      });

      mockAudioProductRepository.findById.mockResolvedValue(
        new Success(expectedAudioProduct)
      );

      const result = await service.findById('audio-123');

      expect(result.isSuccess()).toBe(true);
      if (result.isSuccess()) {
        const foundProduct = result.value;
        validateAudioProductResponse(foundProduct, expectedAudioProduct);
      }

      expect(mockAudioProductRepository.findById).toHaveBeenCalledWith('audio-123');
    });

    it('should handle product not found', async () => {
      const error: AudioProductError = {
        type: 'PRODUCT_NOT_FOUND',
        message: ERROR_MESSAGES.PRODUCT_NOT_FOUND
      };

      mockAudioProductRepository.findById.mockResolvedValue(
        new Failure(error)
      );

      const result = await service.findById('nonexistent-id');

      expect(result.isSuccess()).toBe(false);
      if (!result.isSuccess()) {
        expect(result.error).toEqual(error);
      }

      expect(mockAudioProductRepository.findById).toHaveBeenCalledWith('nonexistent-id');
    });

    it('should handle repository errors during findById', async () => {
      const error: AudioProductError = {
        type: 'VALIDATION_ERROR',
        message: 'Database connection failed'
      };

      mockAudioProductRepository.findById.mockResolvedValue(
        new Failure(error)
      );

      const result = await service.findById('audio-123');

      expect(result.isSuccess()).toBe(false);
      if (!result.isSuccess()) {
        expect(result.error.message).toBe('Database connection failed');
      }
    });

    it('should find different audio products by ID', async () => {
      const rockProduct = createMockAudioProduct({
        id: 'rock-123',
        title: 'Rock Song',
        genre: AudioGenre.ROCK,
      });

      const jazzProduct = createMockAudioProduct({
        id: 'jazz-123',
        title: 'Jazz Song',
        genre: AudioGenre.JAZZ,
      });

      mockAudioProductRepository.findById
        .mockResolvedValueOnce(new Success(rockProduct))
        .mockResolvedValueOnce(new Success(jazzProduct));

      const rockResult = await service.findById('rock-123');
      const jazzResult = await service.findById('jazz-123');

      expect(rockResult.isSuccess()).toBe(true);
      expect(jazzResult.isSuccess()).toBe(true);

      if (rockResult.isSuccess() && jazzResult.isSuccess()) {
        expect(rockResult.value.genre).toBe(AudioGenre.ROCK);
        expect(jazzResult.value.genre).toBe(AudioGenre.JAZZ);
      }
    });
  });

  describe('update', () => {
    it('should update audio product successfully', async () => {
      const updatedAudioProduct = createMockAudioProduct({
        id: 'audio-123',
        title: 'Updated Title',
        description: 'Updated description',
        price: 12.99,
      });

      mockAudioProductRepository.update.mockResolvedValue(
        new Success(updatedAudioProduct)
      );

      const result = await service.update('audio-123', mockUpdateDto);

      expect(result.isSuccess()).toBe(true);
      if (result.isSuccess()) {
        const updatedProduct = result.value;
        validateAudioProductResponse(updatedProduct, updatedAudioProduct);
      }

      expect(mockAudioProductRepository.update).toHaveBeenCalledWith('audio-123', mockUpdateDto);
    });

    it('should handle update when product not found', async () => {
      const error: AudioProductError = {
        type: 'PRODUCT_NOT_FOUND',
        message: ERROR_MESSAGES.PRODUCT_NOT_FOUND
      };

      mockAudioProductRepository.update.mockResolvedValue(
        new Failure(error)
      );

      const result = await service.update('nonexistent-id', mockUpdateDto);

      expect(result.isSuccess()).toBe(false);
      if (!result.isSuccess()) {
        expect(result.error).toEqual(error);
      }

      expect(mockAudioProductRepository.update).toHaveBeenCalledWith('nonexistent-id', mockUpdateDto);
    });

    it('should handle partial updates', async () => {
      const partialUpdateDto = createMockUpdateAudioProductDto({
        title: 'Partially Updated Title',
        price: 8.99,
      });

      const updatedAudioProduct = createMockAudioProduct({
        id: 'audio-123',
        title: 'Partially Updated Title',
        price: 8.99,
      });

      mockAudioProductRepository.update.mockResolvedValue(
        new Success(updatedAudioProduct)
      );

      const result = await service.update('audio-123', partialUpdateDto);

      expect(result.isSuccess()).toBe(true);
      if (result.isSuccess()) {
        const updatedProduct = result.value;
        expect(updatedProduct.title).toBe('Partially Updated Title');
        expect(updatedProduct.price).toBe(8.99);
        // Other fields should remain unchanged
        expect(updatedProduct.artist).toBe(mockAudioProduct.artist);
        expect(updatedProduct.genre).toBe(mockAudioProduct.genre);
      }
    });

    it('should handle repository errors during update', async () => {
      const error: AudioProductError = {
        type: 'VALIDATION_ERROR',
        message: 'Database connection failed'
      };

      mockAudioProductRepository.update.mockResolvedValue(
        new Failure(error)
      );

      const result = await service.update('audio-123', mockUpdateDto);

      expect(result.isSuccess()).toBe(false);
      if (!result.isSuccess()) {
        expect(result.error.message).toBe('Database connection failed');
      }
    });
  });

  describe('delete', () => {
    it('should delete audio product successfully', async () => {
      mockAudioProductRepository.delete.mockResolvedValue(
        new Success(true)
      );

      const result = await service.delete('audio-123');

      expect(result.isSuccess()).toBe(true);
      if (result.isSuccess()) {
        expect(result.value).toBe(true);
      }

      expect(mockAudioProductRepository.delete).toHaveBeenCalledWith('audio-123');
    });

    it('should handle delete when product not found', async () => {
      const error: AudioProductError = {
        type: 'PRODUCT_NOT_FOUND',
        message: ERROR_MESSAGES.PRODUCT_NOT_FOUND
      };

      mockAudioProductRepository.delete.mockResolvedValue(
        new Failure(error)
      );

      const result = await service.delete('nonexistent-id');

      expect(result.isSuccess()).toBe(false);
      if (!result.isSuccess()) {
        expect(result.error).toEqual(error);
      }

      expect(mockAudioProductRepository.delete).toHaveBeenCalledWith('nonexistent-id');
    });

    it('should handle repository errors during delete', async () => {
      const error: AudioProductError = {
        type: 'VALIDATION_ERROR',
        message: 'Database connection failed'
      };

      mockAudioProductRepository.delete.mockResolvedValue(
        new Failure(error)
      );

      const result = await service.delete('audio-123');

      expect(result.isSuccess()).toBe(false);
      if (!result.isSuccess()) {
        expect(result.error.message).toBe('Database connection failed');
      }
    });
  });

  describe('search', () => {
    it('should search audio products successfully', async () => {
      const searchResults = [
        createMockAudioProduct({ id: 'search-1', title: 'Search Result 1' }),
        createMockAudioProduct({ id: 'search-2', title: 'Search Result 2' }),
      ];

      mockAudioProductRepository.search.mockResolvedValue(
        new Success(searchResults)
      );

      const result = await service.search(mockSearchDto);

      expect(result.isSuccess()).toBe(true);
      if (result.isSuccess()) {
        const foundProducts = result.value;
        expect(foundProducts).toHaveLength(2);
        expect(foundProducts[0].title).toBe('Search Result 1');
        expect(foundProducts[1].title).toBe('Search Result 2');
      }

      expect(mockAudioProductRepository.search).toHaveBeenCalledWith(mockSearchDto);
    });

    it('should return empty array when no search results found', async () => {
      mockAudioProductRepository.search.mockResolvedValue(
        new Success([])
      );

      const result = await service.search(mockSearchDto);

      expect(result.isSuccess()).toBe(true);
      if (result.isSuccess()) {
        const foundProducts = result.value;
        expect(foundProducts).toHaveLength(0);
      }
    });

    it('should handle search with different criteria', async () => {
      const genreSearchDto = createMockSearchAudioProductsDto({
        genre: AudioGenre.JAZZ,
        minPrice: 10.00,
        maxPrice: 20.00,
      });

      const jazzResults = [
        createMockAudioProduct({ id: 'jazz-1', genre: AudioGenre.JAZZ, price: 15.99 }),
        createMockAudioProduct({ id: 'jazz-2', genre: AudioGenre.JAZZ, price: 12.99 }),
      ];

      mockAudioProductRepository.search.mockResolvedValue(
        new Success(jazzResults)
      );

      const result = await service.search(genreSearchDto);

      expect(result.isSuccess()).toBe(true);
      if (result.isSuccess()) {
        const foundProducts = result.value;
        expect(foundProducts).toHaveLength(2);
        expect(foundProducts.every(p => p.genre === AudioGenre.JAZZ)).toBe(true);
        expect(foundProducts.every(p => p.price >= 10.00 && p.price <= 20.00)).toBe(true);
      }

      expect(mockAudioProductRepository.search).toHaveBeenCalledWith(genreSearchDto);
    });

    it('should handle repository errors during search', async () => {
      const error: AudioProductError = {
        type: 'VALIDATION_ERROR',
        message: 'Database connection failed'
      };

      mockAudioProductRepository.search.mockResolvedValue(
        new Failure(error)
      );

      const result = await service.search(mockSearchDto);

      expect(result.isSuccess()).toBe(false);
      if (!result.isSuccess()) {
        expect(result.error.message).toBe('Database connection failed');
      }
    });
  });

  describe('findAll', () => {
    it('should find all audio products successfully', async () => {
      const allProducts = [
        createMockAudioProduct({ id: 'all-1', title: 'Product 1' }),
        createMockAudioProduct({ id: 'all-2', title: 'Product 2' }),
        createMockAudioProduct({ id: 'all-3', title: 'Product 3' }),
      ];

      mockAudioProductRepository.findAll.mockResolvedValue(
        new Success(allProducts)
      );

      const result = await service.findAll();

      expect(result.isSuccess()).toBe(true);
      if (result.isSuccess()) {
        const foundProducts = result.value;
        expect(foundProducts).toHaveLength(3);
        expect(foundProducts[0].title).toBe('Product 1');
        expect(foundProducts[1].title).toBe('Product 2');
        expect(foundProducts[2].title).toBe('Product 3');
      }

      expect(mockAudioProductRepository.findAll).toHaveBeenCalled();
    });

    it('should return empty array when no products exist', async () => {
      mockAudioProductRepository.findAll.mockResolvedValue(
        new Success([])
      );

      const result = await service.findAll();

      expect(result.isSuccess()).toBe(true);
      if (result.isSuccess()) {
        const foundProducts = result.value;
        expect(foundProducts).toHaveLength(0);
      }
    });

    it('should handle repository errors during findAll', async () => {
      const error: AudioProductError = {
        type: 'VALIDATION_ERROR',
        message: 'Database connection failed'
      };

      mockAudioProductRepository.findAll.mockResolvedValue(
        new Failure(error)
      );

      const result = await service.findAll();

      expect(result.isSuccess()).toBe(false);
      if (!result.isSuccess()) {
        expect(result.error.message).toBe('Database connection failed');
      }
    });
  });

  describe('Error handling', () => {
    it('should propagate repository errors correctly', async () => {
      const repositoryError: AudioProductError = {
        type: 'VALIDATION_ERROR',
        message: 'Repository operation failed'
      };

      mockAudioProductRepository.create.mockResolvedValue(
        new Failure(repositoryError)
      );

      const result = await service.create(mockCreateDto);

      expect(result.isSuccess()).toBe(false);
      if (!result.isSuccess()) {
        expect(result.error).toEqual(repositoryError);
      }
    });

    it('should handle different error types', async () => {
      const notFoundError: AudioProductError = {
        type: 'PRODUCT_NOT_FOUND',
        message: ERROR_MESSAGES.PRODUCT_NOT_FOUND
      };

      mockAudioProductRepository.findById.mockResolvedValue(
        new Failure(notFoundError)
      );

      const result = await service.findById('nonexistent-id');

      expect(result.isSuccess()).toBe(false);
      if (!result.isSuccess()) {
        expect(result.error.type).toBe('PRODUCT_NOT_FOUND');
        expect(result.error.message).toBe(ERROR_MESSAGES.PRODUCT_NOT_FOUND);
      }
    });
  });

  describe('Integration scenarios', () => {
    it('should handle complete CRUD lifecycle', async () => {
      // Create
      const newProduct = createMockAudioProduct({
        id: 'lifecycle-123',
        title: 'Lifecycle Song',
        artist: 'Lifecycle Artist',
      });

      mockAudioProductRepository.create.mockResolvedValue(
        new Success(newProduct)
      );

      const createResult = await service.create(mockCreateDto);
      expect(createResult.isSuccess()).toBe(true);

      // Read
      mockAudioProductRepository.findById.mockResolvedValue(
        new Success(newProduct)
      );

      const readResult = await service.findById('lifecycle-123');
      expect(readResult.isSuccess()).toBe(true);

      // Update
      const updatedProduct = createMockAudioProduct({
        id: 'lifecycle-123',
        title: 'Updated Lifecycle Song',
        artist: 'Lifecycle Artist',
      });

      mockAudioProductRepository.update.mockResolvedValue(
        new Success(updatedProduct)
      );

      const updateResult = await service.update('lifecycle-123', mockUpdateDto);
      expect(updateResult.isSuccess()).toBe(true);

      // Delete
      mockAudioProductRepository.delete.mockResolvedValue(
        new Success(true)
      );

      const deleteResult = await service.delete('lifecycle-123');
      expect(deleteResult.isSuccess()).toBe(true);
    });

    it('should handle search and find operations together', async () => {
      // Search for products
      const searchResults = [
        createMockAudioProduct({ id: 'search-1', genre: AudioGenre.ROCK }),
        createMockAudioProduct({ id: 'search-2', genre: AudioGenre.ROCK }),
      ];

      mockAudioProductRepository.search.mockResolvedValue(
        new Success(searchResults)
      );

      const searchResult = await service.search(mockSearchDto);
      expect(searchResult.isSuccess()).toBe(true);

      if (searchResult.isSuccess()) {
        // Find specific product from search results
        const productId = searchResult.value[0].id;
        
        mockAudioProductRepository.findById.mockResolvedValue(
          new Success(searchResults[0])
        );

        const findResult = await service.findById(productId);
        expect(findResult.isSuccess()).toBe(true);
        
        if (findResult.isSuccess()) {
          expect(findResult.value.genre).toBe(AudioGenre.ROCK);
        }
      }
    });
  });
});
