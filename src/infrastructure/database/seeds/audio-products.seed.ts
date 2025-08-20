import { DataSource } from 'typeorm';
import { AudioProductEntity } from '../entities/audio-product.entity';
import { AudioFormat, AudioGenre, AgeRestriction } from '@/domain/entities/audio-product.entity';

export class AudioProductsSeed {
  constructor(private readonly dataSource: DataSource) {}

  async run(): Promise<void> {
    const audioProductRepository = this.dataSource.getRepository(AudioProductEntity);

    const audioProducts = [
      {
        title: 'Midnight Jazz',
        description: 'Una colección de jazz suave para las noches',
        artist: 'Jazz Collective',
        genre: AudioGenre.JAZZ,
        audioUrl: 'https://example.com/audio/midnight-jazz.mp3',
        duration: 1800, // 30 minutos
        format: AudioFormat.MP3,
        bitrate: 320,
        price: 15.99,
        stock: 100,
        isActive: true,
        tags: ['jazz', 'night', 'relaxing'],
        releaseDate: new Date('2024-01-15'),
        language: 'en',
        isExplicit: false,
        ageRestriction: AgeRestriction.ALL_AGES,
        playCount: 0,
        downloadCount: 0,
      },
      {
        title: 'Rock Anthems Vol. 1',
        description: 'Los mejores éxitos del rock clásico',
        artist: 'Rock Legends',
        genre: AudioGenre.ROCK,
        audioUrl: 'https://example.com/audio/rock-anthems.mp3',
        duration: 2400, // 40 minutos
        format: AudioFormat.MP3,
        bitrate: 320,
        price: 19.99,
        stock: 75,
        isActive: true,
        tags: ['rock', 'classic', 'anthems'],
        releaseDate: new Date('2024-02-01'),
        language: 'en',
        isExplicit: false,
        ageRestriction: AgeRestriction.ALL_AGES,
        playCount: 0,
        downloadCount: 0,
      },
      {
        title: 'Electronic Dreams',
        description: 'Música electrónica para soñar despierto',
        artist: 'Digital Waves',
        genre: AudioGenre.ELECTRONIC,
        audioUrl: 'https://example.com/audio/electronic-dreams.mp3',
        duration: 3600, // 1 hora
        format: AudioFormat.MP3,
        bitrate: 320,
        price: 12.99,
        stock: 150,
        isActive: true,
        tags: ['electronic', 'ambient', 'dreamy'],
        releaseDate: new Date('2024-01-20'),
        language: 'en',
        isExplicit: false,
        ageRestriction: AgeRestriction.ALL_AGES,
        playCount: 0,
        downloadCount: 0,
      },
    ];

    for (const audioProductData of audioProducts) {
      const existingProduct = await audioProductRepository.findOne({
        where: { title: audioProductData.title, artist: audioProductData.artist }
      });

      if (!existingProduct) {
        const audioProduct = new AudioProductEntity();
        Object.assign(audioProduct, audioProductData);
        await audioProductRepository.save(audioProduct);
        console.log(`✅ Audio product created: ${audioProductData.title}`);
      } else {
        console.log(`⏭️  Audio product already exists: ${audioProductData.title}`);
      }
    }
  }
}
