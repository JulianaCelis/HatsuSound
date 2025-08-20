import { DataSource } from 'typeorm';
import { AudioProductsSeed } from './audio-products.seed';

export class MainSeed {
  constructor(private dataSource: DataSource) {}

  async run() {
    console.log('🚀 Starting main seed process...');
    
    try {
      // Ejecutar seeders en orden
      const audioProductsSeed = new AudioProductsSeed(this.dataSource);
      await audioProductsSeed.run();
      
      console.log('🎉 All seeds completed successfully!');
    } catch (error) {
      console.error('❌ Error during seeding:', error);
      throw error;
    }
  }
}
