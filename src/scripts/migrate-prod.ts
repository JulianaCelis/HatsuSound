import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { Logger } from '@nestjs/common';

// Importar todas las entidades
import { UserEntity } from '../infrastructure/database/entities/user.entity';
import { AudioProductEntity } from '../infrastructure/database/entities/audio-product.entity';
import { TransactionEntity } from '../infrastructure/database/entities/transaction.entity';
import { RefreshTokenEntity } from '../infrastructure/database/entities/refresh-token.entity';

config();

const logger = new Logger('MigrationScript');

async function runMigrations() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_DATABASE || 'hatsusound',
    entities: [UserEntity, AudioProductEntity, TransactionEntity, RefreshTokenEntity],
    migrations: [__dirname + '/../infrastructure/database/migrations/*.ts'],
    synchronize: false,
    logging: false,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });

  try {
    logger.log('🔌 Connecting to database...');
    await dataSource.initialize();
    
    logger.log('📊 Running migrations...');
    const migrations = await dataSource.runMigrations();
    
    if (migrations.length > 0) {
      logger.log(`✅ Applied ${migrations.length} migrations:`);
      migrations.forEach(migration => {
        logger.log(`   - ${migration.name}`);
      });
    } else {
      logger.log('✅ No pending migrations to apply');
    }
    
    logger.log('🎉 Database migration completed successfully!');
  } catch (error) {
    logger.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  runMigrations();
}

export { runMigrations };
