import { Injectable, Inject } from '@nestjs/common';
import { IAudioProductRepositoryPort } from '@/domain/ports/output/audio-product.repository.port';
import { AudioProduct } from '@/domain/entities/audio-product.entity';
import { CreateAudioProductDto, UpdateAudioProductDto, SearchAudioProductsDto } from '../dto/audio-product.dto';
import { Result } from '@/domain/ports';
import { AudioProductError } from '@/domain/ports/input/audio-product.port';
import { AUDIO_PRODUCT_REPOSITORY } from '@/domain/ports/output/audio-product.repository.port';

@Injectable()
export class AudioProductService {
  constructor(
    @Inject(AUDIO_PRODUCT_REPOSITORY)
    private readonly audioProductRepository: IAudioProductRepositoryPort,
  ) {}

  async create(createDto: CreateAudioProductDto): Promise<Result<AudioProduct, AudioProductError>> {
    return this.audioProductRepository.create(createDto);
  }

  async findById(id: string): Promise<Result<AudioProduct, AudioProductError>> {
    return this.audioProductRepository.findById(id);
  }

  async update(id: string, updateDto: UpdateAudioProductDto): Promise<Result<AudioProduct, AudioProductError>> {
    return this.audioProductRepository.update(id, updateDto);
  }

  async delete(id: string): Promise<Result<boolean, AudioProductError>> {
    return this.audioProductRepository.delete(id);
  }

  async search(searchDto: SearchAudioProductsDto): Promise<Result<AudioProduct[], AudioProductError>> {
    return this.audioProductRepository.search(searchDto);
  }

  async findAll(): Promise<Result<AudioProduct[], AudioProductError>> {
    return this.audioProductRepository.findAll();
  }
}
