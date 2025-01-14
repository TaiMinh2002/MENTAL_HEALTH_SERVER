/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable('mood_entries', function (table) {
        table.increments('id').primary();
        table.integer('user_id').unsigned().notNullable();
        table.text('note');
        table.string('date', 255).notNullable();
        table.timestamps(true, true);
        table.datetime('deleted_at').nullable();

        table.foreign('user_id').references('id').inTable('users');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTable('mood_entries');
};
