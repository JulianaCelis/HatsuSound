import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AudioProductEntity } from '../database/entities/audio-product.entity';
import { IAudioProductRepositoryPort } from '@/domain/ports/output/audio-product.repository.port';
import { AudioProductError } from '@/domain/ports/input/audio-product.port';
import { Result, Success, Failure } from '@/domain/ports';
import { AudioProduct } from '@/domain/entities/audio-product.entity';
import { CreateAudioProductRequest, UpdateAudioProductRequest, SearchAudioProductsRequest } from '@/domain/ports/input/audio-product.port';

@Injectable()
export class AudioProductRepository implements IAudioProductRepositoryPort {
  constructor(
    @InjectRepository(AudioProductEntity)
    private readonly repository: Repository<AudioProductEntity>,
  ) {}

  async create(audioProductData: CreateAudioProductRequest): Promise<Result<AudioProduct, AudioProductError>> {
    try {
      const audioProduct = new AudioProductEntity();
      Object.assign(audioProduct, audioProductData);
      
      const savedAudioProduct = await this.repository.save(audioProduct);
      return new Success(this.mapToDomain(savedAudioProduct));
    } catch (error) {
      return new Failure({ type: 'VALIDATION_ERROR', message: 'Error creating audio product' });
    }
  }

  async findById(id: string): Promise<Result<AudioProduct, AudioProductError>> {
    try {
      const audioProduct = await this.repository.findOne({ where: { id } });
      if (!audioProduct) {
        return new Failure({ type: 'PRODUCT_NOT_FOUND', message: 'Audio product not found' });
      }
      return new Success(this.mapToDomain(audioProduct));
    } catch (error) {
      return new Failure({ type: 'VALIDATION_ERROR', message: 'Error fetching audio product' });
    }
  }

  async update(id: string, audioProductData: UpdateAudioProductRequest): Promise<Result<AudioProduct, AudioProductError>> {
    try {
      await this.repository.update(id, audioProductData);
      const updatedAudioProduct = await this.repository.findOne({ where: { id } });
      if (!updatedAudioProduct) {
        return new Failure({ type: 'PRODUCT_NOT_FOUND', message: 'Audio product not found' });
      }
      return new Success(this.mapToDomain(updatedAudioProduct));
    } catch (error) {
      return new Failure({ type: 'VALIDATION_ERROR', message: 'Error updating audio product' });
    }
  }

  async delete(id: string): Promise<Result<boolean, AudioProductError>> {
    try {
      const result = await this.repository.delete(id);
      if (result.affected === 0) {
        return new Failure({ type: 'PRODUCT_NOT_FOUND', message: 'Audio product not found' });
      }
      return new Success(true);
    } catch (error) {
      return new Failure({ type: 'VALIDATION_ERROR', message: 'Error deleting audio product' });
    }
  }

  async search(searchDto: SearchAudioProductsRequest): Promise<Result<AudioProduct[], AudioProductError>> {
    try {
      const queryBuilder = this.repository.createQueryBuilder('audioProduct');

      if (searchDto.query) {
        queryBuilder.andWhere('(audioProduct.title ILIKE :query OR audioProduct.description ILIKE :query)', { 
          query: `%${searchDto.query}%` 
        });
      }

      if (searchDto.artist) {
        queryBuilder.andWhere('audioProduct.artist ILIKE :artist', { artist: `%${searchDto.artist}%` });
      }

      if (searchDto.genre) {
        queryBuilder.andWhere('audioProduct.genre = :genre', { genre: searchDto.genre });
      }

      if (searchDto.minPrice !== undefined) {
        queryBuilder.andWhere('audioProduct.price >= :minPrice', { minPrice: searchDto.minPrice });
      }

      if (searchDto.maxPrice !== undefined) {
        queryBuilder.andWhere('audioProduct.price <= :maxPrice', { maxPrice: searchDto.maxPrice });
      }

      if (searchDto.isActive !== undefined) {
        queryBuilder.andWhere('audioProduct.isActive = :isActive', { isActive: searchDto.isActive });
      }

      const audioProducts = await queryBuilder.getMany();
      return new Success(audioProducts.map(ap => this.mapToDomain(ap)));
    } catch (error) {
      return new Failure({ type: 'VALIDATION_ERROR', message: 'Error searching audio products' });
    }
  }

  async findAll(): Promise<Result<AudioProduct[], AudioProductError>> {
    try {
      const audioProducts = await this.repository.find();
      return new Success(audioProducts.map(ap => this.mapToDomain(ap)));
    } catch (error) {
      return new Failure({ type: 'VALIDATION_ERROR', message: 'Error fetching all audio products' });
    }
  }

  private mapToDomain(entity: AudioProductEntity): AudioProduct {
    return new AudioProduct(
      entity.id,
      entity.title,
      entity.description,
      entity.artist,
      entity.genre,
      entity.audioUrl,
      entity.duration,
      entity.format,
      entity.bitrate,
      entity.price,
      entity.stock,
      entity.isActive,
      entity.tags,
      entity.releaseDate,
      entity.language,
      entity.isExplicit,
      entity.ageRestriction,
      entity.playCount,
      entity.downloadCount,
      entity.createdAt,
      entity.updatedAt,
    );
  }
}
