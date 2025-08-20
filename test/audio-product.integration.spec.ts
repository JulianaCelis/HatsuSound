import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AudioProductModule } from '../src/infrastructure/modules/audio-product.module';
import { AudioProductService } from '../src/infrastructure/services/audio-product.service';
import { AudioProductRepository } from '../src/infrastructure/repositories/audio-product.repository';
import { AudioProductEntity } from '../src/infrastructure/database/entities/audio-product.entity';
import { AudioProduct, AudioFormat, AudioGenre, AgeRestriction } from '../src/domain/entities/audio-product.entity';
import { CreateAudioProductDto, UpdateAudioProductDto, SearchAudioProductsDto } from '../src/infrastructure/dto/audio-product.dto';
import { 
  createMockAudioProduct, 
  createMockAudioProductEntity,
  createMockCreateAudioProductDto,
  createMockUpdateAudioProductDto,
  createMockSearchAudioProductsDto,
  validateAudioProductResponse,
  TEST_DATA,
  ERROR_MESSAGES
} from './audio-product.test.config';

describe('AudioProduct Module Integration', () => {
  let module: TestingModule;
  let audioProductService: AudioProductService;
  let audioProductRepository: AudioProductRepository;
  let mockTypeOrmRepository: jest.Mocked<Repository<AudioProductEntity>>;

  const mockAudioProduct = createMockAudioProduct();
  const mockAudioProductEntity = createMockAudioProductEntity();
  const mockCreateDto = createMockCreateAudioProductDto();
  const mockUpdateDto = createMockUpdateAudioProductDto();
  const mockSearchDto = createMockSearchAudioProductsDto();

  beforeEach(async () => {
    const mockRepo = {
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      createQueryBuilder: jest.fn(),
      target: {} as any,
      manager: {} as any,
      metadata: {} as any,
      extend: jest.fn(),
    } as any;

    module = await Test.createTestingModule({
      imports: [AudioProductModule],
    })
      .overrideProvider(getRepositoryToken(AudioProductEntity))
      .useValue(mockRepo)
      .compile();

    audioProductService = module.get<AudioProductService>(AudioProductService);
    audioProductRepository = module.get<AudioProductRepository>(AudioProductRepository);
    mockTypeOrmRepository = module.get(getRepositoryToken(AudioProductEntity));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('AudioProductService + AudioProductRepository Integration', () => {
    describe('Create operations', () => {
      it('should create audio product through service and repository', async () => {
        const createDto = createMockCreateAudioProductDto({
          title: 'Integration Song',
          description: 'A song to test integration',
          artist: 'Integration Artist',
          genre: AudioGenre.ROCK,
        });

        const savedEntity = createMockAudioProductEntity({
          id: 'integration-123',
          title: 'Integration Song',
          description: 'A song to test integration',
          artist: 'Integration Artist',
          genre: AudioGenre.ROCK,
        });

        mockTypeOrmRepository.save.mockResolvedValue(savedEntity);

        const result = await audioProductService.create(createDto);

        expect(result.isSuccess()).toBe(true);
        if (result.isSuccess()) {
          const createdProduct = result.value;
          expect(createdProduct.title).toBe('Integration Song');
          expect(createdProduct.artist).toBe('Integration Artist');
          expect(createdProduct.genre).toBe(AudioGenre.ROCK);
        }

        expect(mockTypeOrmRepository.save).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Integration Song',
            description: 'A song to test integration',
            artist: 'Integration Artist',
            genre: AudioGenre.ROCK,
          })
        );
      });

      it('should handle creation with all fields populated', async () => {
        const completeDto = createMockCreateAudioProductDto({
          title: 'Complete Integration Song',
          description: 'A complete song for integration testing',
          artist: 'Complete Artist',
          genre: AudioGenre.JAZZ,
          audioUrl: 'https://example.com/audio/complete-integration.mp3',
          duration: 300,
          format: AudioFormat.WAV,
          bitrate: 1411,
          price: 15.99,
          stock: 200,
          tags: ['jazz', 'integration', 'complete'],
          releaseDate: new Date('2024-01-01'),
          language: 'es',
          isExplicit: true,
          ageRestriction: AgeRestriction.ADULT,
        });

        const savedEntity = createMockAudioProductEntity({
          id: 'complete-integration-123',
          title: 'Complete Integration Song',
          description: 'A complete song for integration testing',
          artist: 'Complete Artist',
          genre: AudioGenre.JAZZ,
          audioUrl: 'https://example.com/audio/complete-integration.mp3',
          duration: 300,
          format: AudioFormat.WAV,
          bitrate: 1411,
          price: 15.99,
          stock: 200,
          tags: ['jazz', 'integration', 'complete'],
          releaseDate: new Date('2024-01-01'),
          language: 'es',
          isExplicit: true,
          ageRestriction: AgeRestriction.ADULT,
        });

        mockTypeOrmRepository.save.mockResolvedValue(savedEntity);

        const result = await audioProductService.create(completeDto);

        expect(result.isSuccess()).toBe(true);
        if (result.isSuccess()) {
          const createdProduct = result.value;
          expect(createdProduct.title).toBe('Complete Integration Song');
          expect(createdProduct.genre).toBe(AudioGenre.JAZZ);
          expect(createdProduct.format).toBe(AudioFormat.WAV);
          expect(createdProduct.bitrate).toBe(1411);
          expect(createdProduct.price).toBe(15.99);
          expect(createdProduct.stock).toBe(200);
          expect(createdProduct.tags).toEqual(['jazz', 'integration', 'complete']);
          expect(createdProduct.language).toBe('es');
          expect(createdProduct.isExplicit).toBe(true);
          expect(createdProduct.ageRestriction).toBe(AgeRestriction.ADULT);
        }
      });

      it('should handle creation failure through repository', async () => {
        const createDto = createMockCreateAudioProductDto();

        mockTypeOrmRepository.save.mockRejectedValue(new Error('Database connection failed'));

        const result = await audioProductService.create(createDto);

        expect(result.isSuccess()).toBe(false);
        if (!result.isSuccess()) {
          expect(result.error.type).toBe('VALIDATION_ERROR');
          expect(result.error.message).toBe('Error creating audio product');
        }
      });
    });

    describe('Read operations', () => {
      it('should find audio product by ID through service and repository', async () => {
        const foundEntity = createMockAudioProductEntity({
          id: 'read-123',
          title: 'Read Test Song',
          artist: 'Read Test Artist',
        });

        mockTypeOrmRepository.findOne.mockResolvedValue(foundEntity);

        const result = await audioProductService.findById('read-123');

        expect(result.isSuccess()).toBe(true);
        if (result.isSuccess()) {
          const foundProduct = result.value;
          expect(foundProduct.id).toBe('read-123');
          expect(foundProduct.title).toBe('Read Test Song');
          expect(foundProduct.artist).toBe('Read Test Artist');
        }

        expect(mockTypeOrmRepository.findOne).toHaveBeenCalledWith({
          where: { id: 'read-123' }
        });
      });

      it('should handle product not found through repository', async () => {
        mockTypeOrmRepository.findOne.mockResolvedValue(null);

        const result = await audioProductService.findById('nonexistent-id');

        expect(result.isSuccess()).toBe(false);
        if (!result.isSuccess()) {
          expect(result.error.type).toBe('PRODUCT_NOT_FOUND');
          expect(result.error.message).toBe(ERROR_MESSAGES.PRODUCT_NOT_FOUND);
        }
      });

      it('should find all audio products through service and repository', async () => {
        const allEntities = [
          createMockAudioProductEntity({ id: 'all-1', title: 'Product 1' }),
          createMockAudioProductEntity({ id: 'all-2', title: 'Product 2' }),
          createMockAudioProductEntity({ id: 'all-3', title: 'Product 3' }),
        ];

        mockTypeOrmRepository.find.mockResolvedValue(allEntities);

        const result = await audioProductService.findAll();

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
    });

    describe('Update operations', () => {
      it('should update audio product through service and repository', async () => {
        const updateDto = createMockUpdateAudioProductDto({
          title: 'Updated Integration Song',
          price: 12.99,
        });

        const updatedEntity = createMockAudioProductEntity({
          id: 'update-123',
          title: 'Updated Integration Song',
          price: 12.99,
        });

        mockTypeOrmRepository.update.mockResolvedValue({ affected: 1, raw: [] } as any);
        mockTypeOrmRepository.findOne.mockResolvedValue(updatedEntity);

        const result = await audioProductService.update('update-123', updateDto);

        expect(result.isSuccess()).toBe(true);
        if (result.isSuccess()) {
          const updatedProduct = result.value;
          expect(updatedProduct.title).toBe('Updated Integration Song');
          expect(updatedProduct.price).toBe(12.99);
        }

        expect(mockTypeOrmRepository.update).toHaveBeenCalledWith('update-123', updateDto);
        expect(mockTypeOrmRepository.findOne).toHaveBeenCalledWith({
          where: { id: 'update-123' }
        });
      });

      it('should handle update when product not found', async () => {
        const updateDto = createMockUpdateAudioProductDto({
          title: 'Updated Title',
        });

        mockTypeOrmRepository.update.mockResolvedValue({ affected: 0, raw: [] } as any);

        const result = await audioProductService.update('nonexistent-id', updateDto);

        expect(result.isSuccess()).toBe(false);
        if (!result.isSuccess()) {
          expect(result.error.type).toBe('PRODUCT_NOT_FOUND');
          expect(result.error.message).toBe(ERROR_MESSAGES.PRODUCT_NOT_FOUND);
        }
      });

      it('should handle partial updates correctly', async () => {
        const partialUpdateDto = createMockUpdateAudioProductDto({
          title: 'Partially Updated Song',
          description: 'Updated description only',
        });

        const updatedEntity = createMockAudioProductEntity({
          id: 'partial-123',
          title: 'Partially Updated Song',
          description: 'Updated description only',
        });

        mockTypeOrmRepository.update.mockResolvedValue({ affected: 1, raw: [] } as any);
        mockTypeOrmRepository.findOne.mockResolvedValue(updatedEntity);

        const result = await audioProductService.update('partial-123', partialUpdateDto);

        expect(result.isSuccess()).toBe(true);
        if (result.isSuccess()) {
          const updatedProduct = result.value;
          expect(updatedProduct.title).toBe('Partially Updated Song');
          expect(updatedProduct.description).toBe('Updated description only');
          // Other fields should remain unchanged
          expect(updatedProduct.artist).toBe(mockAudioProduct.artist);
          expect(updatedProduct.genre).toBe(mockAudioProduct.genre);
        }
      });
    });

    describe('Delete operations', () => {
      it('should delete audio product through service and repository', async () => {
        mockTypeOrmRepository.delete.mockResolvedValue({ affected: 1, raw: [] } as any);

        const result = await audioProductService.delete('delete-123');

        expect(result.isSuccess()).toBe(true);
        if (result.isSuccess()) {
          expect(result.value).toBe(true);
        }

        expect(mockTypeOrmRepository.delete).toHaveBeenCalledWith('delete-123');
      });

      it('should handle delete when product not found', async () => {
        mockTypeOrmRepository.delete.mockResolvedValue({ affected: 0, raw: [] } as any);

        const result = await audioProductService.delete('nonexistent-id');

        expect(result.isSuccess()).toBe(false);
        if (!result.isSuccess()) {
          expect(result.error.type).toBe('PRODUCT_NOT_FOUND');
          expect(result.error.message).toBe(ERROR_MESSAGES.PRODUCT_NOT_FOUND);
        }
      });
    });

    describe('Search operations', () => {
      it('should search audio products through service and repository', async () => {
        const searchDto = createMockSearchAudioProductsDto({
          query: 'rock',
          genre: AudioGenre.ROCK,
          minPrice: 5.00,
          maxPrice: 15.00,
        });

        const searchResults = [
          createMockAudioProductEntity({ id: 'search-1', title: 'Rock Song 1', genre: AudioGenre.ROCK }),
          createMockAudioProductEntity({ id: 'search-2', title: 'Rock Song 2', genre: AudioGenre.ROCK }),
        ];

        const mockQueryBuilder = {
          andWhere: jest.fn().mockReturnThis(),
          getMany: jest.fn().mockResolvedValue(searchResults),
        };

        mockTypeOrmRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

        const result = await audioProductService.search(searchDto);

        expect(result.isSuccess()).toBe(true);
        if (result.isSuccess()) {
          const foundProducts = result.value;
          expect(foundProducts).toHaveLength(2);
          expect(foundProducts.every(p => p.genre === AudioGenre.ROCK)).toBe(true);
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

      it('should handle search with different criteria combinations', async () => {
        const searchDto = createMockSearchAudioProductsDto({
          artist: 'Queen',
          isActive: true,
          sortBy: 'title',
          sortOrder: 'desc',
        });

        const searchResults = [
          createMockAudioProductEntity({ id: 'queen-1', title: 'Zebra', artist: 'Queen' }),
          createMockAudioProductEntity({ id: 'queen-2', title: 'Bohemian Rhapsody', artist: 'Queen' }),
        ];

        const mockQueryBuilder = {
          andWhere: jest.fn().mockReturnThis(),
          getMany: jest.fn().mockResolvedValue(searchResults),
        };

        mockTypeOrmRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

        const result = await audioProductService.search(searchDto);

        expect(result.isSuccess()).toBe(true);
        if (result.isSuccess()) {
          const foundProducts = result.value;
          expect(foundProducts).toHaveLength(2);
          expect(foundProducts.every(p => p.artist === 'Queen')).toBe(true);
        }

        expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
          'audioProduct.artist ILIKE :artist',
          { artist: '%Queen%' }
        );
        expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
          'audioProduct.isActive = :isActive',
          { isActive: true }
        );
      });

      it('should return empty array when no search results found', async () => {
        const searchDto = createMockSearchAudioProductsDto({
          query: 'nonexistent',
        });

        const mockQueryBuilder = {
          andWhere: jest.fn().mockReturnThis(),
          getMany: jest.fn().mockResolvedValue([]),
        };

        mockTypeOrmRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

        const result = await audioProductService.search(searchDto);

        expect(result.isSuccess()).toBe(true);
        if (result.isSuccess()) {
          const foundProducts = result.value;
          expect(foundProducts).toHaveLength(0);
        }
      });
    });

    describe('Error handling integration', () => {
      it('should propagate database errors from repository to service', async () => {
        const createDto = createMockCreateAudioProductDto();

        mockTypeOrmRepository.save.mockRejectedValue(new Error('Database connection failed'));

        const result = await audioProductService.create(createDto);

        expect(result.isSuccess()).toBe(false);
        if (!result.isSuccess()) {
          expect(result.error.type).toBe('VALIDATION_ERROR');
          expect(result.error.message).toBe('Error creating audio product');
        }
      });

      it('should handle repository errors during findById', async () => {
        mockTypeOrmRepository.findOne.mockRejectedValue(new Error('Database error'));

        const result = await audioProductService.findById('audio-123');

        expect(result.isSuccess()).toBe(false);
        if (!result.isSuccess()) {
          expect(result.error.type).toBe('VALIDATION_ERROR');
          expect(result.error.message).toBe('Error fetching audio product');
        }
      });

      it('should handle repository errors during update', async () => {
        const updateDto = createMockUpdateAudioProductDto({
          title: 'Updated Title',
        });

        mockTypeOrmRepository.update.mockRejectedValue(new Error('Database error'));

        const result = await audioProductService.update('audio-123', updateDto);

        expect(result.isSuccess()).toBe(false);
        if (!result.isSuccess()) {
          expect(result.error.type).toBe('VALIDATION_ERROR');
          expect(result.error.message).toBe('Error updating audio product');
        }
      });

      it('should handle repository errors during delete', async () => {
        mockTypeOrmRepository.delete.mockRejectedValue(new Error('Database error'));

        const result = await audioProductService.delete('audio-123');

        expect(result.isSuccess()).toBe(false);
        if (!result.isSuccess()) {
          expect(result.error.type).toBe('VALIDATION_ERROR');
          expect(result.error.message).toBe('Error deleting audio product');
        }
      });

      it('should handle repository errors during search', async () => {
        const searchDto = createMockSearchAudioProductsDto({
          query: 'rock',
        });

        mockTypeOrmRepository.createQueryBuilder.mockImplementation(() => {
          throw new Error('Database error');
        });

        const result = await audioProductService.search(searchDto);

        expect(result.isSuccess()).toBe(false);
        if (!result.isSuccess()) {
          expect(result.error.type).toBe('VALIDATION_ERROR');
          expect(result.error.message).toBe('Error searching audio products');
        }
      });

      it('should handle repository errors during findAll', async () => {
        mockTypeOrmRepository.find.mockRejectedValue(new Error('Database error'));

        const result = await audioProductService.findAll();

        expect(result.isSuccess()).toBe(false);
        if (!result.isSuccess()) {
          expect(result.error.type).toBe('VALIDATION_ERROR');
          expect(result.error.message).toBe('Error fetching all audio products');
        }
      });
    });

    describe('Data consistency and lifecycle', () => {
      it('should maintain data consistency through CRUD operations', async () => {
        // Create
        const createDto = createMockCreateAudioProductDto({
          title: 'Consistency Test Song',
          artist: 'Consistency Artist',
          genre: AudioGenre.POP,
        });

        const createdEntity = createMockAudioProductEntity({
          id: 'consistency-123',
          title: 'Consistency Test Song',
          artist: 'Consistency Artist',
          genre: AudioGenre.POP,
        });

        mockTypeOrmRepository.save.mockResolvedValue(createdEntity);

        const createResult = await audioProductService.create(createDto);
        expect(createResult.isSuccess()).toBe(true);

        // Read
        mockTypeOrmRepository.findOne.mockResolvedValue(createdEntity);

        const readResult = await audioProductService.findById('consistency-123');
        expect(readResult.isSuccess()).toBe(true);

        if (readResult.isSuccess()) {
          const readProduct = readResult.value;
          expect(readProduct.title).toBe('Consistency Test Song');
          expect(readProduct.artist).toBe('Consistency Artist');
          expect(readProduct.genre).toBe(AudioGenre.POP);
        }

        // Update
        const updateDto = createMockUpdateAudioProductDto({
          title: 'Updated Consistency Song',
          price: 11.99,
        });

        const updatedEntity = createMockAudioProductEntity({
          id: 'consistency-123',
          title: 'Updated Consistency Song',
          artist: 'Consistency Artist',
          genre: AudioGenre.POP,
          price: 11.99,
        });

        mockTypeOrmRepository.update.mockResolvedValue({ affected: 1, raw: [] } as any);
        mockTypeOrmRepository.findOne.mockResolvedValue(updatedEntity);

        const updateResult = await audioProductService.update('consistency-123', updateDto);
        expect(updateResult.isSuccess()).toBe(true);

        if (updateResult.isSuccess()) {
          const updatedProduct = updateResult.value;
          expect(updatedProduct.title).toBe('Updated Consistency Song');
          expect(updatedProduct.price).toBe(11.99);
          // Artist and genre should remain unchanged
          expect(updatedProduct.artist).toBe('Consistency Artist');
          expect(updatedProduct.genre).toBe(AudioGenre.POP);
        }

        // Delete
        mockTypeOrmRepository.delete.mockResolvedValue({ affected: 1, raw: [] } as any);

        const deleteResult = await audioProductService.delete('consistency-123');
        expect(deleteResult.isSuccess()).toBe(true);
      });

      it('should handle concurrent operations correctly', async () => {
        const createDto1 = createMockCreateAudioProductDto({
          title: 'Concurrent Song 1',
          artist: 'Concurrent Artist 1',
        });

        const createDto2 = createMockCreateAudioProductDto({
          title: 'Concurrent Song 2',
          artist: 'Concurrent Artist 2',
        });

        const entity1 = createMockAudioProductEntity({
          id: 'concurrent-1',
          title: 'Concurrent Song 1',
          artist: 'Concurrent Artist 1',
        });

        const entity2 = createMockAudioProductEntity({
          id: 'concurrent-2',
          title: 'Concurrent Song 2',
          artist: 'Concurrent Artist 2',
        });

        // Mock save to return different entities based on input
        mockTypeOrmRepository.save.mockImplementation((input) => {
          if (input.title === 'Concurrent Song 1') {
            return Promise.resolve(entity1);
          } else {
            return Promise.resolve(entity2);
          }
        });

        const result1 = await audioProductService.create(createDto1);
        const result2 = await audioProductService.create(createDto2);

        expect(result1.isSuccess()).toBe(true);
        expect(result2.isSuccess()).toBe(true);

        if (result1.isSuccess() && result2.isSuccess()) {
          expect(result1.value.title).toBe('Concurrent Song 1');
          expect(result1.value.artist).toBe('Concurrent Artist 1');
          expect(result2.value.title).toBe('Concurrent Song 2');
          expect(result2.value.artist).toBe('Concurrent Artist 2');
        }
      });
    });

    describe('Edge cases and boundary conditions', () => {
      it('should handle very long titles and descriptions', async () => {
        const longTitle = 'A'.repeat(255);
        const longDescription = 'B'.repeat(1000);

        const createDto = createMockCreateAudioProductDto({
          title: longTitle,
          description: longDescription,
          artist: 'Long Content Artist',
        });

        const savedEntity = createMockAudioProductEntity({
          id: 'long-123',
          title: longTitle,
          description: longDescription,
          artist: 'Long Content Artist',
        });

        mockTypeOrmRepository.save.mockResolvedValue(savedEntity);

        const result = await audioProductService.create(createDto);

        expect(result.isSuccess()).toBe(true);
        if (result.isSuccess()) {
          const createdProduct = result.value;
          expect(createdProduct.title).toBe(longTitle);
          expect(createdProduct.description).toBe(longDescription);
        }
      });

      it('should handle extreme duration and price values', async () => {
        const createDto = createMockCreateAudioProductDto({
          title: 'Extreme Values Song',
          duration: 7200, // 2 hours
          price: 999.99,
          stock: 1,
        });

        const savedEntity = createMockAudioProductEntity({
          id: 'extreme-123',
          title: 'Extreme Values Song',
          duration: 7200,
          price: 999.99,
          stock: 1,
        });

        mockTypeOrmRepository.save.mockResolvedValue(savedEntity);

        const result = await audioProductService.create(createDto);

        expect(result.isSuccess()).toBe(true);
        if (result.isSuccess()) {
          const createdProduct = result.value;
          expect(createdProduct.duration).toBe(7200);
          expect(createdProduct.price).toBe(999.99);
          expect(createdProduct.stock).toBe(1);
          expect(createdProduct.durationFormatted).toBe('120:00');
          expect(createdProduct.priceFormatted).toBe('$999.99');
        }
      });

      it('should handle special characters in text fields', async () => {
        const specialTitle = 'Song with special chars: áéíóú ñ & % $ # @ !';
        const specialArtist = 'Artist with symbols: © ® ™ ♪ ♫';

        const createDto = createMockCreateAudioProductDto({
          title: specialTitle,
          artist: specialArtist,
        });

        const savedEntity = createMockAudioProductEntity({
          id: 'special-123',
          title: specialTitle,
          artist: specialArtist,
        });

        mockTypeOrmRepository.save.mockResolvedValue(savedEntity);

        const result = await audioProductService.create(createDto);

        expect(result.isSuccess()).toBe(true);
        if (result.isSuccess()) {
          const createdProduct = result.value;
          expect(createdProduct.title).toBe(specialTitle);
          expect(createdProduct.artist).toBe(specialArtist);
        }
      });
    });
  });
});
