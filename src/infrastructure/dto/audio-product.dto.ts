import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsArray, IsOptional, IsBoolean, IsDate, IsEnum, Min, Max } from 'class-validator';
import { AudioFormat, AudioGenre, AgeRestriction } from '@/domain/entities/audio-product.entity';

export class CreateAudioProductDto {
  @ApiProperty({ 
    description: 'Título del producto de audio',
    example: 'Bohemian Rhapsody',
    minLength: 1,
    maxLength: 255
  })
  @IsString()
  title: string;

  @ApiProperty({ 
    description: 'Descripción del producto',
    example: 'Una de las canciones más icónicas de Queen',
    minLength: 1
  })
  @IsString()
  description: string;

  @ApiProperty({ 
    description: 'Artista o banda',
    example: 'Queen',
    minLength: 1,
    maxLength: 255
  })
  @IsString()
  artist: string;

  @ApiProperty({ 
    description: 'Género musical',
    enum: AudioGenre,
    example: AudioGenre.ROCK
  })
  @IsEnum(AudioGenre)
  genre: AudioGenre;

  @ApiProperty({ 
    description: 'URL del archivo de audio',
    example: 'https://example.com/audio/bohemian-rhapsody.mp3',
    maxLength: 500
  })
  @IsString()
  audioUrl: string;

  @ApiProperty({ 
    description: 'Duración en segundos',
    example: 354,
    minimum: 1
  })
  @IsNumber()
  @Min(1)
  duration: number;

  @ApiProperty({ 
    description: 'Formato del archivo de audio',
    enum: AudioFormat,
    example: AudioFormat.MP3
  })
  @IsEnum(AudioFormat)
  format: AudioFormat;

  @ApiProperty({ 
    description: 'Bitrate en kbps',
    example: 320,
    minimum: 64
  })
  @IsNumber()
  @Min(64)
  bitrate: number;

  @ApiProperty({ 
    description: 'Precio del producto',
    example: 9.99,
    minimum: 0
  })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ 
    description: 'Stock disponible',
    example: 100,
    minimum: 0
  })
  @IsNumber()
  @Min(0)
  stock: number;

  @ApiProperty({ 
    description: 'Tags para categorización',
    example: ['rock', '70s', 'classic'],
    type: [String]
  })
  @IsArray()
  @IsString({ each: true })
  tags: string[];

  @ApiProperty({ 
    description: 'Fecha de lanzamiento',
    example: '1975-10-31',
    type: Date
  })
  @IsDate()
  releaseDate: Date;

  @ApiProperty({ 
    description: 'Idioma del producto',
    example: 'en',
    maxLength: 10
  })
  @IsString()
  language: string;

  @ApiProperty({ 
    description: 'Si el contenido es explícito',
    example: false,
    required: false
  })
  @IsOptional()
  @IsBoolean()
  isExplicit?: boolean;

  @ApiProperty({ 
    description: 'Restricción de edad mínima',
    enum: AgeRestriction,
    example: AgeRestriction.ALL_AGES,
    required: false
  })
  @IsOptional()
  @IsEnum(AgeRestriction)
  ageRestriction?: AgeRestriction;
}

export class UpdateAudioProductDto {
  @ApiProperty({ 
    description: 'Título del producto de audio',
    example: 'Bohemian Rhapsody',
    minLength: 1,
    maxLength: 255,
    required: false
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ 
    description: 'Descripción del producto',
    example: 'Una de las canciones más icónicas de Queen',
    minLength: 1,
    required: false
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ 
    description: 'Artista o banda',
    example: 'Queen',
    minLength: 1,
    maxLength: 255,
    required: false
  })
  @IsOptional()
  @IsString()
  artist?: string;

  @ApiProperty({ 
    description: 'Género musical',
    enum: AudioGenre,
    example: AudioGenre.ROCK,
    required: false
  })
  @IsOptional()
  @IsEnum(AudioGenre)
  genre?: AudioGenre;

  @ApiProperty({ 
    description: 'URL del archivo de audio',
    example: 'https://example.com/audio/bohemian-rhapsody.mp3',
    maxLength: 500,
    required: false
  })
  @IsOptional()
  @IsString()
  audioUrl?: string;

