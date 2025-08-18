import { AudioProduct } from '../../../infrastructure/database/entities/audio-product.entity';
import { Result, Success, Failure } from '../input/auth.port';
import { AudioProductError } from '../input/audio-product.port';

export interface IAudioProductRepositoryPort {
  // Operaciones CRUD básicas
  create(product: any): Promise<Result<AudioProduct, AudioProductError>>;
  findById(id: string): Promise<Result<AudioProduct, AudioProductError>>;
  update(id: string, productData: Partial<AudioProduct>): Promise<Result<AudioProduct, AudioProductError>>;
  delete(id: string): Promise<Result<boolean, AudioProductError>>;
  
  // Búsquedas
  findAll(request: any): Promise<Result<{ products: AudioProduct[]; total: number; page: number; limit: number; totalPages: number }, AudioProductError>>;
  findByGenre(genre: string): Promise<Result<AudioProduct[], AudioProductError>>;
  findByArtist(artist: string): Promise<Result<AudioProduct[], AudioProductError>>;
  findByTags(tags: string[]): Promise<Result<AudioProduct[], AudioProductError>>;
  
  // Búsquedas avanzadas
  search(request: any): Promise<Result<{ products: AudioProduct[]; total: number; page: number; limit: number; totalPages: number }, AudioProductError>>;
  findByPriceRange(minPrice: number, maxPrice: number): Promise<Result<AudioProduct[], AudioProductError>>;
  findByActiveStatus(isActive: boolean): Promise<Result<AudioProduct[], AudioProductError>>;
  
  // Paginación
  findWithPagination(page: number, limit: number): Promise<Result<{ products: AudioProduct[]; total: number }, AudioProductError>>;
  
  // Verificaciones
  existsByTitle(title: string, artist: string): Promise<Result<boolean, AudioProductError>>;
  existsByAudioUrl(audioUrl: string): Promise<Result<boolean, AudioProductError>>;
  
  // Operaciones de stock
  updateStock(id: string, quantity: number, operation: 'increase' | 'decrease'): Promise<Result<AudioProduct, AudioProductError>>;
  
  // Analytics
  incrementPlayCount(id: string): Promise<Result<AudioProduct, AudioProductError>>;
  incrementDownloadCount(id: string): Promise<Result<AudioProduct, AudioProductError>>;
  
  // Estadísticas
  getProductStats(): Promise<Result<{
    totalProducts: number;
    activeProducts: number;
    totalStock: number;
    averagePrice: number;
    topGenres: { genre: string; count: number }[];
  }, AudioProductError>>;
}

// Token de inyección
export const AUDIO_PRODUCT_REPOSITORY = 'AUDIO_PRODUCT_REPOSITORY';
