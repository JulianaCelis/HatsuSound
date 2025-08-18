import { AudioProduct } from '../../entities/audio-product.entity';
import { Result, Success, Failure } from '@/domain/ports';

// Tipos de request/response
export interface CreateAudioProductRequest {
  title: string;
  description: string;
  artist: string;
  genre: string;
  audioUrl: string;
  duration: number;
  format: string;
  bitrate: number;
  price: number;
  stock: number;
  tags: string[];
  releaseDate: Date;
  language: string;
  isExplicit?: boolean;
  ageRestriction?: number;
}

export interface UpdateAudioProductRequest {
  title?: string;
  description?: string;
  artist?: string;
  genre?: string;
  audioUrl?: string;
  duration?: number;
  format?: string;
  bitrate?: number;
  price?: number;
  stock?: number;
  tags?: string[];
  releaseDate?: Date;
  language?: string;
  isExplicit?: boolean;
  ageRestriction?: number;
  isActive?: boolean;
}

export interface AudioProductResponse {
  id: string;
  title: string;
  description: string;
  artist: string;
  genre: string;
  audioUrl: string;
  duration: number;
  format: string;
  bitrate: number;
  price: number;
  stock: number;
  isActive: boolean;
  tags: string[];
  releaseDate: Date;
  language: string;
  isExplicit: boolean;
  ageRestriction: number;
  playCount: number;
  downloadCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface AudioProductListResponse {
  products: AudioProductResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SearchAudioProductsRequest {
  query?: string;
  genre?: string;
  artist?: string;
  minPrice?: number;
  maxPrice?: number;
  isActive?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'title' | 'artist' | 'price' | 'releaseDate' | 'playCount';
  sortOrder?: 'asc' | 'desc';
}

// Errores específicos de productos de audio
export type AudioProductError = 
  | { type: 'VALIDATION_ERROR'; message: string }
  | { type: 'PRODUCT_NOT_FOUND'; message: string }
  | { type: 'INSUFFICIENT_STOCK'; message: string }
  | { type: 'INVALID_AUDIO_FORMAT'; message: string }
  | { type: 'INVALID_AUDIO_URL'; message: string }
  | { type: 'PRICE_INVALID'; message: string }
  | { type: 'DUPLICATE_PRODUCT'; message: string }
  | { type: 'INSUFFICIENT_PERMISSIONS'; message: string };

// Puertos de entrada (Input Ports)
export interface IAudioProductInputPort {
  createProduct(request: CreateAudioProductRequest): Promise<Result<AudioProductResponse, AudioProductError>>;
  getProductById(id: string): Promise<Result<AudioProductResponse, AudioProductError>>;
  updateProduct(id: string, request: UpdateAudioProductRequest): Promise<Result<AudioProductResponse, AudioProductError>>;
  deleteProduct(id: string): Promise<Result<{ message: string }, AudioProductError>>;
  listProducts(request: SearchAudioProductsRequest): Promise<Result<AudioProductListResponse, AudioProductError>>;
  searchProducts(request: SearchAudioProductsRequest): Promise<Result<AudioProductListResponse, AudioProductError>>;
  
  // Gestión de stock
  updateStock(id: string, quantity: number, operation: 'increase' | 'decrease'): Promise<Result<AudioProductResponse, AudioProductError>>;
  
  // Analytics
  incrementPlayCount(id: string): Promise<Result<AudioProductResponse, AudioProductError>>;
  incrementDownloadCount(id: string): Promise<Result<AudioProductResponse, AudioProductError>>;
  
  // Gestión de estado
  activateProduct(id: string): Promise<Result<AudioProductResponse, AudioProductError>>;
  deactivateProduct(id: string): Promise<Result<AudioProductResponse, AudioProductError>>;
}
