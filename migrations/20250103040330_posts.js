/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable('posts', function (table) {
        table.increments('id').primary();
        table.integer('forum_id').unsigned().notNullable();
        table.integer('user_id').unsigned().notNullable();
        table.text('title').notNullable();
        table.text('content');
        table.integer('like_count').defaultTo(0);
        table.integer('comment_count').defaultTo(0);
        table.timestamps(true, true);
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
    return knex.schema.dropTable('posts');
};