  @ApiProperty({ 
    description: 'Duración en segundos',
    example: 354,
    minimum: 1,
    required: false
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  duration?: number;

  @ApiProperty({ 
    description: 'Formato del archivo de audio',
    enum: AudioFormat,
    example: AudioFormat.MP3,
    required: false
  })
  @IsOptional()
  @IsEnum(AudioFormat)
  format?: AudioFormat;

  @ApiProperty({ 
    description: 'Bitrate en kbps',
    example: 320,
    minimum: 64,
    required: false
  })
  @IsOptional()
  @IsNumber()
  @Min(64)
  bitrate?: number;

  @ApiProperty({ 
    description: 'Precio del producto',
    example: 9.99,
    minimum: 0,
    required: false
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiProperty({ 
    description: 'Stock disponible',
    example: 100,
    minimum: 0,
    required: false
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  stock?: number;

  @ApiProperty({ 
    description: 'Tags para categorización',
    example: ['rock', '70s', 'classic'],
    type: [String],
    required: false
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiProperty({ 
    description: 'Fecha de lanzamiento',
    example: '1975-10-31',
    type: Date,
    required: false
  })
  @IsOptional()
  @IsDate()
  releaseDate?: Date;

  @ApiProperty({ 
    description: 'Idioma del producto',
    example: 'en',
    maxLength: 10,
    required: false
  })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiProperty({ 
    description: 'Si el contenido es explícito',
    example: false,
    required: false
  })
  @IsOptional()
  @IsBoolean()
  isExplicit?: boolean;

  @ApiProperty({ 
    description: 'Restricción de edad mínima',
    enum: AgeRestriction,
    example: AgeRestriction.ALL_AGES,
    required: false
  })
  @IsOptional()
  @IsEnum(AgeRestriction)
  ageRestriction?: AgeRestriction;

  @ApiProperty({ 
    description: 'Si el producto está activo',
    example: true,
    required: false
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class SearchAudioProductsDto {
  @ApiProperty({ 
    description: 'Texto de búsqueda',
    example: 'rock',
    required: false
  })
  @IsOptional()
  @IsString()
  query?: string;

  @ApiProperty({ 
    description: 'Género musical',
    enum: AudioGenre,
    example: AudioGenre.ROCK,
    required: false
  })
  @IsOptional()
  @IsEnum(AudioGenre)
  genre?: AudioGenre;

  @ApiProperty({ 
    description: 'Artista o banda',
    example: 'Queen',
    required: false
  })
  @IsOptional()
  @IsString()
  artist?: string;

  @ApiProperty({ 
    description: 'Precio mínimo',
    example: 5.00,
    minimum: 0,
    required: false
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @ApiProperty({ 
    description: 'Precio máximo',
    example: 15.00,
    minimum: 0,
    required: false
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @ApiProperty({ 
    description: 'Si el producto está activo',
    example: true,
    required: false
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ 
    description: 'Número de página',
    example: 1,
    minimum: 1,
    required: false
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number;

  @ApiProperty({ 
    description: 'Elementos por página',
    example: 10,
    minimum: 1,
    maximum: 100,
    required: false
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiProperty({ 
    description: 'Campo para ordenar',
    enum: ['title', 'artist', 'price', 'releaseDate', 'playCount'],
    example: 'title',
    required: false
  })
  @IsOptional()
  @IsString()
  sortBy?: 'title' | 'artist' | 'price' | 'releaseDate' | 'playCount';

  @ApiProperty({ 
    description: 'Orden ascendente o descendente',
    enum: ['asc', 'desc'],
    example: 'asc',
    required: false
  })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc';
}

export class UpdateStockDto {
  @ApiProperty({ 
    description: 'Cantidad a modificar',
    example: 5,
    minimum: 1
  })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({ 
    description: 'Operación a realizar',
    enum: ['increase', 'decrease'],
    example: 'increase'
  })
  @IsString()
  operation: 'increase' | 'decrease';
}
