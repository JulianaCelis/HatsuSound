import { DataSource } from 'typeorm';
import { MainSeed } from './main.seed';
import { config } from 'dotenv';

// Cargar variables de entorno
config();

async function runSeeds() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'hatsusound',
    entities: [__dirname + '/../entities/*.entity{.ts,.js}'],
    synchronize: false,
    logging: true,
  });

  try {
    await dataSource.initialize();
    console.log('📡 Database connection established');

    const mainSeed = new MainSeed(dataSource);
    await mainSeed.run();

    console.log('✅ Seeding completed successfully');
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  } finally {
    await dataSource.destroy();
    console.log('🔌 Database connection closed');
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  runSeeds();
}

export { runSeeds };
