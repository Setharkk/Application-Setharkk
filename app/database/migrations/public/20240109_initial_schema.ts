import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema
    .createTable('users', (table: Knex.CreateTableBuilder) => {
      table.increments('id').primary();
      table.string('email').notNullable().unique();
      table.string('password_hash').notNullable();
      table.string('first_name');
      table.string('last_name');
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
    })
    .createTable('audit_logs', (table: Knex.CreateTableBuilder) => {
      table.increments('id').primary();
      table.integer('user_id').references('id').inTable('users');
      table.string('action').notNullable();
      table.jsonb('details');
      table.timestamp('created_at').defaultTo(knex.fn.now());
    });

  await knex.raw(`
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = CURRENT_TIMESTAMP;
      RETURN NEW;
    END;
    $$ language 'plpgsql';
  `);

  await knex.raw(`
    CREATE TRIGGER update_users_updated_at
      BEFORE UPDATE ON users
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema
    .raw('DROP TRIGGER IF EXISTS update_users_updated_at ON users')
    .raw('DROP FUNCTION IF EXISTS update_updated_at_column')
    .dropTableIfExists('audit_logs')
    .dropTableIfExists('users');
} 