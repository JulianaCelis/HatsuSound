import { Test, TestingModule } from '@nestjs/testing';
import { UpdateAudioProductUseCase } from '@/application/use-cases/audio-product/update-audio-product.use-case';
import { IAudioProductRepositoryPort } from '@/domain/ports/output/audio-product.repository.port';
import { AudioProduct } from '@/domain/entities/audio-product.entity';
import { UpdateAudioProductRequest, AudioProductResponse } from '@/domain/ports/input/audio-product.port';
import { Result, Success, Failure } from '@/domain/ports';
import { AudioProductError } from '@/domain/ports/input/audio-product.port';
import { 
  createMockAudioProduct, 
  createMockAudioProductEntity,
  validateAudioProductResponse,
  TEST_DATA,
  ERROR_MESSAGES
} from '../../../audio-product.test.config';

describe('UpdateAudioProductUseCase', () => {
  let useCase: UpdateAudioProductUseCase;
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
        UpdateAudioProductUseCase,
        {
          provide: 'AUDIO_PRODUCT_REPOSITORY',
          useValue: mockRepo,
        },
      ],
    }).compile();

    useCase = module.get<UpdateAudioProductUseCase>(UpdateAudioProductUseCase);
    mockAudioProductRepository = mockRepo as jest.Mocked<IAudioProductRepositoryPort>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should update an audio product successfully', async () => {
      const productId = 'audio-123';
      const updateData: UpdateAudioProductRequest = {
        title: 'Updated Title',
        price: 29.99,
        stock: 50,
      };

      const updatedAudioProduct = createMockAudioProduct({
        id: productId,
        title: updateData.title,
        price: updateData.price,
        stock: updateData.stock,
      });

      mockAudioProductRepository.update.mockResolvedValue(
        new Success(updatedAudioProduct)
      );

      const result = await useCase.execute({ id: productId, data: updateData });

      expect(result.isSuccess()).toBe(true);
      if (result.isSuccess()) {
        const updatedProduct = result.value;
        validateAudioProductResponse(updatedProduct, updatedAudioProduct);
      }

      expect(mockAudioProductRepository.update).toHaveBeenCalledWith(productId, updateData);
    });

    it('should return failure when ID is empty', async () => {
      const updateData: UpdateAudioProductRequest = { title: 'Updated Title' };

      const result = await useCase.execute({ id: '', data: updateData });

      expect(result.isFailure()).toBe(true);
      if (result.isFailure()) {
        expect(result.error.type).toBe('VALIDATION_ERROR');
        expect(result.error.message).toBe('ID is required');
      }

      expect(mockAudioProductRepository.update).not.toHaveBeenCalled();
    });

    it('should return failure when ID is whitespace only', async () => {
      const updateData: UpdateAudioProductRequest = { title: 'Updated Title' };

      const result = await useCase.execute({ id: '   ', data: updateData });

      expect(result.isFailure()).toBe(true);
      if (result.isFailure()) {
        expect(result.error.type).toBe('VALIDATION_ERROR');
        expect(result.error.message).toBe('ID is required');
      }

      expect(mockAudioProductRepository.update).not.toHaveBeenCalled();
    });

    it('should return failure when update data is empty', async () => {
      const productId = 'audio-123';
      const updateData = {};

      const result = await useCase.execute({ id: productId, data: updateData });

      expect(result.isFailure()).toBe(true);
      if (result.isFailure()) {
        expect(result.error.type).toBe('VALIDATION_ERROR');
        expect(result.error.message).toBe('Update data is required');
      }

      expect(mockAudioProductRepository.update).not.toHaveBeenCalled();
    });

    it('should return failure when update data is null', async () => {
      const productId = 'audio-123';

      const result = await useCase.execute({ id: productId, data: null as any });

      expect(result.isFailure()).toBe(true);
      if (result.isFailure()) {
        expect(result.error.type).toBe('VALIDATION_ERROR');
        expect(result.error.message).toBe('Update data is required');
      }

      expect(mockAudioProductRepository.update).not.toHaveBeenCalled();
    });

    it('should return failure when price is negative', async () => {
      const productId = 'audio-123';
      const updateData: UpdateAudioProductRequest = { price: -10 };

      const result = await useCase.execute({ id: productId, data: updateData });

      expect(result.isFailure()).toBe(true);
      if (result.isFailure()) {
        expect(result.error.type).toBe('PRICE_INVALID');
        expect(result.error.message).toBe('Price cannot be negative');
      }

      expect(mockAudioProductRepository.update).not.toHaveBeenCalled();
    });

    it('should return failure when stock is negative', async () => {
      const productId = 'audio-123';
      const updateData: UpdateAudioProductRequest = { stock: -5 };

      const result = await useCase.execute({ id: productId, data: updateData });

      expect(result.isFailure()).toBe(true);
      if (result.isFailure()) {
        expect(result.error.type).toBe('VALIDATION_ERROR');
        expect(result.error.message).toBe('Stock cannot be negative');
      }

      expect(mockAudioProductRepository.update).not.toHaveBeenCalled();
    });

    it('should return failure when duration is zero', async () => {
      const productId = 'audio-123';
      const updateData: UpdateAudioProductRequest = { duration: 0 };

      const result = await useCase.execute({ id: productId, data: updateData });

      expect(result.isFailure()).toBe(true);
      if (result.isFailure()) {
        expect(result.error.type).toBe('VALIDATION_ERROR');
        expect(result.error.message).toBe('Duration must be positive');
      }

      expect(mockAudioProductRepository.update).not.toHaveBeenCalled();
    });

    it('should return failure when duration is negative', async () => {
      const productId = 'audio-123';
      const updateData: UpdateAudioProductRequest = { duration: -120 };

      const result = await useCase.execute({ id: productId, data: updateData });

      expect(result.isFailure()).toBe(true);
      if (result.isFailure()) {
        expect(result.error.type).toBe('VALIDATION_ERROR');
        expect(result.error.message).toBe('Duration must be positive');
      }

      expect(mockAudioProductRepository.update).not.toHaveBeenCalled();
    });

    it('should return failure when bitrate is zero', async () => {
      const productId = 'audio-123';
      const updateData: UpdateAudioProductRequest = { bitrate: 0 };

      const result = await useCase.execute({ id: productId, data: updateData });

      expect(result.isFailure()).toBe(true);
      if (result.isFailure()) {
        expect(result.error.type).toBe('VALIDATION_ERROR');
        expect(result.error.message).toBe('Bitrate must be positive');
      }

      expect(mockAudioProductRepository.update).not.toHaveBeenCalled();
    });

    it('should return failure when bitrate is negative', async () => {
      const productId = 'audio-123';
      const updateData: UpdateAudioProductRequest = { bitrate: -320 };

      const result = await useCase.execute({ id: productId, data: updateData });

      expect(result.isFailure()).toBe(true);
      if (result.isFailure()) {
        expect(result.error.type).toBe('VALIDATION_ERROR');
        expect(result.error.message).toBe('Bitrate must be positive');
      }

      expect(mockAudioProductRepository.update).not.toHaveBeenCalled();
    });

    it('should allow valid updates with multiple fields', async () => {
      const productId = 'audio-123';
      const updateData: UpdateAudioProductRequest = {
        title: 'New Title',
        description: 'New Description',
        price: 19.99,
        stock: 100,
        isActive: false,
      };

      const updatedAudioProduct = createMockAudioProduct({
        id: productId,
        ...updateData,
      });

      mockAudioProductRepository.update.mockResolvedValue(
        new Success(updatedAudioProduct)
      );

      const result = await useCase.execute({ id: productId, data: updateData });

      expect(result.isSuccess()).toBe(true);
      if (result.isSuccess()) {
        const updatedProduct = result.value;
        validateAudioProductResponse(updatedProduct, updatedAudioProduct);
      }

      expect(mockAudioProductRepository.update).toHaveBeenCalledWith(productId, updateData);
    });

    it('should return failure when product is not found', async () => {
      const productId = 'non-existent-123';
      const updateData: UpdateAudioProductRequest = { title: 'Updated Title' };

      mockAudioProductRepository.update.mockResolvedValue(
        new Failure({ type: 'PRODUCT_NOT_FOUND', message: 'Product not found' })
      );

      const result = await useCase.execute({ id: productId, data: updateData });

      expect(result.isFailure()).toBe(true);
      if (result.isFailure()) {
        expect(result.error.type).toBe('PRODUCT_NOT_FOUND');
        expect(result.error.message).toBe('Audio product not found');
      }

      expect(mockAudioProductRepository.update).toHaveBeenCalledWith(productId, updateData);
    });

    it('should return failure when repository throws an error', async () => {
      const productId = 'audio-123';
      const updateData: UpdateAudioProductRequest = { title: 'Updated Title' };
      const repositoryError = new Error('Database connection failed');

      mockAudioProductRepository.update.mockRejectedValue(repositoryError);

      const result = await useCase.execute({ id: productId, data: updateData });

      expect(result.isFailure()).toBe(true);
      if (result.isFailure()) {
        expect(result.error.type).toBe('VALIDATION_ERROR');
        expect(result.error.message).toBe('Error interno del servidor: Database connection failed');
      }

      expect(mockAudioProductRepository.update).toHaveBeenCalledWith(productId, updateData);
    });

    it('should correctly map updated entity to response format', async () => {
      const productId = 'audio-123';
      const updateData: UpdateAudioProductRequest = {
        title: 'Updated Title',
        price: 25.99,
      };

              const updatedEntity = createMockAudioProduct({
          id: productId,
          title: updateData.title,
          price: updateData.price,
        });

        mockAudioProductRepository.update.mockResolvedValue(
          new Success(updatedEntity)
        );

      const result = await useCase.execute({ id: productId, data: updateData });

      expect(result.isSuccess()).toBe(true);
      if (result.isSuccess()) {
        const response = result.value;
        
        // Verify all fields are correctly mapped
        expect(response.id).toBe(updatedEntity.id);
        expect(response.title).toBe(updatedEntity.title);
        expect(response.price).toBe(updatedEntity.price);
        expect(response.description).toBe(updatedEntity.description);
        expect(response.artist).toBe(updatedEntity.artist);
        expect(response.genre).toBe(updatedEntity.genre);
        expect(response.audioUrl).toBe(updatedEntity.audioUrl);
        expect(response.duration).toBe(updatedEntity.duration);
        expect(response.format).toBe(updatedEntity.format);
        expect(response.bitrate).toBe(updatedEntity.bitrate);
        expect(response.stock).toBe(updatedEntity.stock);
        expect(response.isActive).toBe(updatedEntity.isActive);
        expect(response.tags).toEqual(updatedEntity.tags);
        expect(response.releaseDate).toBe(updatedEntity.releaseDate);
        expect(response.language).toBe(updatedEntity.language);
        expect(response.isExplicit).toBe(updatedEntity.isExplicit);
        expect(response.ageRestriction).toBe(updatedEntity.ageRestriction);
        expect(response.playCount).toBe(updatedEntity.playCount);
        expect(response.downloadCount).toBe(updatedEntity.downloadCount);
        expect(response.createdAt).toBe(updatedEntity.createdAt);
        expect(response.updatedAt).toBe(updatedEntity.updatedAt);
      }
    });
  });
});
