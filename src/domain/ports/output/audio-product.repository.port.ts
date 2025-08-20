import { AudioProduct } from '../../entities/audio-product.entity';
import { AudioProductError } from '../input/audio-product.port';
import { Result } from '../input/auth.port';
import { CreateAudioProductRequest, UpdateAudioProductRequest, SearchAudioProductsRequest } from '../input/audio-product.port';

export const AUDIO_PRODUCT_REPOSITORY = 'AUDIO_PRODUCT_REPOSITORY';

export interface IAudioProductRepositoryPort {
  create(audioProductData: CreateAudioProductRequest): Promise<Result<AudioProduct, AudioProductError>>;
  findById(id: string): Promise<Result<AudioProduct, AudioProductError>>;
  update(id: string, audioProductData: UpdateAudioProductRequest): Promise<Result<AudioProduct, AudioProductError>>;
  delete(id: string): Promise<Result<boolean, AudioProductError>>;
  search(searchDto: SearchAudioProductsRequest): Promise<Result<AudioProduct[], AudioProductError>>;
  findAll(): Promise<Result<AudioProduct[], AudioProductError>>;
}
