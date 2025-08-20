import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AudioProductService } from '../src/infrastructure/services/audio-product.service';
import { AudioProductRepository } from '../src/infrastructure/repositories/audio-product.repository';
import { AudioProductEntity } from '../src/infrastructure/database/entities/audio-product.entity';
import { AudioProduct, AudioFormat, AudioGenre, AgeRestriction } from '../src/domain/entities/audio-product.entity';
import { IAudioProductRepositoryPort, AUDIO_PRODUCT_REPOSITORY } from '../src/domain/ports/output/audio-product.repository.port';
import { CreateAudioProductDto, UpdateAudioProductDto, SearchAudioProductsDto } from '../src/infrastructure/dto/audio-product.dto';

// Mock data factories
export const createMockAudioProduct = (overrides: Partial<AudioProduct> = {}): AudioProduct => {
  return new AudioProduct(
    overrides.id || 'audio-123',
    overrides.title || 'Bohemian Rhapsody',
    overrides.description || 'Una de las canciones más icónicas de Queen',
    overrides.artist || 'Queen',
    overrides.genre || AudioGenre.ROCK,
    overrides.audioUrl || 'https://example.com/audio/bohemian-rhapsody.mp3',
    overrides.duration || 354,
    overrides.format || AudioFormat.MP3,
    overrides.bitrate || 320,
    overrides.price || 9.99,
    overrides.stock || 100,
    overrides.isActive ?? true,
    overrides.tags || ['rock', '70s', 'classic'],
    overrides.releaseDate || new Date('1975-10-31'),
    overrides.language || 'en',
    overrides.isExplicit ?? false,
    overrides.ageRestriction || AgeRestriction.ALL_AGES,
    overrides.playCount || 0,
    overrides.downloadCount || 0,
    overrides.createdAt || new Date('2024-01-01T00:00:00Z'),
    overrides.updatedAt || new Date('2024-01-01T00:00:00Z')
  );
};

export const createMockAudioProductEntity = (overrides: Partial<AudioProductEntity> = {}): AudioProductEntity => {
  const entity = new AudioProductEntity();
  entity.id = overrides.id || 'audio-123';
  entity.title = overrides.title || 'Bohemian Rhapsody';
  entity.description = overrides.description || 'Una de las canciones más icónicas de Queen';
  entity.artist = overrides.artist || 'Queen';
  entity.genre = overrides.genre || AudioGenre.ROCK;
  entity.audioUrl = overrides.audioUrl || 'https://example.com/audio/bohemian-rhapsody.mp3';
  entity.duration = overrides.duration || 354;
  entity.format = overrides.format || AudioFormat.MP3;
  entity.bitrate = overrides.bitrate || 320;
  entity.price = overrides.price || 9.99;
  entity.stock = overrides.stock || 100;
  entity.isActive = overrides.isActive ?? true;
  entity.tags = overrides.tags || ['rock', '70s', 'classic'];
  entity.releaseDate = overrides.releaseDate || new Date('1975-10-31');
  entity.language = overrides.language || 'en';
  entity.isExplicit = overrides.isExplicit ?? false;
  entity.ageRestriction = overrides.ageRestriction || AgeRestriction.ALL_AGES;
  entity.playCount = overrides.playCount || 0;
  entity.downloadCount = overrides.downloadCount || 0;
  entity.createdAt = overrides.createdAt || new Date('2024-01-01T00:00:00Z');
  entity.updatedAt = overrides.updatedAt || new Date('2024-01-01T00:00:00Z');
  return entity;
};

export const createMockCreateAudioProductDto = (overrides: Partial<CreateAudioProductDto> = {}): CreateAudioProductDto => {
  return {
    title: overrides.title || 'Bohemian Rhapsody',
    description: overrides.description || 'Una de las canciones más icónicas de Queen',
    artist: overrides.artist || 'Queen',
    genre: overrides.genre || AudioGenre.ROCK,
    audioUrl: overrides.audioUrl || 'https://example.com/audio/bohemian-rhapsody.mp3',
    duration: overrides.duration || 354,
    format: overrides.format || AudioFormat.MP3,
    bitrate: overrides.bitrate || 320,
    price: overrides.price || 9.99,
    stock: overrides.stock || 100,
    tags: overrides.tags || ['rock', '70s', 'classic'],
    releaseDate: overrides.releaseDate || new Date('1975-10-31'),
    language: overrides.language || 'en',
    isExplicit: overrides.isExplicit ?? false,
    ageRestriction: overrides.ageRestriction || AgeRestriction.ALL_AGES,
  };
};

