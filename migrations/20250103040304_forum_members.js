/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable('forum_members', function (table) {
        table.increments('id').primary();
        table.integer('forum_id').unsigned().notNullable();
        table.integer('user_id').unsigned().notNullable();
        table.timestamp('joined_at').defaultTo(knex.fn.now());
        table.datetime('out_at').nullable();
        table.datetime('deleted_at').nullable();

        table.foreign('forum_id').references('id').inTable('forums');
        table.foreign('user_id').references('id').inTable('users');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTable('forum_members');
};
