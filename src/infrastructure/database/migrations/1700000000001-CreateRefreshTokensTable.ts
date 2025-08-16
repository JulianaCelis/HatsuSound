import { MigrationInterface, QueryRunner, Table, Index, ForeignKey } from 'typeorm';

export class CreateRefreshTokensTable1700000000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'refresh_tokens',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'token',
            type: 'varchar',
            length: '128',
            isUnique: true,
          },
          {
            name: 'user_id',
            type: 'uuid',
          },
          {
            name: 'expires_at',
            type: 'timestamp',
          },
          {
            name: 'is_revoked',
            type: 'boolean',
            default: false,
          },
          {
            name: 'ip_address',
            type: 'varchar',
            length: '45',
            isNullable: true,
          },
          {
            name: 'user_agent',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Crear índices usando SQL directo
    await queryRunner.query(
      'CREATE INDEX "IDX_REFRESH_TOKENS_TOKEN" ON "refresh_tokens" ("token")'
    );

    await queryRunner.query(
      'CREATE INDEX "IDX_REFRESH_TOKENS_USER_ID" ON "refresh_tokens" ("user_id")'
    );

    // Crear foreign key usando SQL directo
    await queryRunner.query(
      'ALTER TABLE "refresh_tokens" ADD CONSTRAINT "FK_REFRESH_TOKENS_USER_ID" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE'
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminar foreign key primero
    await queryRunner.query(
      'ALTER TABLE "refresh_tokens" DROP CONSTRAINT "FK_REFRESH_TOKENS_USER_ID"'
    );

    // Eliminar índices
    await queryRunner.query('DROP INDEX "IDX_REFRESH_TOKENS_USER_ID"');
    await queryRunner.query('DROP INDEX "IDX_REFRESH_TOKENS_TOKEN"');

    // Eliminar tabla
    await queryRunner.dropTable('refresh_tokens');
  }
}
