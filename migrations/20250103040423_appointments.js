/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable('appointments', function (table) {
        table.increments('id').primary();
        table.integer('user_id').unsigned().notNullable();
        table.integer('expert_id').unsigned().notNullable();
        table.timestamp('appointment_time').notNullable();
        table.tinyint('status').notNullable();
        table.timestamps(true, true);
        table.datetime('deleted_at').nullable();

        table.foreign('user_id').references('id').inTable('users');
        table.foreign('expert_id').references('id').inTable('experts');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTable('appointments');
};
