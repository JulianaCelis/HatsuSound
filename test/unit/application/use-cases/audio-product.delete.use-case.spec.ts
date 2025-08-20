import { Test, TestingModule } from '@nestjs/testing';
import { DeleteAudioProductUseCase } from '@/application/use-cases/audio-product/delete-audio-product.use-case';
import { IAudioProductRepositoryPort } from '@/domain/ports/output/audio-product.repository.port';
import { AudioProduct } from '@/domain/entities/audio-product.entity';
import { Result, Success, Failure } from '@/domain/ports';
import { AudioProductError } from '@/domain/ports/input/audio-product.port';
import { 
  createMockAudioProduct, 
  createMockAudioProductEntity,
  TEST_DATA,
  ERROR_MESSAGES
} from '../../../audio-product.test.config';

describe('DeleteAudioProductUseCase', () => {
  let useCase: DeleteAudioProductUseCase;
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
        DeleteAudioProductUseCase,
        {
          provide: 'AUDIO_PRODUCT_REPOSITORY',
          useValue: mockRepo,
        },
      ],
    }).compile();

    useCase = module.get<DeleteAudioProductUseCase>(DeleteAudioProductUseCase);
    mockAudioProductRepository = mockRepo as jest.Mocked<IAudioProductRepositoryPort>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should delete an audio product successfully', async () => {
      const productId = 'audio-123';
      const existingProduct = createMockAudioProduct({ id: productId });

      // Mock findById to return existing product
      mockAudioProductRepository.findById.mockResolvedValue(
        new Success(existingProduct)
      );

      // Mock delete to return success
      mockAudioProductRepository.delete.mockResolvedValue(
        new Success(true)
      );

      const result = await useCase.execute(productId);

      expect(result.isSuccess()).toBe(true);
      if (result.isSuccess()) {
        expect(result.value.message).toBe('Audio product deleted successfully');
      }

      expect(mockAudioProductRepository.findById).toHaveBeenCalledWith(productId);
      expect(mockAudioProductRepository.delete).toHaveBeenCalledWith(productId);
    });

    it('should return failure when ID is empty', async () => {
      const result = await useCase.execute('');

      expect(result.isFailure()).toBe(true);
      if (result.isFailure()) {
        expect(result.error.type).toBe('VALIDATION_ERROR');
        expect(result.error.message).toBe('ID is required');
      }

      expect(mockAudioProductRepository.findById).not.toHaveBeenCalled();
      expect(mockAudioProductRepository.delete).not.toHaveBeenCalled();
    });

    it('should return failure when ID is whitespace only', async () => {
      const result = await useCase.execute('   ');

      expect(result.isFailure()).toBe(true);
      if (result.isFailure()) {
        expect(result.error.type).toBe('VALIDATION_ERROR');
        expect(result.error.message).toBe('ID is required');
      }

      expect(mockAudioProductRepository.findById).not.toHaveBeenCalled();
      expect(mockAudioProductRepository.delete).not.toHaveBeenCalled();
    });

    it('should return failure when ID is null', async () => {
      const result = await useCase.execute(null as any);

      expect(result.isFailure()).toBe(true);
      if (result.isFailure()) {
        expect(result.error.type).toBe('VALIDATION_ERROR');
        expect(result.error.message).toBe('ID is required');
      }

      expect(mockAudioProductRepository.findById).not.toHaveBeenCalled();
      expect(mockAudioProductRepository.delete).not.toHaveBeenCalled();
    });

    it('should return failure when ID is undefined', async () => {
      const result = await useCase.execute(undefined as any);

      expect(result.isFailure()).toBe(true);
      if (result.isFailure()) {
        expect(result.error.type).toBe('VALIDATION_ERROR');
        expect(result.error.message).toBe('ID is required');
      }

      expect(mockAudioProductRepository.findById).not.toHaveBeenCalled();
      expect(mockAudioProductRepository.delete).not.toHaveBeenCalled();
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
      expect(mockAudioProductRepository.delete).not.toHaveBeenCalled();
    });

    it('should return failure when findById throws an error', async () => {
      const productId = 'audio-123';
      const findError = new Error('Database connection failed');

      mockAudioProductRepository.findById.mockRejectedValue(findError);

      const result = await useCase.execute(productId);

      expect(result.isFailure()).toBe(true);
      if (result.isFailure()) {
        expect(result.error.type).toBe('VALIDATION_ERROR');
        expect(result.error.message).toBe('Error interno del servidor: Database connection failed');
      }

      expect(mockAudioProductRepository.findById).toHaveBeenCalledWith(productId);
      expect(mockAudioProductRepository.delete).not.toHaveBeenCalled();
    });

    it('should return failure when delete operation fails', async () => {
      const productId = 'audio-123';
      const existingProduct = createMockAudioProduct({ id: productId });

      // Mock findById to return existing product
      mockAudioProductRepository.findById.mockResolvedValue(
        new Success(existingProduct)
      );

      // Mock delete to return failure
      mockAudioProductRepository.delete.mockResolvedValue(
        new Failure({ type: 'VALIDATION_ERROR', message: 'Delete operation failed' })
      );

      const result = await useCase.execute(productId);

      expect(result.isFailure()).toBe(true);
      if (result.isFailure()) {
        expect(result.error.type).toBe('VALIDATION_ERROR');
        expect(result.error.message).toBe('Error deleting audio product');
      }

      expect(mockAudioProductRepository.findById).toHaveBeenCalledWith(productId);
      expect(mockAudioProductRepository.delete).toHaveBeenCalledWith(productId);
    });

    it('should return failure when delete operation throws an error', async () => {
      const productId = 'audio-123';
      const existingProduct = createMockAudioProduct({ id: productId });

      // Mock findById to return existing product
      mockAudioProductRepository.findById.mockResolvedValue(
        new Success(existingProduct)
      );

      // Mock delete to throw error
      const deleteError = new Error('Delete operation failed');
      mockAudioProductRepository.delete.mockRejectedValue(deleteError);

      const result = await useCase.execute(productId);

      expect(result.isFailure()).toBe(true);
      if (result.isFailure()) {
        expect(result.error.type).toBe('VALIDATION_ERROR');
        expect(result.error.message).toBe('Error interno del servidor: Delete operation failed');
      }

      expect(mockAudioProductRepository.findById).toHaveBeenCalledWith(productId);
      expect(mockAudioProductRepository.delete).toHaveBeenCalledWith(productId);
    });

    it('should handle repository returning unexpected error type in findById', async () => {
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
      expect(mockAudioProductRepository.delete).not.toHaveBeenCalled();
    });

    it('should verify product exists before attempting deletion', async () => {
      const productId = 'audio-123';
      const existingProduct = createMockAudioProduct({ id: productId });

      // Mock findById to return existing product
      mockAudioProductRepository.findById.mockResolvedValue(
        new Success(existingProduct)
      );

      // Mock delete to return success
      mockAudioProductRepository.delete.mockResolvedValue(
        new Success(true)
      );

      const result = await useCase.execute(productId);

      expect(result.isSuccess()).toBe(true);
      
      // Verify the order of operations
      expect(mockAudioProductRepository.findById).toHaveBeenCalledWith(productId);
      expect(mockAudioProductRepository.delete).toHaveBeenCalledWith(productId);
      
      // Verify findById was called before delete
      const findByIdCall = mockAudioProductRepository.findById.mock.invocationCallOrder[0];
      const deleteCall = mockAudioProductRepository.delete.mock.invocationCallOrder[0];
      expect(findByIdCall).toBeLessThan(deleteCall);
    });

    it('should return success message with correct format', async () => {
      const productId = 'audio-123';
      const existingProduct = createMockAudioProduct({ id: productId });

      mockAudioProductRepository.findById.mockResolvedValue(
        new Success(existingProduct)
      );

      mockAudioProductRepository.delete.mockResolvedValue(
        new Success(true)
      );

      const result = await useCase.execute(productId);

      expect(result.isSuccess()).toBe(true);
      if (result.isSuccess()) {
        expect(result.value).toHaveProperty('message');
        expect(typeof result.value.message).toBe('string');
        expect(result.value.message).toBe('Audio product deleted successfully');
      }
    });
  });
});
