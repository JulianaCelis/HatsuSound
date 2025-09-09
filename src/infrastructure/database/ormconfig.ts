import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { UserEntity } from './entities/user.entity';
import { AudioProductEntity } from './entities/audio-product.entity';
import { TransactionEntity } from './entities/transaction.entity';
import { RefreshTokenEntity } from './entities/refresh-token.entity';

config();

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_DATABASE || 'hatsusound',
  entities: [UserEntity, AudioProductEntity, TransactionEntity, RefreshTokenEntity],
  migrations: [__dirname + '/migrations/*.ts'],
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});
