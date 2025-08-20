import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { UserEntity } from '../database/entities/user.entity';
import { RefreshTokenEntity } from '../database/entities/refresh-token.entity';
import { TransactionEntity } from '../database/entities/transaction.entity';
import { AudioProductEntity } from '../database/entities/audio-product.entity';

export const getTypeOrmConfig = (configService: ConfigService): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: configService.get('DB_HOST', 'localhost'),
  port: configService.get('DB_PORT', 5432),
  username: configService.get('DB_USER', 'postgres'),
  password: configService.get('DB_PASSWORD', 'password'),
  database: configService.get('DB_NAME', 'hatsusound'),
  entities: [UserEntity, RefreshTokenEntity, TransactionEntity, AudioProductEntity],
  synchronize: configService.get('NODE_ENV') === 'development',
  logging: configService.get('NODE_ENV') === 'development',
  ssl: configService.get('NODE_ENV') === 'production' ? { rejectUnauthorized: false } : false,
  autoLoadEntities: true,
  keepConnectionAlive: true,
  retryAttempts: 3,
  retryDelay: 3000,
});