export const createMockUpdateAudioProductDto = (overrides: Partial<UpdateAudioProductDto> = {}): UpdateAudioProductDto => {
  return {
    title: overrides.title || 'Updated Title',
    description: overrides.description || 'Updated description',
    price: overrides.price || 12.99,
    ...overrides,
  };
};

export const createMockSearchAudioProductsDto = (overrides: Partial<SearchAudioProductsDto> = {}): SearchAudioProductsDto => {
  return {
    query: overrides.query || 'rock',
    genre: overrides.genre || AudioGenre.ROCK,
    artist: overrides.artist || 'Queen',
    minPrice: overrides.minPrice || 5.00,
    maxPrice: overrides.maxPrice || 15.00,
    isActive: overrides.isActive ?? true,
    page: overrides.page || 1,
    limit: overrides.limit || 10,
    sortBy: overrides.sortBy || 'title',
    sortOrder: overrides.sortOrder || 'asc',
  };
};

// Mock repository factory
export const createMockAudioProductRepository = () => ({
  create: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  search: jest.fn(),
  findAll: jest.fn(),
});

// Mock TypeORM repository factory
export const createMockTypeOrmRepository = () => ({
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
} as any);

// Test module factory for AudioProductService
export const createAudioProductServiceTestModule = async (): Promise<{
  module: TestingModule;
  service: AudioProductService;
  mockAudioProductRepository: jest.Mocked<IAudioProductRepositoryPort>;
}> => {
  const mockAudioProductRepository = createMockAudioProductRepository();

  const module: TestingModule = await Test.createTestingModule({
    providers: [
      AudioProductService,
      {
        provide: AUDIO_PRODUCT_REPOSITORY,
        useValue: mockAudioProductRepository,
      },
    ],
  }).compile();

  const service = module.get<AudioProductService>(AudioProductService);

  return { module, service, mockAudioProductRepository };
};

// Test module factory for AudioProductRepository
export const createAudioProductRepositoryTestModule = async (): Promise<{
  module: TestingModule;
  repository: AudioProductRepository;
  mockTypeOrmRepository: jest.Mocked<Repository<AudioProductEntity>>;
}> => {
  const mockTypeOrmRepository = createMockTypeOrmRepository();

  const module: TestingModule = await Test.createTestingModule({
    providers: [
      AudioProductRepository,
      {
        provide: getRepositoryToken(AudioProductEntity),
        useValue: mockTypeOrmRepository,
      },
    ],
  }).compile();

  const repository = module.get<AudioProductRepository>(AudioProductRepository);

  return { module, repository, mockTypeOrmRepository };
};

// Validation helpers
export const validateAudioProductResponse = (audioProduct: any, expectedAudioProduct: AudioProduct) => {
  expect(audioProduct).toBeDefined();
  expect(audioProduct.id).toBe(expectedAudioProduct.id);
  expect(audioProduct.title).toBe(expectedAudioProduct.title);
  expect(audioProduct.description).toBe(expectedAudioProduct.description);
  expect(audioProduct.artist).toBe(expectedAudioProduct.artist);
  expect(audioProduct.genre).toBe(expectedAudioProduct.genre);
  expect(audioProduct.audioUrl).toBe(expectedAudioProduct.audioUrl);
  expect(audioProduct.duration).toBe(expectedAudioProduct.duration);
  expect(audioProduct.format).toBe(expectedAudioProduct.format);
  expect(audioProduct.bitrate).toBe(expectedAudioProduct.bitrate);
  expect(audioProduct.price).toBe(expectedAudioProduct.price);
  expect(audioProduct.stock).toBe(expectedAudioProduct.stock);
  expect(audioProduct.isActive).toBe(expectedAudioProduct.isActive);
  expect(audioProduct.tags).toEqual(expectedAudioProduct.tags);
  expect(audioProduct.releaseDate).toEqual(expectedAudioProduct.releaseDate);
  expect(audioProduct.language).toBe(expectedAudioProduct.language);
  expect(audioProduct.isExplicit).toBe(expectedAudioProduct.isExplicit);
  expect(audioProduct.ageRestriction).toBe(expectedAudioProduct.ageRestriction);
  expect(audioProduct.playCount).toBe(expectedAudioProduct.playCount);
  expect(audioProduct.downloadCount).toBe(expectedAudioProduct.downloadCount);
  expect(audioProduct.createdAt).toEqual(expectedAudioProduct.createdAt);
  expect(audioProduct.updatedAt).toEqual(expectedAudioProduct.updatedAt);
};

