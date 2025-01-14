/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable('conversations', function (table) {
        table.increments('id').primary();
        table.integer('user_id').unsigned().notNullable();
        table.text('user_message').notNullable();
        table.text('bot_reply').notNullable();
        table.timestamps(true, true);

        table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTable('conversations');
};
