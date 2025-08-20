import { Controller, Get, Post, Put, Delete, Param, Body, Query, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { AudioProductService } from '../services/audio-product.service';
import { CreateAudioProductDto, UpdateAudioProductDto, SearchAudioProductsDto, UpdateStockDto } from '../dto/audio-product.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@/domain/entities/user.entity';

@ApiTags('Audio Products')
@Controller('api/audio-products')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AudioProductController {
  constructor(private readonly audioProductService: AudioProductService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  @ApiOperation({ summary: 'Create a new audio product' })
  @ApiResponse({ status: 201, description: 'Audio product created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @HttpCode(HttpStatus.CREATED)
  async createProduct(@Body() request: CreateAudioProductDto) {
    const result = await this.audioProductService.create(request);

    if (result.isFailure()) {
      // Aquí podrías usar un interceptor para manejar los errores de dominio
      throw new Error(result.error.message);
    }

    return result.value;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get audio product by ID' })
  @ApiParam({ name: 'id', description: 'Audio product ID' })
  @ApiResponse({ status: 200, description: 'Audio product found' })
  @ApiResponse({ status: 404, description: 'Audio product not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getProductById(@Param('id') id: string) {  
    const result = await this.audioProductService.findById(id);

    if (result.isFailure()) {
      throw new Error(result.error.message);       
    }

    return result.value;
  }

  @Put(':id')
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  @ApiOperation({ summary: 'Update an audio product' })
  @ApiParam({ name: 'id', description: 'Audio product ID' })
  @ApiResponse({ status: 200, description: 'Audio product updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Audio product not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async updateProduct(
    @Param('id') id: string,
    @Body() request: UpdateAudioProductDto        
  ) {
    const result = await this.audioProductService.update(id, request);

    if (result.isFailure()) {
      throw new Error(result.error.message);       
    }

    return result.value;
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete an audio product' })
  @ApiParam({ name: 'id', description: 'Audio product ID' })
  @ApiResponse({ status: 200, description: 'Audio product deleted successfully' })
  @ApiResponse({ status: 404, description: 'Audio product not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async deleteProduct(@Param('id') id: string) {  
    const result = await this.audioProductService.delete(id);

    if (result.isFailure()) {
      throw new Error(result.error.message);       
    }

    return result.value;
  }

  @Get()
  @ApiOperation({ summary: 'List all audio products' })
  @ApiQuery({ name: 'query', required: false, description: 'Search query' })
  @ApiQuery({ name: 'artist', required: false, description: 'Filter by artist' })
  @ApiQuery({ name: 'genre', required: false, description: 'Filter by genre' })
  @ApiQuery({ name: 'minPrice', required: false, description: 'Minimum price' })
  @ApiQuery({ name: 'maxPrice', required: false, description: 'Maximum price' })
  @ApiQuery({ name: 'isActive', required: false, description: 'Filter by active status' })
  @ApiResponse({ status: 200, description: 'Audio products retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async listProducts(@Query() query: SearchAudioProductsDto) {
    const result = await this.audioProductService.findAll();

    if (result.isFailure()) {
      throw new Error(result.error.message);       
    }

    return result.value;
  }

  @Get('search')
  @ApiOperation({ summary: 'Search audio products' })
  @ApiQuery({ name: 'query', required: false, description: 'Search query' })
  @ApiQuery({ name: 'artist', required: false, description: 'Filter by artist' })
  @ApiQuery({ name: 'genre', required: false, description: 'Filter by genre' })
  @ApiQuery({ name: 'minPrice', required: false, description: 'Minimum price' })
  @ApiQuery({ name: 'maxPrice', required: false, description: 'Maximum price' })
  @ApiQuery({ name: 'isActive', required: false, description: 'Filter by active status' })
  @ApiResponse({ status: 200, description: 'Search results' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async searchProducts(@Query() query: SearchAudioProductsDto) {
    const result = await this.audioProductService.search(query);

    if (result.isFailure()) {
      throw new Error(result.error.message);       
    }

    return result.value;
  }

  @Put(':id/stock')
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  @ApiOperation({ summary: 'Update product stock' })
  @ApiParam({ name: 'id', description: 'Audio product ID' })
  @ApiResponse({ status: 200, description: 'Stock updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Audio product not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async updateStock(
    @Param('id') id: string,
    @Body() body: UpdateStockDto
  ) {
    // Implementar lógica de actualización de stock
    const result = await this.audioProductService.findById(id);

    if (result.isFailure()) {
      throw new Error(result.error.message);
    }

    // Aquí implementarías la lógica de actualización de stock
    return { message: 'Stock update not implemented yet' };
  }

  @Post(':id/play')
  @ApiOperation({ summary: 'Increment play count' })
  @ApiParam({ name: 'id', description: 'Audio product ID' })
  @ApiResponse({ status: 200, description: 'Play count incremented' })
  @ApiResponse({ status: 404, description: 'Audio product not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async incrementPlayCount(@Param('id') id: string) {
    const result = await this.audioProductService.findById(id);

    if (result.isFailure()) {
      throw new Error(result.error.message);       
    }

    // Aquí implementarías la lógica de incremento de reproducciones
    return { message: 'Play count increment not implemented yet' };
  }

  @Post(':id/download')
  @ApiOperation({ summary: 'Increment download count' })
  @ApiParam({ name: 'id', description: 'Audio product ID' })
  @ApiResponse({ status: 200, description: 'Download count incremented' })
  @ApiResponse({ status: 404, description: 'Audio product not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async incrementDownloadCount(@Param('id') id: string) {
    const result = await this.audioProductService.findById(id);

    if (result.isFailure()) {
      throw new Error(result.error.message);       
    }

    // Aquí implementarías la lógica de incremento de descargas
    return { message: 'Download count increment not implemented yet' };
  }

  @Put(':id/activate')
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  @ApiOperation({ summary: 'Activate audio product' })
  @ApiParam({ name: 'id', description: 'Audio product ID' })
  @ApiResponse({ status: 200, description: 'Audio product activated' })
  @ApiResponse({ status: 404, description: 'Audio product not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async activateProduct(@Param('id') id: string) {  
    const result = await this.audioProductService.findById(id);

    if (result.isFailure()) {
      throw new Error(result.error.message);       
    }

    // Aquí implementarías la lógica de activación
    return { message: 'Product activation not implemented yet' };
  }

  @Put(':id/deactivate')
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  @ApiOperation({ summary: 'Deactivate audio product' })
  @ApiParam({ name: 'id', description: 'Audio product ID' })
  @ApiResponse({ status: 200, description: 'Audio product deactivated' })
  @ApiResponse({ status: 404, description: 'Audio product not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async deactivateProduct(@Param('id') id: string) {
    const result = await this.audioProductService.findById(id);

    if (result.isFailure()) {
      throw new Error(result.error.message);       
    }

    // Aquí implementarías la lógica de desactivación
    return { message: 'Product deactivation not implemented yet' };
  }
}
