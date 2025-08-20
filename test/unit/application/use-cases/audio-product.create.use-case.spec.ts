import { Test, TestingModule } from '@nestjs/testing';
import { CreateAudioProductUseCase } from '@/application/use-cases/audio-product/create-audio-product.use-case';
import { IAudioProductRepositoryPort } from '@/domain/ports/output/audio-product.repository.port';
import { AudioProduct, AudioFormat, AudioGenre, AgeRestriction } from '@/domain/entities/audio-product.entity';
import { CreateAudioProductRequest, AudioProductResponse } from '@/domain/ports/input/audio-product.port';
import { Result, Success, Failure } from '@/domain/ports';
import { AudioProductError } from '@/domain/ports/input/audio-product.port';
import { 
  createMockAudioProduct, 
  createMockCreateAudioProductDto,
  createMockAudioProductEntity,
  validateAudioProductResponse,
  TEST_DATA,
  ERROR_MESSAGES
} from '../../../audio-product.test.config';

describe('CreateAudioProductUseCase', () => {
  let useCase: CreateAudioProductUseCase;
  let mockAudioProductRepository: jest.Mocked<IAudioProductRepositoryPort>;

  const mockAudioProduct = createMockAudioProduct();
  const mockCreateDto = createMockCreateAudioProductDto();

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
        CreateAudioProductUseCase,
        {
          provide: 'AUDIO_PRODUCT_REPOSITORY',
          useValue: mockRepo,
        },
      ],
    }).compile();

    useCase = module.get<CreateAudioProductUseCase>(CreateAudioProductUseCase);
    mockAudioProductRepository = mockRepo as jest.Mocked<IAudioProductRepositoryPort>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
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

      const expectedAudioProduct = createMockAudioProduct({
        id: 'new-audio-123',
        title: createRequest.title,
        description: createRequest.description,
        artist: createRequest.artist,
        genre: createRequest.genre,
        audioUrl: createRequest.audioUrl,
        duration: createRequest.duration,
        format: createRequest.format,
        bitrate: createRequest.bitrate,
        price: createRequest.price,
        stock: createRequest.stock,
        tags: createRequest.tags,
        releaseDate: createRequest.releaseDate,
        language: createRequest.language,
        isExplicit: createRequest.isExplicit,
        ageRestriction: createRequest.ageRestriction,
      });

      mockAudioProductRepository.create.mockResolvedValue(
        new Success(expectedAudioProduct)
      );

      const result = await useCase.execute(createRequest);

      expect(result.isSuccess()).toBe(true);
      if (result.isSuccess()) {
        const createdProduct = result.value;
        validateAudioProductResponse(createdProduct, expectedAudioProduct);
      }

      expect(mockAudioProductRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          title: createRequest.title,
          description: createRequest.description,
          artist: createRequest.artist,
          genre: createRequest.genre,
          audioUrl: createRequest.audioUrl,
          duration: createRequest.duration,
          format: createRequest.format,
          bitrate: createRequest.bitrate,
          price: createRequest.price,
          stock: createRequest.stock,
          tags: createRequest.tags,
          releaseDate: createRequest.releaseDate,
          language: createRequest.language,
          isExplicit: createRequest.isExplicit,
          ageRestriction: createRequest.ageRestriction,
        })
      );
    });

    it('should create audio product with default values', async () => {
      const createRequest: CreateAudioProductRequest = {
        title: 'Song with Defaults',
        description: 'A song with default values',
        artist: 'Default Artist',
        genre: AudioGenre.POP,
        audioUrl: 'https://example.com/audio/default.mp3',
        duration: 180,
        format: AudioFormat.MP3,
        bitrate: 128,
        price: 5.99,
        stock: 100,
        tags: ['pop', 'default'],
        releaseDate: new Date('2024-01-01'),
        language: 'en',
        // isExplicit and ageRestriction are optional
      };

      const expectedAudioProduct = createMockAudioProduct({
        id: 'default-123',
        title: 'Song with Defaults',
        description: 'A song with default values',
        artist: 'Default Artist',
        genre: AudioGenre.POP,
        audioUrl: 'https://example.com/audio/default.mp3',
        duration: 180,
        format: AudioFormat.MP3,
        bitrate: 128,
        price: 5.99,
        stock: 100,
        tags: ['pop', 'default'],
        releaseDate: new Date('2024-01-01'),
        language: 'en',
        isExplicit: false, // Default value
        ageRestriction: AgeRestriction.ALL_AGES, // Default value
      });

      mockAudioProductRepository.create.mockResolvedValue(
        new Success(expectedAudioProduct)
      );

      const result = await useCase.execute(createRequest);

      expect(result.isSuccess()).toBe(true);
      if (result.isSuccess()) {
        const createdProduct = result.value;
        expect(createdProduct.isExplicit).toBe(false);
        expect(createdProduct.ageRestriction).toBe(AgeRestriction.ALL_AGES);
      }
    });

    it('should create audio product with custom explicit and age restriction', async () => {
      const createRequest: CreateAudioProductRequest = {
        title: 'Explicit Song',
        description: 'A song with explicit content',
        artist: 'Explicit Artist',
        genre: AudioGenre.HIP_HOP,
        audioUrl: 'https://example.com/audio/explicit.mp3',
        duration: 240,
        format: AudioFormat.MP3,
        bitrate: 320,
        price: 7.99,
        stock: 75,
        tags: ['hip-hop', 'explicit'],
        releaseDate: new Date('2024-01-01'),
        language: 'en',
        isExplicit: true,
        ageRestriction: AgeRestriction.ADULT,
      };

      const expectedAudioProduct = createMockAudioProduct({
        id: 'explicit-123',
        title: 'Explicit Song',
        description: 'A song with explicit content',
        artist: 'Explicit Artist',
        genre: AudioGenre.HIP_HOP,
        audioUrl: 'https://example.com/audio/explicit.mp3',
        duration: 240,
        format: AudioFormat.MP3,
        bitrate: 320,
        price: 7.99,
        stock: 75,
        tags: ['hip-hop', 'explicit'],
        releaseDate: new Date('2024-01-01'),
        language: 'en',
        isExplicit: true,
        ageRestriction: AgeRestriction.ADULT,
      });

      mockAudioProductRepository.create.mockResolvedValue(
        new Success(expectedAudioProduct)
      );

      const result = await useCase.execute(createRequest);

      expect(result.isSuccess()).toBe(true);
      if (result.isSuccess()) {
        const createdProduct = result.value;
        expect(createdProduct.isExplicit).toBe(true);
        expect(createdProduct.ageRestriction).toBe(AgeRestriction.ADULT);
      }
    });

    it('should handle repository creation failure', async () => {
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

      const error: AudioProductError = {
        type: 'VALIDATION_ERROR',
        message: 'Repository creation failed'
      };

      mockAudioProductRepository.create.mockResolvedValue(
        new Failure(error)
      );

      const result = await useCase.execute(createRequest);

      expect(result.isSuccess()).toBe(false);
      if (!result.isSuccess()) {
        expect(result.error.type).toBe('VALIDATION_ERROR');
        expect(result.error.message).toBe('Error creating audio product');
      }
    });

    it('should handle repository errors during creation', async () => {
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

      mockAudioProductRepository.create.mockRejectedValue(new Error('Database error'));

      const result = await useCase.execute(createRequest);

      expect(result.isSuccess()).toBe(false);
      if (!result.isSuccess()) {
        expect(result.error.type).toBe('VALIDATION_ERROR');
        expect(result.error.message).toBe('Error interno del servidor: Database error');
      }
    });

    it('should create audio product with different genres and formats', async () => {
      const createRequest: CreateAudioProductRequest = {
        title: 'Jazz Song',
        description: 'A classic jazz piece',
        artist: 'Jazz Artist',
        genre: AudioGenre.JAZZ,
        audioUrl: 'https://example.com/audio/jazz.wav',
        duration: 324,
        format: AudioFormat.WAV,
        bitrate: 1411,
        price: 12.99,
        stock: 50,
        tags: ['jazz', 'classic'],
        releaseDate: new Date('2024-01-01'),
        language: 'en',
        isExplicit: false,
        ageRestriction: AgeRestriction.ALL_AGES,
      };

      const expectedAudioProduct = createMockAudioProduct({
        id: 'jazz-123',
        title: 'Jazz Song',
        description: 'A classic jazz piece',
        artist: 'Jazz Artist',
        genre: AudioGenre.JAZZ,
        audioUrl: 'https://example.com/audio/jazz.wav',
        duration: 324,
        format: AudioFormat.WAV,
        bitrate: 1411,
        price: 12.99,
        stock: 50,
        tags: ['jazz', 'classic'],
        releaseDate: new Date('2024-01-01'),
        language: 'en',
        isExplicit: false,
        ageRestriction: AgeRestriction.ALL_AGES,
      });

      mockAudioProductRepository.create.mockResolvedValue(
        new Success(expectedAudioProduct)
      );

      const result = await useCase.execute(createRequest);

      expect(result.isSuccess()).toBe(true);
      if (result.isSuccess()) {
        const createdProduct = result.value;
        expect(createdProduct.genre).toBe(AudioGenre.JAZZ);
        expect(createdProduct.format).toBe(AudioFormat.WAV);
        expect(createdProduct.bitrate).toBe(1411);
      }
    });

    it('should create audio product with Spanish language', async () => {
      const createRequest: CreateAudioProductRequest = {
        title: 'Canción en Español',
        description: 'Una canción en español',
        artist: 'Artista Español',
        genre: AudioGenre.POP,
        audioUrl: 'https://example.com/audio/espanol.mp3',
        duration: 200,
        format: AudioFormat.MP3,
        bitrate: 256,
        price: 6.99,
        stock: 150,
        tags: ['pop', 'español'],
        releaseDate: new Date('2024-01-01'),
        language: 'es',
        isExplicit: false,
        ageRestriction: AgeRestriction.ALL_AGES,
      };

      const expectedAudioProduct = createMockAudioProduct({
        id: 'espanol-123',
        title: 'Canción en Español',
        description: 'Una canción en español',
        artist: 'Artista Español',
        genre: AudioGenre.POP,
        audioUrl: 'https://example.com/audio/espanol.mp3',
        duration: 200,
        format: AudioFormat.MP3,
        bitrate: 256,
        price: 6.99,
        stock: 150,
        tags: ['pop', 'español'],
        releaseDate: new Date('2024-01-01'),
        language: 'es',
        isExplicit: false,
        ageRestriction: AgeRestriction.ALL_AGES,
      });

      mockAudioProductRepository.create.mockResolvedValue(
        new Success(expectedAudioProduct)
      );

      const result = await useCase.execute(createRequest);

      expect(result.isSuccess()).toBe(true);
      if (result.isSuccess()) {
        const createdProduct = result.value;
        expect(createdProduct.language).toBe('es');
        expect(createdProduct.title).toBe('Canción en Español');
      }
    });

    it('should create audio product with mature content', async () => {
      const createRequest: CreateAudioProductRequest = {
        title: 'Mature Content Song',
        description: 'A song with mature content',
        artist: 'Mature Artist',
        genre: AudioGenre.ROCK,
        audioUrl: 'https://example.com/audio/mature.mp3',
        duration: 300,
        format: AudioFormat.MP3,
        bitrate: 320,
        price: 15.99,
        stock: 25,
        tags: ['rock', 'mature'],
        releaseDate: new Date('2024-01-01'),
        language: 'en',
        isExplicit: true,
        ageRestriction: AgeRestriction.MATURE,
      };

      const expectedAudioProduct = createMockAudioProduct({
        id: 'mature-123',
        title: 'Mature Content Song',
        description: 'A song with mature content',
        artist: 'Mature Artist',
        genre: AudioGenre.ROCK,
        audioUrl: 'https://example.com/audio/mature.mp3',
        duration: 300,
        format: AudioFormat.MP3,
        bitrate: 320,
        price: 15.99,
        stock: 25,
        tags: ['rock', 'mature'],
        releaseDate: new Date('2024-01-01'),
        language: 'en',
        isExplicit: true,
        ageRestriction: AgeRestriction.MATURE,
      });

      mockAudioProductRepository.create.mockResolvedValue(
        new Success(expectedAudioProduct)
      );

      const result = await useCase.execute(createRequest);

      expect(result.isSuccess()).toBe(true);
      if (result.isSuccess()) {
        const createdProduct = result.value;
        expect(createdProduct.isExplicit).toBe(true);
        expect(createdProduct.ageRestriction).toBe(AgeRestriction.MATURE);
        expect(createdProduct.ageRestriction).toBe(21);
      }
    });

    it('should handle edge case with very long title and description', async () => {
      const longTitle = 'A'.repeat(255);
      const longDescription = 'B'.repeat(1000);

      const createRequest: CreateAudioProductRequest = {
        title: longTitle,
        description: longDescription,
        artist: 'Long Content Artist',
        genre: AudioGenre.ELECTRONIC,
        audioUrl: 'https://example.com/audio/long.mp3',
        duration: 600,
        format: AudioFormat.FLAC,
        bitrate: 1411,
        price: 19.99,
        stock: 100,
        tags: ['electronic', 'long'],
        releaseDate: new Date('2024-01-01'),
        language: 'en',
        isExplicit: false,
        ageRestriction: AgeRestriction.ALL_AGES,
      };

      const expectedAudioProduct = createMockAudioProduct({
        id: 'long-123',
        title: longTitle,
        description: longDescription,
        artist: 'Long Content Artist',
        genre: AudioGenre.ELECTRONIC,
        audioUrl: 'https://example.com/audio/long.mp3',
        duration: 600,
        format: AudioFormat.FLAC,
        bitrate: 1411,
        price: 19.99,
        stock: 100,
        tags: ['electronic', 'long'],
        releaseDate: new Date('2024-01-01'),
        language: 'en',
        isExplicit: false,
        ageRestriction: AgeRestriction.ALL_AGES,
      });

      mockAudioProductRepository.create.mockResolvedValue(
        new Success(expectedAudioProduct)
      );

      const result = await useCase.execute(createRequest);

      expect(result.isSuccess()).toBe(true);
      if (result.isSuccess()) {
        const createdProduct = result.value;
        expect(createdProduct.title).toBe(longTitle);
        expect(createdProduct.description).toBe(longDescription);
        expect(createdProduct.duration).toBe(600);
        expect(createdProduct.format).toBe(AudioFormat.FLAC);
      }
    });

    it('should handle edge case with extreme values', async () => {
      const createRequest: CreateAudioProductRequest = {
        title: 'Extreme Values Song',
        description: 'A song with extreme values',
        artist: 'Extreme Artist',
        genre: AudioGenre.CLASSICAL,
        audioUrl: 'https://example.com/audio/extreme.flac',
        duration: 7200, // 2 hours
        format: AudioFormat.FLAC,
        bitrate: 1411,
        price: 999.99,
        stock: 1,
        tags: ['classical', 'extreme'],
        releaseDate: new Date('2024-01-01'),
        language: 'en',
        isExplicit: false,
        ageRestriction: AgeRestriction.ALL_AGES,
      };

      const expectedAudioProduct = createMockAudioProduct({
        id: 'extreme-123',
        title: 'Extreme Values Song',
        description: 'A song with extreme values',
        artist: 'Extreme Artist',
        genre: AudioGenre.CLASSICAL,
        audioUrl: 'https://example.com/audio/extreme.flac',
        duration: 7200,
        format: AudioFormat.FLAC,
        bitrate: 1411,
        price: 999.99,
        stock: 1,
        tags: ['classical', 'extreme'],
        releaseDate: new Date('2024-01-01'),
        language: 'en',
        isExplicit: false,
        ageRestriction: AgeRestriction.ALL_AGES,
      });

      mockAudioProductRepository.create.mockResolvedValue(
        new Success(expectedAudioProduct)
      );

      const result = await useCase.execute(createRequest);

      expect(result.isSuccess()).toBe(true);
      if (result.isSuccess()) {
        const createdProduct = result.value;
        expect(createdProduct.duration).toBe(7200);
        expect(createdProduct.price).toBe(999.99);
        expect(createdProduct.stock).toBe(1);
        // Note: durationFormatted and priceFormatted are computed properties of the domain entity
        // AudioProductResponse only contains the raw values
        expect(createdProduct.duration).toBe(7200);
        expect(createdProduct.price).toBe(999.99);
      }
    });
  });

  describe('Error handling', () => {
    it('should handle repository errors with different error types', async () => {
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

      const differentError = new Error('Different database error');
      mockAudioProductRepository.create.mockRejectedValue(differentError);

      const result = await useCase.execute(createRequest);

      expect(result.isSuccess()).toBe(false);
      if (!result.isSuccess()) {
        expect(result.error.type).toBe('VALIDATION_ERROR');
        expect(result.error.message).toBe('Error interno del servidor: Different database error');
      }
    });

    it('should handle repository errors with null/undefined values', async () => {
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

      mockAudioProductRepository.create.mockRejectedValue(null);

      const result = await useCase.execute(createRequest);

      expect(result.isSuccess()).toBe(false);
      if (!result.isSuccess()) {
        expect(result.error.type).toBe('VALIDATION_ERROR');
        expect(result.error.message).toBe('Error interno del servidor: null');
      }
    });
  });

  describe('Integration scenarios', () => {
    it('should handle complete audio product creation workflow', async () => {
      const createRequest: CreateAudioProductRequest = {
        title: 'Workflow Song',
        description: 'A song to test the complete workflow',
        artist: 'Workflow Artist',
        genre: AudioGenre.FOLK,
        audioUrl: 'https://example.com/audio/workflow.mp3',
        duration: 240,
        format: AudioFormat.MP3,
        bitrate: 192,
        price: 8.99,
        stock: 200,
        tags: ['folk', 'workflow'],
        releaseDate: new Date('2024-01-01'),
        language: 'en',
        isExplicit: false,
        ageRestriction: AgeRestriction.ALL_AGES,
      };

      const expectedAudioProduct = createMockAudioProduct({
        id: 'workflow-123',
        title: 'Workflow Song',
        description: 'A song to test the complete workflow',
        artist: 'Workflow Artist',
        genre: AudioGenre.FOLK,
        audioUrl: 'https://example.com/audio/workflow.mp3',
        duration: 240,
        format: AudioFormat.MP3,
        bitrate: 192,
        price: 8.99,
        stock: 200,
        tags: ['folk', 'workflow'],
        releaseDate: new Date('2024-01-01'),
        language: 'en',
        isExplicit: false,
        ageRestriction: AgeRestriction.ALL_AGES,
      });

      mockAudioProductRepository.create.mockResolvedValue(
        new Success(expectedAudioProduct)
      );

      const result = await useCase.execute(createRequest);

      expect(result.isSuccess()).toBe(true);
      if (result.isSuccess()) {
        const createdProduct = result.value;
        
        // Validate all properties
        expect(createdProduct.title).toBe('Workflow Song');
        expect(createdProduct.description).toBe('A song to test the complete workflow');
        expect(createdProduct.artist).toBe('Workflow Artist');
        expect(createdProduct.genre).toBe(AudioGenre.FOLK);
        expect(createdProduct.audioUrl).toBe('https://example.com/audio/workflow.mp3');
        expect(createdProduct.duration).toBe(240);
        expect(createdProduct.format).toBe(AudioFormat.MP3);
        expect(createdProduct.bitrate).toBe(192);
        expect(createdProduct.price).toBe(8.99);
        expect(createdProduct.stock).toBe(200);
        expect(createdProduct.tags).toEqual(['folk', 'workflow']);
        expect(createdProduct.releaseDate).toEqual(new Date('2024-01-01'));
        expect(createdProduct.language).toBe('en');
        expect(createdProduct.isExplicit).toBe(false);
        expect(createdProduct.ageRestriction).toBe(AgeRestriction.ALL_AGES);

        // Note: These computed properties and methods are part of the domain entity
        // AudioProductResponse only contains the raw values
        // To test these, we would need to work with the domain entity directly
      }

      // Validate repository call
      expect(mockAudioProductRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Workflow Song',
          description: 'A song to test the complete workflow',
          artist: 'Workflow Artist',
          genre: AudioGenre.FOLK,
          audioUrl: 'https://example.com/audio/workflow.mp3',
          duration: 240,
          format: AudioFormat.MP3,
          bitrate: 192,
          price: 8.99,
          stock: 200,
          tags: ['folk', 'workflow'],
          releaseDate: new Date('2024-01-01'),
          language: 'en',
          isExplicit: false,
          ageRestriction: AgeRestriction.ALL_AGES,
        })
      );
    });
  });
});
