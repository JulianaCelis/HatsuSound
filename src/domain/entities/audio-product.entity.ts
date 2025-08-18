import { BaseEntity } from './base.entity';

export enum AudioFormat {
  MP3 = 'mp3',
  WAV = 'wav',
  FLAC = 'flac',
  AAC = 'aac',
  OGG = 'ogg'
}

export enum AudioGenre {
  ROCK = 'rock',
  POP = 'pop',
  JAZZ = 'jazz',
  CLASSICAL = 'classical',
  ELECTRONIC = 'electronic',
  HIP_HOP = 'hip_hop',
  COUNTRY = 'country',
  BLUES = 'blues',
  REGGAE = 'reggae',
  FOLK = 'folk',
  OTHER = 'other'
}

export enum AgeRestriction {
  ALL_AGES = 0,
  TEEN = 13,
  ADULT = 18,
  MATURE = 21
}

export class AudioProduct extends BaseEntity {
  constructor(
    id: string,
    public readonly title: string,
    public readonly description: string,
    public readonly artist: string,
    public readonly genre: AudioGenre,
    public readonly audioUrl: string,
    public readonly duration: number, // en segundos
    public readonly format: AudioFormat,
    public readonly bitrate: number, // en kbps
    public readonly price: number,
    public readonly stock: number,
    public readonly isActive: boolean,
    public readonly tags: string[],
    public readonly releaseDate: Date,
    public readonly language: string,
    public readonly isExplicit: boolean,
    public readonly ageRestriction: AgeRestriction,
    public readonly playCount: number,
    public readonly downloadCount: number,
    createdAt: Date,
    updatedAt: Date,
  ) {
    super(id, createdAt, updatedAt);
  }

  // Métodos de negocio
  get durationFormatted(): string {
    const minutes = Math.floor(this.duration / 60);
    const seconds = this.duration % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  get priceFormatted(): string {
    return `$${this.price.toFixed(2)}`;
  }

  isInStock(): boolean {
    return this.stock > 0;
  }

  canPurchase(quantity: number): boolean {
    return this.isActive && this.stock >= quantity;
  }

  canAccess(userAge: number): boolean {
    return userAge >= this.ageRestriction;
  }

  // Métodos de stock
  decreaseStock(quantity: number): AudioProduct {
    if (this.stock < quantity) {
      throw new Error('Stock insuficiente');
    }
    
    return new AudioProduct(
      this.id,
      this.title,
      this.description,
      this.artist,
      this.genre,
      this.audioUrl,
      this.duration,
      this.format,
      this.bitrate,
      this.price,
      this.stock - quantity,
      this.isActive,
      this.tags,
      this.releaseDate,
      this.language,
      this.isExplicit,
      this.ageRestriction,
      this.playCount,
      this.downloadCount,
      this.createdAt,
      new Date()
    );
  }

  increaseStock(quantity: number): AudioProduct {
    return new AudioProduct(
      this.id,
      this.title,
      this.description,
      this.artist,
      this.genre,
      this.audioUrl,
      this.duration,
      this.format,
      this.bitrate,
      this.price,
      this.stock + quantity,
      this.isActive,
      this.tags,
      this.releaseDate,
      this.language,
      this.isExplicit,
      this.ageRestriction,
      this.playCount,
      this.downloadCount,
      this.createdAt,
      new Date()
    );
  }

  // Métodos de analytics
  incrementPlayCount(): AudioProduct {
    return new AudioProduct(
      this.id,
      this.title,
      this.description,
      this.artist,
      this.genre,
      this.audioUrl,
      this.duration,
      this.format,
      this.bitrate,
      this.price,
      this.stock,
      this.isActive,
      this.tags,
      this.releaseDate,
      this.language,
      this.isExplicit,
      this.ageRestriction,
      this.playCount + 1,
      this.downloadCount,
      this.createdAt,
      new Date()
    );
  }

  incrementDownloadCount(): AudioProduct {
    return new AudioProduct(
      this.id,
      this.title,
      this.description,
      this.artist,
      this.genre,
      this.audioUrl,
      this.duration,
      this.format,
      this.bitrate,
      this.price,
      this.stock,
      this.isActive,
      this.tags,
      this.releaseDate,
      this.language,
      this.isExplicit,
      this.ageRestriction,
      this.playCount,
      this.downloadCount + 1,
      this.createdAt,
      new Date()
    );
  }

  // Factory method
  static create(
    title: string,
    description: string,
    artist: string,
    genre: AudioGenre,
    audioUrl: string,
    duration: number,
    format: AudioFormat,
    bitrate: number,
    price: number,
    stock: number,
    tags: string[],
    releaseDate: Date,
    language: string,
    isExplicit: boolean = false,
    ageRestriction: AgeRestriction = AgeRestriction.ALL_AGES
  ): {
    title: string;
    description: string;
    artist: string;
    genre: AudioGenre;
    audioUrl: string;
    duration: number;
    format: AudioFormat;
    bitrate: number;
    price: number;
    stock: number;
    isActive: boolean;
    tags: string[];
    releaseDate: Date;
    language: string;
    isExplicit: boolean;
    ageRestriction: AgeRestriction;
    playCount: number;
    downloadCount: number;
  } {
    return {
      title,
      description,
      artist,
      genre,
      audioUrl,
      duration,
      format,
      bitrate,
      price,
      stock,
      isActive: true,
      tags,
      releaseDate,
      language,
      isExplicit,
      ageRestriction,
      playCount: 0,
      downloadCount: 0
    };
  }
}
