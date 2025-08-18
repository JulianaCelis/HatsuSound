import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { AudioProduct } from '../database/entities/audio-product.entity';
import { IAudioProductRepositoryPort } from '@/domain/ports/output/audio-product.repository.port';
import { AudioProductError } from '@/domain/ports/input/audio-product.port';
import { Result, Success, Failure } from '@/domain/ports';

@Injectable()
export class AudioProductRepository implements IAudioProductRepositoryPort {
  constructor(
    @InjectRepository(AudioProduct)
    private readonly audioProductRepository: Repository<AudioProduct>
  ) {}

  async create(product: any): Promise<Result<AudioProduct, AudioProductError>> {
    try {
      const newProduct = this.audioProductRepository.create({
        ...product,
        id: uuidv4(),
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      const savedProduct = await this.audioProductRepository.save(newProduct);
      // Ensure we return a single entity, not an array
      if (Array.isArray(savedProduct)) {
        return new Success(savedProduct[0]);
      }
      return new Success(savedProduct);
    } catch (error) {
      return new Failure({
        type: 'VALIDATION_ERROR',
        message: 'Error al crear producto: ' + error.message
      });
    }
  }

  async findById(id: string): Promise<Result<AudioProduct, AudioProductError>> {
    try {
      const product = await this.audioProductRepository.findOne({ where: { id } });
      
      if (!product) {
        return new Failure({
          type: 'PRODUCT_NOT_FOUND',
          message: 'Producto no encontrado'
        });
      }
      
      return new Success(product);
    } catch (error) {
      return new Failure({
        type: 'VALIDATION_ERROR',
        message: 'Error al buscar producto: ' + error.message
      });
    }
  }

  async update(id: string, productData: Partial<AudioProduct>): Promise<Result<AudioProduct, AudioProductError>> {
    try {
      await this.audioProductRepository.update(id, {
        ...productData,
        updatedAt: new Date()
      });
      
      const updatedProduct = await this.findById(id);
      if (updatedProduct.isFailure()) {
        return updatedProduct;
      }
      
      return new Success(updatedProduct.value);
    } catch (error) {
      return new Failure({
        type: 'VALIDATION_ERROR',
        message: 'Error al actualizar producto: ' + error.message
      });
    }
  }

  async delete(id: string): Promise<Result<boolean, AudioProductError>> {
    try {
      const result = await this.audioProductRepository.delete(id);
      return new Success(result.affected !== 0);
    } catch (error) {
      return new Failure({
        type: 'VALIDATION_ERROR',
        message: 'Error al eliminar producto: ' + error.message
      });
    }
  }

  async findAll(request: any): Promise<Result<{ products: AudioProduct[]; total: number; page: number; limit: number; totalPages: number }, AudioProductError>> {
    try {
      const { page = 1, limit = 10, genre, artist, minPrice, maxPrice, isActive, sortBy, sortOrder } = request;
      
      const queryBuilder = this.audioProductRepository.createQueryBuilder('product');
      
      // Aplicar filtros
      if (genre) {
        queryBuilder.andWhere('product.genre = :genre', { genre });
      }
      
      if (artist) {
        queryBuilder.andWhere('product.artist ILIKE :artist', { artist: `%${artist}%` });
      }
      
      if (minPrice !== undefined) {
        queryBuilder.andWhere('product.price >= :minPrice', { minPrice });
      }
      
      if (maxPrice !== undefined) {
        queryBuilder.andWhere('product.price <= :maxPrice', { maxPrice });
      }
      
      if (isActive !== undefined) {
        queryBuilder.andWhere('product.isActive = :isActive', { isActive });
      }
      
      // Aplicar ordenamiento
      if (sortBy) {
        const order = sortOrder === 'desc' ? 'DESC' : 'ASC';
        queryBuilder.orderBy(`product.${sortBy}`, order);
      } else {
        queryBuilder.orderBy('product.createdAt', 'DESC');
      }
      
      // Aplicar paginación
      const skip = (page - 1) * limit;
      queryBuilder.skip(skip).take(limit);
      
      const [products, total] = await queryBuilder.getManyAndCount();
      const totalPages = Math.ceil(total / limit);
      
      return new Success({
        products,
        total,
        page,
        limit,
        totalPages
      });
    } catch (error) {
      return new Failure({
        type: 'VALIDATION_ERROR',
        message: 'Error al obtener productos: ' + error.message
      });
    }
  }

  async findByGenre(genre: string): Promise<Result<AudioProduct[], AudioProductError>> {
    try {
      const products = await this.audioProductRepository.find({ 
        where: { genre: genre as any } 
      });
      return new Success(products);
    } catch (error) {
      return new Failure({
        type: 'VALIDATION_ERROR',
        message: 'Error al buscar por género: ' + error.message
      });
    }
  }

  async findByArtist(artist: string): Promise<Result<AudioProduct[], AudioProductError>> {
    try {
      const products = await this.audioProductRepository.find({ 
        where: { artist: Like(`%${artist}%`) } 
      });
      return new Success(products);
    } catch (error) {
      return new Failure({
        type: 'VALIDATION_ERROR',
        message: 'Error al buscar por artista: ' + error.message
      });
    }
  }

  async findByTags(tags: string[]): Promise<Result<AudioProduct[], AudioProductError>> {
    try {
      const products = await this.audioProductRepository
        .createQueryBuilder('product')
        .where('product.tags && ARRAY[:...tags]', { tags })
        .getMany();
      
      return new Success(products);
    } catch (error) {
      return new Failure({
        type: 'VALIDATION_ERROR',
        message: 'Error al buscar por tags: ' + error.message
      });
    }
  }

  async search(request: any): Promise<Result<{ products: AudioProduct[]; total: number; page: number; limit: number; totalPages: number }, AudioProductError>> {
    try {
      const { query, page = 1, limit = 10, genre, artist, minPrice, maxPrice, isActive, sortBy, sortOrder } = request;
      
      const queryBuilder = this.audioProductRepository.createQueryBuilder('product');
      
      // Aplicar búsqueda de texto
      if (query) {
        queryBuilder.andWhere(
          '(product.title ILIKE :query OR product.description ILIKE :query OR product.artist ILIKE :query)',
          { query: `%${query}%` }
        );
      }
      
      // Aplicar filtros adicionales
      if (genre) {
        queryBuilder.andWhere('product.genre = :genre', { genre });
      }
      
      if (artist) {
        queryBuilder.andWhere('product.artist ILIKE :artist', { artist: `%${artist}%` });
      }
      
      if (minPrice !== undefined) {
        queryBuilder.andWhere('product.price >= :minPrice', { minPrice });
      }
      
      if (maxPrice !== undefined) {
        queryBuilder.andWhere('product.price <= :maxPrice', { maxPrice });
      }
      
      if (isActive !== undefined) {
        queryBuilder.andWhere('product.isActive = :isActive', { isActive });
      }
      
      // Aplicar ordenamiento
      if (sortBy) {
        const order = sortOrder === 'desc' ? 'DESC' : 'ASC';
        queryBuilder.orderBy(`product.${sortBy}`, order);
      } else {
        queryBuilder.orderBy('product.createdAt', 'DESC');
      }
      
      // Aplicar paginación
      const skip = (page - 1) * limit;
      queryBuilder.skip(skip).take(limit);
      
      const [products, total] = await queryBuilder.getManyAndCount();
      const totalPages = Math.ceil(total / limit);
      
      return new Success({
        products,
        total,
        page,
        limit,
        totalPages
      });
    } catch (error) {
      return new Failure({
        type: 'VALIDATION_ERROR',
        message: 'Error al buscar productos: ' + error.message
      });
    }
  }

  async findByPriceRange(minPrice: number, maxPrice: number): Promise<Result<AudioProduct[], AudioProductError>> {
    try {
      const products = await this.audioProductRepository.find({
        where: {
          price: Between(minPrice, maxPrice)
        }
      });
      
      return new Success(products);
    } catch (error) {
      return new Failure({
        type: 'VALIDATION_ERROR',
        message: 'Error al buscar por rango de precio: ' + error.message
      });
    }
  }

  async findByActiveStatus(isActive: boolean): Promise<Result<AudioProduct[], AudioProductError>> {
    try {
      const products = await this.audioProductRepository.find({ where: { isActive } });
      return new Success(products);
    } catch (error) {
      return new Failure({
        type: 'VALIDATION_ERROR',
        message: 'Error al buscar por estado: ' + error.message
      });
    }
  }

  async findWithPagination(page: number, limit: number): Promise<Result<{ products: AudioProduct[]; total: number }, AudioProductError>> {
    try {
      const [products, total] = await this.audioProductRepository.findAndCount({
        skip: (page - 1) * limit,
        take: limit,
        order: { createdAt: 'DESC' }
      });
      
      return new Success({ products, total });
    } catch (error) {
      return new Failure({
        type: 'VALIDATION_ERROR',
        message: 'Error al obtener productos paginados: ' + error.message
      });
    }
  }

  async existsByTitle(title: string, artist: string): Promise<Result<boolean, AudioProductError>> {
    try {
      const count = await this.audioProductRepository.count({
        where: { title, artist }
      });
      
      return new Success(count > 0);
    } catch (error) {
      return new Failure({
        type: 'VALIDATION_ERROR',
        message: 'Error al verificar título: ' + error.message
      });
    }
  }

  async existsByAudioUrl(audioUrl: string): Promise<Result<boolean, AudioProductError>> {
    try {
      const count = await this.audioProductRepository.count({
        where: { audioUrl }
      });
      
      return new Success(count > 0);
    } catch (error) {
      return new Failure({
        type: 'VALIDATION_ERROR',
        message: 'Error al verificar URL: ' + error.message
      });
    }
  }

  async updateStock(id: string, quantity: number, operation: 'increase' | 'decrease'): Promise<Result<AudioProduct, AudioProductError>> {
    try {
      const productResult = await this.findById(id);
      if (productResult.isFailure()) {
        return productResult;
      }
      
      const product = productResult.value;
      let newStock: number;
      
      if (operation === 'increase') {
        newStock = product.stock + quantity;
      } else {
        if (product.stock < quantity) {
          return new Failure({
            type: 'INSUFFICIENT_STOCK',
            message: 'Stock insuficiente para la operación'
          });
        }
        newStock = product.stock - quantity;
      }
      
      const updatedProduct = await this.audioProductRepository.save({
        ...product,
        stock: newStock,
        updatedAt: new Date()
      });
      
      return new Success(updatedProduct);
    } catch (error) {
      return new Failure({
        type: 'VALIDATION_ERROR',
        message: 'Error al actualizar stock: ' + error.message
      });
    }
  }

  async incrementPlayCount(id: string): Promise<Result<AudioProduct, AudioProductError>> {
    try {
      const productResult = await this.findById(id);
      if (productResult.isFailure()) {
        return productResult;
      }
      
      const product = productResult.value;
      const updatedProduct = await this.audioProductRepository.save({
        ...product,
        playCount: product.playCount + 1,
        updatedAt: new Date()
      });
      
      return new Success(updatedProduct);
    } catch (error) {
      return new Failure({
        type: 'VALIDATION_ERROR',
        message: 'Error al incrementar contador de reproducciones: ' + error.message
      });
    }
  }

  async incrementDownloadCount(id: string): Promise<Result<AudioProduct, AudioProductError>> {
    try {
      const productResult = await this.findById(id);
      if (productResult.isFailure()) {
        return productResult;
      }
      
      const product = productResult.value;
      const updatedProduct = await this.audioProductRepository.save({
        ...product,
        downloadCount: product.downloadCount + 1,
        updatedAt: new Date()
      });
      
      return new Success(updatedProduct);
    } catch (error) {
      return new Failure({
        type: 'VALIDATION_ERROR',
        message: 'Error al incrementar contador de descargas: ' + error.message
      });
    }
  }

  async getProductStats(): Promise<Result<{
    totalProducts: number;
    activeProducts: number;
    totalStock: number;
    averagePrice: number;
    topGenres: { genre: string; count: number }[];
  }, AudioProductError>> {
    try {
      const totalProducts = await this.audioProductRepository.count();
      const activeProducts = await this.audioProductRepository.count({ where: { isActive: true } });
      
      const stockResult = await this.audioProductRepository
        .createQueryBuilder('product')
        .select('SUM(product.stock)', 'totalStock')
        .addSelect('AVG(product.price)', 'averagePrice')
        .getRawOne();
      
      const topGenres = await this.audioProductRepository
        .createQueryBuilder('product')
        .select('product.genre', 'genre')
        .addSelect('COUNT(*)', 'count')
        .groupBy('product.genre')
        .orderBy('count', 'DESC')
        .limit(5)
        .getRawMany();
      
      return new Success({
        totalProducts,
        activeProducts,
        totalStock: parseInt(stockResult.totalStock) || 0,
        averagePrice: parseFloat(stockResult.averagePrice) || 0,
        topGenres: topGenres.map(g => ({ genre: g.genre, count: parseInt(g.count) }))
      });
    } catch (error) {
      return new Failure({
        type: 'VALIDATION_ERROR',
        message: 'Error al obtener estadísticas: ' + error.message
      });
    }
  }
}
