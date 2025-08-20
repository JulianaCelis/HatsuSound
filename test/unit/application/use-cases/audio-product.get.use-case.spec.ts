import { Test, TestingModule } from '@nestjs/testing';
import { GetAudioProductUseCase } from '@/application/use-cases/audio-product/get-audio-product.use-case';
import { IAudioProductRepositoryPort } from '@/domain/ports/output/audio-product.repository.port';
import { AudioProduct } from '@/domain/entities/audio-product.entity';
import { AudioProductResponse } from '@/domain/ports/input/audio-product.port';
import { Result, Success, Failure } from '@/domain/ports';
import { AudioProductError } from '@/domain/ports/input/audio-product.port';
import { 
  createMockAudioProduct, 
  createMockAudioProductEntity,
  validateAudioProductResponse,
  TEST_DATA,
  ERROR_MESSAGES
} from '../../../audio-product.test.config';

describe('GetAudioProductUseCase', () => {
  let useCase: GetAudioProductUseCase;
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
        GetAudioProductUseCase,
        {
          provide: 'AUDIO_PRODUCT_REPOSITORY',
          useValue: mockRepo,
        },
      ],
    }).compile();

    useCase = module.get<GetAudioProductUseCase>(GetAudioProductUseCase);
    mockAudioProductRepository = mockRepo as jest.Mocked<IAudioProductRepositoryPort>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should get an audio product successfully', async () => {
      const productId = 'audio-123';
      const expectedAudioProduct = createMockAudioProduct({ id: productId });

      mockAudioProductRepository.findById.mockResolvedValue(
        new Success(expectedAudioProduct)
      );

      const result = await useCase.execute(productId);

      expect(result.isSuccess()).toBe(true);
      if (result.isSuccess()) {
        const retrievedProduct = result.value;
        validateAudioProductResponse(retrievedProduct, expectedAudioProduct);
      }

      expect(mockAudioProductRepository.findById).toHaveBeenCalledWith(productId);
    });

    it('should return failure when ID is empty', async () => {
      const result = await useCase.execute('');

      expect(result.isFailure()).toBe(true);
      if (result.isFailure()) {
        expect(result.error.type).toBe('VALIDATION_ERROR');
        expect(result.error.message).toBe('ID is required');
      }

      expect(mockAudioProductRepository.findById).not.toHaveBeenCalled();
    });

    it('should return failure when ID is whitespace only', async () => {
      const result = await useCase.execute('   ');

      expect(result.isFailure()).toBe(true);
      if (result.isFailure()) {
        expect(result.error.type).toBe('VALIDATION_ERROR');
        expect(result.error.message).toBe('ID is required');
      }

      expect(mockAudioProductRepository.findById).not.toHaveBeenCalled();
    });

    it('should return failure when ID is null', async () => {
      const result = await useCase.execute(null as any);

      expect(result.isFailure()).toBe(true);
      if (result.isFailure()) {
        expect(result.error.type).toBe('VALIDATION_ERROR');
        expect(result.error.message).toBe('ID is required');
      }

      expect(mockAudioProductRepository.findById).not.toHaveBeenCalled();
    });

    it('should return failure when ID is undefined', async () => {
      const result = await useCase.execute(undefined as any);

      expect(result.isFailure()).toBe(true);
      if (result.isFailure()) {
        expect(result.error.type).toBe('VALIDATION_ERROR');
        expect(result.error.message).toBe('ID is required');
      }

      expect(mockAudioProductRepository.findById).not.toHaveBeenCalled();
    });

    it('should return failure when product is not found', async () => {
      const productId = 'non-existent-123';

      mockAudioProductRepository.findById.mockResolvedValue(
        new Failure({ type: 'PRODUCT_NOT_FOUND', message: 'Product not found' })
      );

      const result = await useCase.execute(productId);

      expect(result.isFailure()).toBe(true);
      if (result.isFailure()) {
        expect(result.error.type).toBe('PRODUCT_NOT_FOUND');
        expect(result.error.message).toBe('Audio product not found');
      }

      expect(mockAudioProductRepository.findById).toHaveBeenCalledWith(productId);
    });

    it('should return failure when repository throws an error', async () => {
      const productId = 'audio-123';
      const repositoryError = new Error('Database connection failed');

      mockAudioProductRepository.findById.mockRejectedValue(repositoryError);

      const result = await useCase.execute(productId);

      expect(result.isFailure()).toBe(true);
      if (result.isFailure()) {
        expect(result.error.type).toBe('VALIDATION_ERROR');
        expect(result.error.message).toBe('Error interno del servidor: Database connection failed');
      }

      expect(mockAudioProductRepository.findById).toHaveBeenCalledWith(productId);
    });

    it('should handle repository returning unexpected error type', async () => {
      const productId = 'audio-123';

      mockAudioProductRepository.findById.mockResolvedValue(
        new Failure({ type: 'INVALID_AUDIO_FORMAT', message: 'Invalid format' })
      );

      const result = await useCase.execute(productId);

      expect(result.isFailure()).toBe(true);
      if (result.isFailure()) {
        expect(result.error.type).toBe('PRODUCT_NOT_FOUND');
        expect(result.error.message).toBe('Audio product not found');
      }

      expect(mockAudioProductRepository.findById).toHaveBeenCalledWith(productId);
    });

    it('should correctly map entity to response format', async () => {
      const productId = 'audio-123';
              const mockEntity = createMockAudioProduct({ id: productId });

        mockAudioProductRepository.findById.mockResolvedValue(
          new Success(mockEntity)
        );

      const result = await useCase.execute(productId);

      expect(result.isSuccess()).toBe(true);
      if (result.isSuccess()) {
        const response = result.value;
        
        // Verify all fields are correctly mapped
        expect(response.id).toBe(mockEntity.id);
        expect(response.title).toBe(mockEntity.title);
        expect(response.description).toBe(mockEntity.description);
        expect(response.artist).toBe(mockEntity.artist);
        expect(response.genre).toBe(mockEntity.genre);
        expect(response.audioUrl).toBe(mockEntity.audioUrl);
        expect(response.duration).toBe(mockEntity.duration);
        expect(response.format).toBe(mockEntity.format);
        expect(response.bitrate).toBe(mockEntity.bitrate);
        expect(response.price).toBe(mockEntity.price);
        expect(response.stock).toBe(mockEntity.stock);
        expect(response.isActive).toBe(mockEntity.isActive);
        expect(response.tags).toEqual(mockEntity.tags);
        expect(response.releaseDate).toBe(mockEntity.releaseDate);
        expect(response.language).toBe(mockEntity.language);
        expect(response.isExplicit).toBe(mockEntity.isExplicit);
        expect(response.ageRestriction).toBe(mockEntity.ageRestriction);
        expect(response.playCount).toBe(mockEntity.playCount);
        expect(response.downloadCount).toBe(mockEntity.downloadCount);
        expect(response.createdAt).toBe(mockEntity.createdAt);
        expect(response.updatedAt).toBe(mockEntity.updatedAt);
      }
    });
  });
});
