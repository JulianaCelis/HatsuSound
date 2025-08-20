import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DeleteResult, UpdateResult } from 'typeorm';
import { AudioProductRepository } from '@/infrastructure/repositories/audio-product.repository';
import { AudioProductEntity } from '@/infrastructure/database/entities/audio-product.entity';
import { AudioProduct, AudioFormat, AudioGenre, AgeRestriction } from '@/domain/entities/audio-product.entity';
import { CreateAudioProductRequest, UpdateAudioProductRequest, SearchAudioProductsRequest } from '@/domain/ports/input/audio-product.port';
import { Result, Success, Failure } from '@/domain/ports';
import { AudioProductError } from '@/domain/ports/input/audio-product.port';
import { 
  createMockAudioProduct, 
  createMockAudioProductEntity,
  createMockCreateAudioProductDto,
  createMockUpdateAudioProductDto,
  createMockSearchAudioProductsDto,
  createAudioProductRepositoryTestModule,
  validateAudioProductResponse,
  TEST_DATA,
  ERROR_MESSAGES
} from '../../../audio-product.test.config';

describe('AudioProductRepository', () => {
  let repository: AudioProductRepository;
  let mockTypeOrmRepository: jest.Mocked<Repository<AudioProductEntity>>;

  const mockAudioProduct = createMockAudioProduct();
  const mockAudioProductEntity = createMockAudioProductEntity();
  const mockCreateDto = createMockCreateAudioProductDto();
  const mockUpdateDto = createMockUpdateAudioProductDto();
  const mockSearchDto = createMockSearchAudioProductsDto();

  beforeEach(async () => {
    const { repository: repoInstance, mockTypeOrmRepository: mockRepo } = 
      await createAudioProductRepositoryTestModule();
    
    repository = repoInstance;
    mockTypeOrmRepository = mockRepo;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create an audio product successfully', async () => {
      const createRequest: CreateAudioProductRequest = {
        title: mockCreateDto.title,
        description: mockCreateDto.description,
        artist: mockCreateDto.artist,
        genre: mockCreateDto.genre,
        audioUrl: mockCreateDto.audioUrl,
        duration: mockCreateDto.duration,
        format: mockCreateDto.format,
        bitrate: mockCreateDto.bitrate,
        price: mockCreateDto.price,
        stock: mockCreateDto.stock,
        tags: mockCreateDto.tags,
        releaseDate: mockCreateDto.releaseDate,
        language: mockCreateDto.language,
        isExplicit: mockCreateDto.isExplicit,
        ageRestriction: mockCreateDto.ageRestriction,
      };

      const savedEntity = createMockAudioProductEntity({
        id: 'new-audio-123',
        title: createRequest.title,
        description: createRequest.description,
        artist: createRequest.artist,
        genre: createRequest.genre,
      });

      mockTypeOrmRepository.save.mockResolvedValue(savedEntity);

      const result = await repository.create(createRequest);

      expect(result.isSuccess()).toBe(true);
      if (result.isSuccess()) {
        const createdProduct = result.value;
        // Validate the created product matches the saved entity
        expect(createdProduct.id).toBe('new-audio-123');
        expect(createdProduct.title).toBe(createRequest.title);
        expect(createdProduct.description).toBe(createRequest.description);
        expect(createdProduct.artist).toBe(createRequest.artist);
        expect(createdProduct.genre).toBe(createRequest.genre);
      }

      expect(mockTypeOrmRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          title: createRequest.title,
          description: createRequest.description,
          artist: createRequest.artist,
          genre: createRequest.genre,
        })
      );
    });

    it('should handle creation failure', async () => {
      const createRequest: CreateAudioProductRequest = {
        title: mockCreateDto.title,
        description: mockCreateDto.description,
        artist: mockCreateDto.artist,
        genre: mockCreateDto.genre,
        audioUrl: mockCreateDto.audioUrl,
        duration: mockCreateDto.duration,
        format: mockCreateDto.format,
        bitrate: mockCreateDto.bitrate,
        price: mockCreateDto.price,
        stock: mockCreateDto.stock,
        tags: mockCreateDto.tags,
        releaseDate: mockCreateDto.releaseDate,
        language: mockCreateDto.language,
        isExplicit: mockCreateDto.isExplicit,
        ageRestriction: mockCreateDto.ageRestriction,
      };

      mockTypeOrmRepository.save.mockRejectedValue(new Error('Database error'));

      const result = await repository.create(createRequest);

      expect(result.isSuccess()).toBe(false);
      if (!result.isSuccess()) {
        expect(result.error.type).toBe('VALIDATION_ERROR');
        expect(result.error.message).toBe(ERROR_MESSAGES.VALIDATION_ERROR);
      }
    });

    it('should create audio product with all required fields', async () => {
      const completeRequest: CreateAudioProductRequest = {
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
      };

      const savedEntity = createMockAudioProductEntity({
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

      mockTypeOrmRepository.save.mockResolvedValue(savedEntity);

      const result = await repository.create(completeRequest);

      expect(result.isSuccess()).toBe(true);
      if (result.isSuccess()) {
        const createdProduct = result.value;
        expect(createdProduct.title).toBe('Complete Song');
        expect(createdProduct.genre).toBe(AudioGenre.JAZZ);
        expect(createdProduct.format).toBe(AudioFormat.WAV);
        expect(createdProduct.bitrate).toBe(1411);
        expect(createdProduct.price).toBe(15.99);
        expect(createdProduct.stock).toBe(200);
        expect(createdProduct.tags).toEqual(['jazz', 'complete']);
        expect(createdProduct.language).toBe('es');
        expect(createdProduct.isExplicit).toBe(true);
        expect(createdProduct.ageRestriction).toBe(AgeRestriction.ADULT);
      }
    });
  });

  describe('findById', () => {
    it('should find audio product by ID successfully', async () => {
      const foundEntity = createMockAudioProductEntity({
        id: 'audio-123',
        title: 'Found Song',
        artist: 'Found Artist',
      });

      mockTypeOrmRepository.findOne.mockResolvedValue(foundEntity);

      const result = await repository.findById('audio-123');

      expect(result.isSuccess()).toBe(true);
      if (result.isSuccess()) {
        const foundProduct = result.value;
        expect(foundProduct.id).toBe('audio-123');
        expect(foundProduct.title).toBe('Found Song');
        expect(foundProduct.artist).toBe('Found Artist');
      }

      expect(mockTypeOrmRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'audio-123' }
      });
    });

    it('should handle product not found', async () => {
      mockTypeOrmRepository.findOne.mockResolvedValue(null);

      const result = await repository.findById('nonexistent-id');

      expect(result.isSuccess()).toBe(false);
      if (!result.isSuccess()) {
        expect(result.error.type).toBe('PRODUCT_NOT_FOUND');
        expect(result.error.message).toBe(ERROR_MESSAGES.PRODUCT_NOT_FOUND);
      }

      expect(mockTypeOrmRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'nonexistent-id' }
      });
    });

    it('should handle repository errors during findById', async () => {
      mockTypeOrmRepository.findOne.mockRejectedValue(new Error('Database error'));

      const result = await repository.findById('audio-123');

      expect(result.isSuccess()).toBe(false);
      if (!result.isSuccess()) {
        expect(result.error.type).toBe('VALIDATION_ERROR');
        expect(result.error.message).toBe('Error fetching audio product');
      }
    });

    it('should find different audio products by ID', async () => {
      const rockEntity = createMockAudioProductEntity({
        id: 'rock-123',
        title: 'Rock Song',
        genre: AudioGenre.ROCK,
      });

      const jazzEntity = createMockAudioProductEntity({
        id: 'jazz-123',
        title: 'Jazz Song',
        genre: AudioGenre.JAZZ,
      });

      mockTypeOrmRepository.findOne
        .mockResolvedValueOnce(rockEntity)
        .mockResolvedValueOnce(jazzEntity);

      const rockResult = await repository.findById('rock-123');
      const jazzResult = await repository.findById('jazz-123');

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
      const updateRequest: UpdateAudioProductRequest = {
        title: 'Updated Title',
        description: 'Updated description',
        price: 12.99,
      };

      const updatedEntity = createMockAudioProductEntity({
        id: 'audio-123',
        title: 'Updated Title',
        description: 'Updated description',
        price: 12.99,
      });

      mockTypeOrmRepository.update.mockResolvedValue({ affected: 1, raw: [], generatedMaps: [] } as UpdateResult);
      mockTypeOrmRepository.findOne.mockResolvedValue(updatedEntity);

      const result = await repository.update('audio-123', updateRequest);

      expect(result.isSuccess()).toBe(true);
      if (result.isSuccess()) {
        const updatedProduct = result.value;
        expect(updatedProduct.title).toBe('Updated Title');
        expect(updatedProduct.description).toBe('Updated description');
        expect(updatedProduct.price).toBe(12.99);
      }

      expect(mockTypeOrmRepository.update).toHaveBeenCalledWith('audio-123', updateRequest);
      expect(mockTypeOrmRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'audio-123' }
      });
    });

    it('should handle update when product not found', async () => {
      const updateRequest: UpdateAudioProductRequest = {
        title: 'Updated Title',
      };

      mockTypeOrmRepository.update.mockResolvedValue({ affected: 0, raw: [], generatedMaps: [] } as UpdateResult);

      const result = await repository.update('nonexistent-id', updateRequest);

      expect(result.isSuccess()).toBe(false);
      if (!result.isSuccess()) {
        expect(result.error.type).toBe('PRODUCT_NOT_FOUND');
        expect(result.error.message).toBe(ERROR_MESSAGES.PRODUCT_NOT_FOUND);
      }

      expect(mockTypeOrmRepository.update).toHaveBeenCalledWith('nonexistent-id', updateRequest);
    });

    it('should handle partial updates', async () => {
      const partialUpdateRequest: UpdateAudioProductRequest = {
        title: 'Partially Updated Title',
        price: 8.99,
      };

      const updatedEntity = createMockAudioProductEntity({
        id: 'audio-123',
        title: 'Partially Updated Title',
        price: 8.99,
      });

      mockTypeOrmRepository.update.mockResolvedValue({ affected: 1, raw: [], generatedMaps: [] } as UpdateResult);
      mockTypeOrmRepository.findOne.mockResolvedValue(updatedEntity);

      const result = await repository.update('audio-123', partialUpdateRequest);

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
      const updateRequest: UpdateAudioProductRequest = {
        title: 'Updated Title',
      };

      mockTypeOrmRepository.update.mockRejectedValue(new Error('Database error'));

      const result = await repository.update('audio-123', updateRequest);

      expect(result.isSuccess()).toBe(false);
      if (!result.isSuccess()) {
        expect(result.error.type).toBe('VALIDATION_ERROR');
        expect(result.error.message).toBe('Error updating audio product');
      }
    });

    it('should handle findOne error after successful update', async () => {
      const updateRequest: UpdateAudioProductRequest = {
        title: 'Updated Title',
      };

      mockTypeOrmRepository.update.mockResolvedValue({ affected: 1, raw: [], generatedMaps: [] } as UpdateResult);
      mockTypeOrmRepository.findOne.mockRejectedValue(new Error('Database error'));

      const result = await repository.update('audio-123', updateRequest);

      expect(result.isSuccess()).toBe(false);
      if (!result.isSuccess()) {
        expect(result.error.type).toBe('VALIDATION_ERROR');
        expect(result.error.message).toBe('Error updating audio product');
      }
    });
  });

  describe('delete', () => {
    it('should delete audio product successfully', async () => {
      const deleteResult: DeleteResult = { affected: 1, raw: [] };

      mockTypeOrmRepository.delete.mockResolvedValue(deleteResult);

      const result = await repository.delete('audio-123');

      expect(result.isSuccess()).toBe(true);
      if (result.isSuccess()) {
        expect(result.value).toBe(true);
      }

      expect(mockTypeOrmRepository.delete).toHaveBeenCalledWith('audio-123');
    });

    it('should handle delete when product not found', async () => {
      const deleteResult: DeleteResult = { affected: 0, raw: [] };

      mockTypeOrmRepository.delete.mockResolvedValue(deleteResult);

      const result = await repository.delete('nonexistent-id');

      expect(result.isSuccess()).toBe(false);
      if (!result.isSuccess()) {
        expect(result.error.type).toBe('PRODUCT_NOT_FOUND');
        expect(result.error.message).toBe(ERROR_MESSAGES.PRODUCT_NOT_FOUND);
      }

      expect(mockTypeOrmRepository.delete).toHaveBeenCalledWith('nonexistent-id');
    });

    it('should handle repository errors during delete', async () => {
      mockTypeOrmRepository.delete.mockRejectedValue(new Error('Database error'));

      const result = await repository.delete('audio-123');

      expect(result.isSuccess()).toBe(false);
      if (!result.isSuccess()) {
        expect(result.error.type).toBe('VALIDATION_ERROR');
        expect(result.error.message).toBe('Error deleting audio product');
      }
    });
  });

  describe('search', () => {
    it('should search audio products successfully', async () => {
      const searchRequest: SearchAudioProductsRequest = {
        query: 'rock',
        genre: AudioGenre.ROCK,
        minPrice: 5.00,
        maxPrice: 15.00,
      };

      const searchResults = [
        createMockAudioProductEntity({ id: 'search-1', title: 'Search Result 1' }),
        createMockAudioProductEntity({ id: 'search-2', title: 'Search Result 2' }),
      ];

      const mockQueryBuilder = {
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(searchResults),
      };

      mockTypeOrmRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      const result = await repository.search(searchRequest);

      expect(result.isSuccess()).toBe(true);
      if (result.isSuccess()) {
        const foundProducts = result.value;
        expect(foundProducts).toHaveLength(2);
        expect(foundProducts[0].title).toBe('Search Result 1');
        expect(foundProducts[1].title).toBe('Search Result 2');
      }

      expect(mockTypeOrmRepository.createQueryBuilder).toHaveBeenCalledWith('audioProduct');
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        '(audioProduct.title ILIKE :query OR audioProduct.description ILIKE :query)',
        { query: '%rock%' }
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'audioProduct.genre = :genre',
        { genre: AudioGenre.ROCK }
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'audioProduct.price >= :minPrice',
        { minPrice: 5.00 }
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'audioProduct.price <= :maxPrice',
        { maxPrice: 15.00 }
      );
      expect(mockQueryBuilder.getMany).toHaveBeenCalled();
    });

    it('should return empty array when no search results found', async () => {
      const searchRequest: SearchAudioProductsRequest = {
        query: 'nonexistent',
      };

      const mockQueryBuilder = {
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };

      mockTypeOrmRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      const result = await repository.search(searchRequest);

      expect(result.isSuccess()).toBe(true);
      if (result.isSuccess()) {
        const foundProducts = result.value;
        expect(foundProducts).toHaveLength(0);
      }
    });

    it('should handle search with different criteria', async () => {
      const searchRequest: SearchAudioProductsRequest = {
        genre: AudioGenre.JAZZ,
        artist: 'Dave Brubeck',
        isActive: true,
      };

      const jazzResults = [
        createMockAudioProductEntity({ id: 'jazz-1', genre: AudioGenre.JAZZ, artist: 'Dave Brubeck' }),
        createMockAudioProductEntity({ id: 'jazz-2', genre: AudioGenre.JAZZ, artist: 'Dave Brubeck' }),
      ];

      const mockQueryBuilder = {
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(jazzResults),
      };

      mockTypeOrmRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      const result = await repository.search(searchRequest);

      expect(result.isSuccess()).toBe(true);
      if (result.isSuccess()) {
        const foundProducts = result.value;
        expect(foundProducts).toHaveLength(2);
        expect(foundProducts.every(p => p.genre === AudioGenre.JAZZ)).toBe(true);
        expect(foundProducts.every(p => p.artist === 'Dave Brubeck')).toBe(true);
      }

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'audioProduct.genre = :genre',
        { genre: AudioGenre.JAZZ }
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'audioProduct.artist ILIKE :artist',
        { artist: '%Dave Brubeck%' }
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'audioProduct.isActive = :isActive',
        { isActive: true }
      );
    });

    it('should handle search without criteria', async () => {
      const searchRequest: SearchAudioProductsRequest = {};

      const allResults = [
        createMockAudioProductEntity({ id: 'all-1', title: 'Product 1' }),
        createMockAudioProductEntity({ id: 'all-2', title: 'Product 2' }),
      ];

      const mockQueryBuilder = {
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(allResults),
      };

      mockTypeOrmRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      const result = await repository.search(searchRequest);

      expect(result.isSuccess()).toBe(true);
      if (result.isSuccess()) {
        const foundProducts = result.value;
        expect(foundProducts).toHaveLength(2);
      }

      expect(mockTypeOrmRepository.createQueryBuilder).toHaveBeenCalledWith('audioProduct');
      expect(mockQueryBuilder.getMany).toHaveBeenCalled();
    });

    it('should handle repository errors during search', async () => {
      const searchRequest: SearchAudioProductsRequest = {
        query: 'rock',
      };

      mockTypeOrmRepository.createQueryBuilder.mockImplementation(() => {
        throw new Error('Database error');
      });

      const result = await repository.search(searchRequest);

      expect(result.isSuccess()).toBe(false);
      if (!result.isSuccess()) {
        expect(result.error.type).toBe('VALIDATION_ERROR');
        expect(result.error.message).toBe('Error searching audio products');
      }
    });
  });

  describe('findAll', () => {
    it('should find all audio products successfully', async () => {
      const allEntities = [
        createMockAudioProductEntity({ id: 'all-1', title: 'Product 1' }),
        createMockAudioProductEntity({ id: 'all-2', title: 'Product 2' }),
        createMockAudioProductEntity({ id: 'all-3', title: 'Product 3' }),
      ];

      mockTypeOrmRepository.find.mockResolvedValue(allEntities);

      const result = await repository.findAll();

      expect(result.isSuccess()).toBe(true);
      if (result.isSuccess()) {
        const foundProducts = result.value;
        expect(foundProducts).toHaveLength(3);
        expect(foundProducts[0].title).toBe('Product 1');
        expect(foundProducts[1].title).toBe('Product 2');
        expect(foundProducts[2].title).toBe('Product 3');
      }

      expect(mockTypeOrmRepository.find).toHaveBeenCalled();
    });

    it('should return empty array when no products exist', async () => {
      mockTypeOrmRepository.find.mockResolvedValue([]);

      const result = await repository.findAll();

      expect(result.isSuccess()).toBe(true);
      if (result.isSuccess()) {
        const foundProducts = result.value;
        expect(foundProducts).toHaveLength(0);
      }
    });

    it('should handle repository errors during findAll', async () => {
      mockTypeOrmRepository.find.mockRejectedValue(new Error('Database error'));

      const result = await repository.findAll();

      expect(result.isSuccess()).toBe(false);
      if (!result.isSuccess()) {
        expect(result.error.type).toBe('VALIDATION_ERROR');
        expect(result.error.message).toBe('Error fetching all audio products');
      }
    });
  });

  describe('Error handling', () => {
    it('should propagate repository errors correctly', async () => {
      const databaseError = new Error('Repository operation failed');
      mockTypeOrmRepository.save.mockRejectedValue(databaseError);

      const createRequest: CreateAudioProductRequest = {
        title: mockCreateDto.title,
        description: mockCreateDto.description,
        artist: mockCreateDto.artist,
        genre: mockCreateDto.genre,
        audioUrl: mockCreateDto.audioUrl,
        duration: mockCreateDto.duration,
        format: mockCreateDto.format,
        bitrate: mockCreateDto.bitrate,
        price: mockCreateDto.price,
        stock: mockCreateDto.stock,
        tags: mockCreateDto.tags,
        releaseDate: mockCreateDto.releaseDate,
        language: mockCreateDto.language,
        isExplicit: mockCreateDto.isExplicit,
        ageRestriction: mockCreateDto.ageRestriction,
      };

      const result = await repository.create(createRequest);

      expect(result.isSuccess()).toBe(false);
      if (!result.isSuccess()) {
        expect(result.error.type).toBe('VALIDATION_ERROR');
        expect(result.error.message).toBe(ERROR_MESSAGES.VALIDATION_ERROR);
      }
    });

    it('should handle different error types', async () => {
      mockTypeOrmRepository.findOne.mockResolvedValue(null);

      const result = await repository.findById('nonexistent-id');

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
      const createRequest: CreateAudioProductRequest = {
        title: mockCreateDto.title,
        description: mockCreateDto.description,
        artist: mockCreateDto.artist,
        genre: mockCreateDto.genre,
        audioUrl: mockCreateDto.audioUrl,
        duration: mockCreateDto.duration,
        format: mockCreateDto.format,
        bitrate: mockCreateDto.bitrate,
        price: mockCreateDto.price,
        stock: mockCreateDto.stock,
        tags: mockCreateDto.tags,
        releaseDate: mockCreateDto.releaseDate,
        language: mockCreateDto.language,
        isExplicit: mockCreateDto.isExplicit,
        ageRestriction: mockCreateDto.ageRestriction,
      };

      const newEntity = createMockAudioProductEntity({
        id: 'lifecycle-123',
        title: 'Lifecycle Song',
        artist: 'Lifecycle Artist',
      });

      mockTypeOrmRepository.save.mockResolvedValue(newEntity);

      const createResult = await repository.create(createRequest);
      expect(createResult.isSuccess()).toBe(true);

      // Read
      mockTypeOrmRepository.findOne.mockResolvedValue(newEntity);

      const readResult = await repository.findById('lifecycle-123');
      expect(readResult.isSuccess()).toBe(true);

      // Update
      const updateRequest: UpdateAudioProductRequest = {
        title: 'Updated Lifecycle Song',
      };

      const updatedEntity = createMockAudioProductEntity({
        id: 'lifecycle-123',
        title: 'Updated Lifecycle Song',
        artist: 'Lifecycle Artist',
      });

      mockTypeOrmRepository.update.mockResolvedValue({ affected: 1, raw: [], generatedMaps: [] } as UpdateResult);
      mockTypeOrmRepository.findOne.mockResolvedValue(updatedEntity);

      const updateResult = await repository.update('lifecycle-123', updateRequest);
      expect(updateResult.isSuccess()).toBe(true);

      // Delete
      mockTypeOrmRepository.delete.mockResolvedValue({ affected: 1, raw: [] } as DeleteResult);

      const deleteResult = await repository.delete('lifecycle-123');
      expect(deleteResult.isSuccess()).toBe(true);
    });

    it('should handle search and find operations together', async () => {
      // Search for products
      const searchRequest: SearchAudioProductsRequest = {
        genre: AudioGenre.ROCK,
      };

      const searchResults = [
        createMockAudioProductEntity({ id: 'search-1', genre: AudioGenre.ROCK }),
        createMockAudioProductEntity({ id: 'search-2', genre: AudioGenre.ROCK }),
      ];

      const mockQueryBuilder = {
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(searchResults),
      };

      mockTypeOrmRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      const searchResult = await repository.search(searchRequest);
      expect(searchResult.isSuccess()).toBe(true);

      if (searchResult.isSuccess()) {
        // Find specific product from search results
        const productId = searchResult.value[0].id;
        
        mockTypeOrmRepository.findOne.mockResolvedValue(searchResults[0]);

        const findResult = await repository.findById(productId);
        expect(findResult.isSuccess()).toBe(true);
        
        if (findResult.isSuccess()) {
          expect(findResult.value.genre).toBe(AudioGenre.ROCK);
        }
      }
    });
  });
});
