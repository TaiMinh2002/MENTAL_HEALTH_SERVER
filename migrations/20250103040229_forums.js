/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable('forums', function (table) {
        table.increments('id').primary();
        table.string('title', 255).notNullable();
        table.string('description', 255);
        table.string('cover_image', 255);
        table.integer('member_count').defaultTo(0);
        table.integer('post_count').defaultTo(0);
        table.integer('created_user_id').unsigned().notNullable();
        table.timestamps(true, true);
        table.datetime('deleted_at').nullable();

        table.foreign('created_user_id').references('id').inTable('users');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTable('forums');
};
