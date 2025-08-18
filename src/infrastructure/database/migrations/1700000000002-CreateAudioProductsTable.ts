import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateAudioProductsTable1700000000002 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'audio_products',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'title',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'artist',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'genre',
            type: 'enum',
            enum: ['rock', 'pop', 'jazz', 'classical', 'electronic', 'hip_hop', 'country', 'blues', 'reggae', 'folk', 'other'],
            isNullable: false,
          },
          {
            name: 'audio_url',
            type: 'varchar',
            length: '500',
            isNullable: false,
          },
          {
            name: 'duration',
            type: 'integer',
            isNullable: false,
            comment: 'Duration in seconds',
          },
          {
            name: 'format',
            type: 'enum',
            enum: ['mp3', 'wav', 'flac', 'aac', 'ogg'],
            isNullable: false,
          },
          {
            name: 'bitrate',
            type: 'integer',
            isNullable: false,
            comment: 'Bitrate in kbps',
          },
          {
            name: 'price',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: false,
            default: 0,
          },
          {
            name: 'stock',
            type: 'integer',
            isNullable: false,
            default: 0,
          },
          {
            name: 'is_active',
            type: 'boolean',
            isNullable: false,
            default: true,
          },
          {
            name: 'tags',
            type: 'text[]',
            isNullable: false,
          },
          {
            name: 'release_date',
            type: 'timestamp',
            isNullable: false,
          },
          {
            name: 'language',
            type: 'varchar',
            length: '10',
            isNullable: false,
            default: "'en'",
          },
          {
            name: 'is_explicit',
            type: 'boolean',
            isNullable: false,
            default: false,
          },
          {
            name: 'age_restriction',
            type: 'integer',
            isNullable: false,
            default: 0,
            comment: 'Minimum age required: 0=all ages, 13=teen, 18=adult, 21=mature',
          },
          {
            name: 'play_count',
            type: 'integer',
            isNullable: false,
            default: 0,
          },
          {
            name: 'download_count',
            type: 'integer',
            isNullable: false,
            default: 0,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            isNullable: false,
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            isNullable: false,
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Crear índices para mejorar el rendimiento
    await queryRunner.createIndex(
      'audio_products',
      new TableIndex({
        name: 'IDX_AUDIO_PRODUCTS_TITLE_ARTIST',
        columnNames: ['title', 'artist'],
        isUnique: true,
      }),
    );

    await queryRunner.createIndex(
      'audio_products',
      new TableIndex({
        name: 'IDX_AUDIO_PRODUCTS_GENRE',
        columnNames: ['genre'],
      }),
    );

    await queryRunner.createIndex(
      'audio_products',
      new TableIndex({
        name: 'IDX_AUDIO_PRODUCTS_ARTIST',
        columnNames: ['artist'],
      }),
    );

    await queryRunner.createIndex(
      'audio_products',
      new TableIndex({
        name: 'IDX_AUDIO_PRODUCTS_PRICE',
        columnNames: ['price'],
      }),
    );

    await queryRunner.createIndex(
      'audio_products',
      new TableIndex({
        name: 'IDX_AUDIO_PRODUCTS_ACTIVE',
        columnNames: ['is_active'],
      }),
    );

    await queryRunner.createIndex(
      'audio_products',
      new TableIndex({
        name: 'IDX_AUDIO_PRODUCTS_RELEASE_DATE',
        columnNames: ['release_date'],
      }),
    );

    await queryRunner.createIndex(
      'audio_products',
      new TableIndex({
        name: 'IDX_AUDIO_PRODUCTS_PLAY_COUNT',
        columnNames: ['play_count'],
      }),
    );

    await queryRunner.createIndex(
      'audio_products',
      new TableIndex({
        name: 'IDX_AUDIO_PRODUCTS_DOWNLOAD_COUNT',
        columnNames: ['download_count'],
      }),
    );

    // Establecer valor por defecto para tags después de crear la tabla
    await queryRunner.query(`
      ALTER TABLE audio_products ALTER COLUMN tags SET DEFAULT '{}';
    `);

    // Crear índices GIN para arrays (tags)
    await queryRunner.query(`
      CREATE INDEX IDX_AUDIO_PRODUCTS_TAGS ON audio_products USING GIN (tags);
    `);

    // Crear índices para búsquedas de texto
    await queryRunner.query(`
      CREATE INDEX IDX_AUDIO_PRODUCTS_TITLE_SEARCH ON audio_products USING GIN (to_tsvector('english', title));
    `);

    await queryRunner.query(`
      CREATE INDEX IDX_AUDIO_PRODUCTS_DESCRIPTION_SEARCH ON audio_products USING GIN (to_tsvector('english', description));
    `);

    await queryRunner.query(`
      CREATE INDEX IDX_AUDIO_PRODUCTS_ARTIST_SEARCH ON audio_products USING GIN (to_tsvector('english', artist));
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('audio_products');
  }
}
