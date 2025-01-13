import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    // Table des journaux d'accès de l'assistant (uniquement pour l'audit)
    await knex.schema.createTable('assistant_access_logs', table => {
        table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
        table.uuid('assistant_id').notNullable();
        table.string('action').notNullable();
        table.string('resource').notNullable();
        table.jsonb('details');
        table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());

        table.index(['assistant_id', 'created_at']);
        table.index(['resource', 'action']);
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable('assistant_access_logs');
} 