// Test data constants
export const TEST_DATA = {
  VALID_TITLE: 'Bohemian Rhapsody',
  VALID_DESCRIPTION: 'Una de las canciones más icónicas de Queen',
  VALID_ARTIST: 'Queen',
  VALID_GENRE: AudioGenre.ROCK,
  VALID_AUDIO_URL: 'https://example.com/audio/bohemian-rhapsody.mp3',
  VALID_DURATION: 354,
  VALID_FORMAT: AudioFormat.MP3,
  VALID_BITRATE: 320,
  VALID_PRICE: 9.99,
  VALID_STOCK: 100,
  VALID_TAGS: ['rock', '70s', 'classic'],
  VALID_RELEASE_DATE: new Date('1975-10-31'),
  VALID_LANGUAGE: 'en',
  INVALID_TITLE: '',
  INVALID_DURATION: 0,
  INVALID_BITRATE: 32,
  INVALID_PRICE: -1,
  INVALID_STOCK: -5,
  NONEXISTENT_ID: 'nonexistent-id',
} as const;

// Error messages constants
export const ERROR_MESSAGES = {
  PRODUCT_NOT_FOUND: 'Audio product not found',
  VALIDATION_ERROR: 'Error creating audio product',
  INSUFFICIENT_STOCK: 'Stock insuficiente',
  INVALID_DURATION: 'La duración debe ser mayor a 0',
  INVALID_BITRATE: 'El bitrate debe ser al menos 64 kbps',
  INVALID_PRICE: 'El precio debe ser mayor o igual a 0',
  INVALID_STOCK: 'El stock debe ser mayor o igual a 0',
  TITLE_REQUIRED: 'El título es requerido',
  ARTIST_REQUIRED: 'El artista es requerido',
  GENRE_REQUIRED: 'El género es requerido',
  AUDIO_URL_REQUIRED: 'La URL del audio es requerida',
} as const;

// Setup and teardown helpers
export const setupTestEnvironment = () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
};

// Common test scenarios
export const COMMON_TEST_SCENARIOS = {
  VALID_AUDIO_PRODUCT_CREATION: {
    title: TEST_DATA.VALID_TITLE,
    description: TEST_DATA.VALID_DESCRIPTION,
    artist: TEST_DATA.VALID_ARTIST,
    genre: TEST_DATA.VALID_GENRE,
    audioUrl: TEST_DATA.VALID_AUDIO_URL,
    duration: TEST_DATA.VALID_DURATION,
    format: TEST_DATA.VALID_FORMAT,
    bitrate: TEST_DATA.VALID_BITRATE,
    price: TEST_DATA.VALID_PRICE,
    stock: TEST_DATA.VALID_STOCK,
    tags: TEST_DATA.VALID_TAGS,
    releaseDate: TEST_DATA.VALID_RELEASE_DATE,
    language: TEST_DATA.VALID_LANGUAGE,
  },
  VALID_SEARCH: {
    query: 'rock',
    genre: AudioGenre.ROCK,
    minPrice: 5.00,
    maxPrice: 15.00,
  },
} as const;

// Export everything
export default {
  createMockAudioProduct,
  createMockAudioProductEntity,
  createMockCreateAudioProductDto,
  createMockUpdateAudioProductDto,
  createMockSearchAudioProductsDto,
  createMockAudioProductRepository,
  createMockTypeOrmRepository,
  createAudioProductServiceTestModule,
  createAudioProductRepositoryTestModule,
  validateAudioProductResponse,
  TEST_DATA,
  ERROR_MESSAGES,
  setupTestEnvironment,
  COMMON_TEST_SCENARIOS,
};
