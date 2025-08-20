import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { AudioFormat, AudioGenre, AgeRestriction } from '@/domain/entities/audio-product.entity';

@Entity('audio_products')
@Index(['title', 'artist'], { unique: true })
@Index(['genre'])
@Index(['artist'])
@Index(['price'])
@Index(['isActive'])
@Index(['releaseDate'])
@Index(['playCount'])
@Index(['downloadCount'])
export class AudioProductEntity extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'varchar', length: 255 })
  artist: string;

  @Column({ 
    type: 'enum',
    enum: AudioGenre,
    default: AudioGenre.OTHER
  })
  genre: AudioGenre;

  @Column({ type: 'varchar', length: 500, name: 'audio_url' })
  audioUrl: string;

  @Column({ type: 'int' })
  duration: number;

  @Column({ 
    type: 'enum',
    enum: AudioFormat,
    default: AudioFormat.MP3
  })
  format: AudioFormat;

  @Column({ type: 'int' })
  bitrate: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'int', default: 0 })
  stock: number;

  @Column({ type: 'boolean', default: true, name: 'is_active' })
  isActive: boolean;

  @Column({ type: 'text', array: true, default: '{}' })
  tags: string[];

  @Column({ type: 'date', name: 'release_date' })
  releaseDate: Date;

  @Column({ type: 'varchar', length: 10, default: 'es' })
  language: string;

  @Column({ type: 'boolean', default: false, name: 'is_explicit' })
  isExplicit: boolean;

  @Column({ 
    type: 'enum',
    enum: AgeRestriction,
    default: AgeRestriction.ALL_AGES,
    name: 'age_restriction'
  })
  ageRestriction: AgeRestriction;

  @Column({ type: 'int', default: 0, name: 'play_count' })
  playCount: number;

  @Column({ type: 'int', default: 0, name: 'download_count' })
  downloadCount: number;
}
