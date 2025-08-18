import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  Query, 
  UseGuards,
  HttpStatus,
  HttpCode
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiParam, 
  ApiQuery, 
  ApiBearerAuth,
  ApiBody
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { AudioProductService } from '../services/audio-product.service';
import { 
  CreateAudioProductDto,
  UpdateAudioProductDto,
  SearchAudioProductsDto,
  UpdateStockDto
} from '../dto/audio-product.dto';

@ApiTags('audio-products')
@Controller('api/audio-products')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AudioProductController {
  constructor(
    private readonly audioProductService: AudioProductService
  ) {}

  @Post()
  @Roles('admin', 'moderator')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Crear un nuevo producto de audio' })
  @ApiResponse({ 
    status: 201, 
    description: 'Producto creado exitosamente' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Datos de entrada inválidos' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'No autorizado' 
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Permisos insuficientes' 
  })
  @HttpCode(HttpStatus.CREATED)
  async createProduct(@Body() request: CreateAudioProductDto) {
    const result = await this.audioProductService.createProduct(request);
    
    if (result.isFailure()) {
      // Aquí podrías usar un interceptor para manejar los errores de dominio
      throw new Error(result.error.message);
    }
    
    return result.value;
  }

  @Get(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Obtener un producto por ID' })
  @ApiParam({ name: 'id', description: 'ID del producto' })
  @ApiResponse({ 
    status: 200, 
    description: 'Producto encontrado' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Producto no encontrado' 
  })
  async getProductById(@Param('id') id: string) {
    const result = await this.audioProductService.getProductById(id);
    
    if (result.isFailure()) {
      throw new Error(result.error.message);
    }
    
    return result.value;
  }

  @Put(':id')
  @Roles('admin', 'moderator')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Actualizar un producto existente' })
  @ApiParam({ name: 'id', description: 'ID del producto' })
  @ApiResponse({ 
    status: 200, 
    description: 'Producto actualizado exitosamente' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Producto no encontrado' 
  })
  async updateProduct(
    @Param('id') id: string, 
    @Body() request: UpdateAudioProductDto
  ) {
    const result = await this.audioProductService.updateProduct(id, request);
    
    if (result.isFailure()) {
      throw new Error(result.error.message);
    }
    
    return result.value;
  }

  @Delete(':id')
  @Roles('admin')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Eliminar un producto' })
  @ApiParam({ name: 'id', description: 'ID del producto' })
  @ApiResponse({ 
    status: 200, 
    description: 'Producto eliminado exitosamente' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Producto no encontrado' 
  })
  async deleteProduct(@Param('id') id: string) {
    const result = await this.audioProductService.deleteProduct(id);
    
    if (result.isFailure()) {
      throw new Error(result.error.message);
    }
    
    return result.value;
  }

  @Get()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Listar productos con paginación y filtros' })
  @ApiQuery({ name: 'page', required: false, description: 'Número de página' })
  @ApiQuery({ name: 'limit', required: false, description: 'Elementos por página' })
  @ApiQuery({ name: 'genre', required: false, description: 'Filtrar por género' })
  @ApiQuery({ name: 'artist', required: false, description: 'Filtrar por artista' })
  @ApiQuery({ name: 'minPrice', required: false, description: 'Precio mínimo' })
  @ApiQuery({ name: 'maxPrice', required: false, description: 'Precio máximo' })
  @ApiQuery({ name: 'sortBy', required: false, description: 'Campo para ordenar' })
  @ApiQuery({ name: 'sortOrder', required: false, description: 'Orden ascendente o descendente' })
  async listProducts(@Query() query: SearchAudioProductsDto) {
    const result = await this.audioProductService.listProducts(query);
    
    if (result.isFailure()) {
      throw new Error(result.error.message);
    }
    
    return result.value;
  }

  @Get('search')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Buscar productos por texto' })
  @ApiQuery({ name: 'query', required: true, description: 'Texto de búsqueda' })
  @ApiQuery({ name: 'genre', required: false, description: 'Filtrar por género' })
  @ApiQuery({ name: 'artist', required: false, description: 'Filtrar por artista' })
  @ApiQuery({ name: 'minPrice', required: false, description: 'Precio mínimo' })
  @ApiQuery({ name: 'maxPrice', required: false, description: 'Precio máximo' })
  @ApiQuery({ name: 'page', required: false, description: 'Número de página' })
  @ApiQuery({ name: 'limit', required: false, description: 'Elementos por página' })
  async searchProducts(@Query() query: SearchAudioProductsDto) {
    const result = await this.audioProductService.listProducts(query);
    
    if (result.isFailure()) {
      throw new Error(result.error.message);
    }
    
    return result.value;
  }

  @Put(':id/stock')
  @Roles('admin', 'moderator')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Actualizar stock de un producto' })
  @ApiParam({ name: 'id', description: 'ID del producto' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        quantity: { type: 'number', description: 'Cantidad a modificar' },
        operation: { 
          type: 'string', 
          enum: ['increase', 'decrease'], 
          description: 'Operación a realizar' 
        }
      }
    }
  })
  async updateStock(
    @Param('id') id: string,
    @Body() body: UpdateStockDto
  ) {
    const result = await this.audioProductService.updateStock(
      id, 
      body.quantity, 
      body.operation
    );
    
    if (result.isFailure()) {
      throw new Error(result.error.message);
    }
    
    return result.value;
  }

  @Post(':id/play')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Incrementar contador de reproducciones' })
  @ApiParam({ name: 'id', description: 'ID del producto' })
  async incrementPlayCount(@Param('id') id: string) {
    const result = await this.audioProductService.incrementPlayCount(id);
    
    if (result.isFailure()) {
      throw new Error(result.error.message);
    }
    
    return result.value;
  }

  @Post(':id/download')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Incrementar contador de descargas' })
  @ApiParam({ name: 'id', description: 'ID del producto' })
  async incrementDownloadCount(@Param('id') id: string) {
    const result = await this.audioProductService.incrementDownloadCount(id);
    
    if (result.isFailure()) {
      throw new Error(result.error.message);
    }
    
    return result.value;
  }

  @Put(':id/activate')
  @Roles('admin', 'moderator')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Activar un producto' })
  @ApiParam({ name: 'id', description: 'ID del producto' })
  async activateProduct(@Param('id') id: string) {
    const result = await this.audioProductService.activateProduct(id);
    
    if (result.isFailure()) {
      throw new Error(result.error.message);
    }
    
    return result.value;
  }

  @Put(':id/deactivate')
  @Roles('admin', 'moderator')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Desactivar un producto' })
  @ApiParam({ name: 'id', description: 'ID del producto' })
  async deactivateProduct(@Param('id') id: string) {
    const result = await this.audioProductService.deactivateProduct(id);
    
    if (result.isFailure()) {
      throw new Error(result.error.message);
    }
    
    return result.value;
  }
}
