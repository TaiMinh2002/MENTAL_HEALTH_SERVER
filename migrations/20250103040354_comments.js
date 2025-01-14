/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable('comments', function (table) {
        table.increments('id').primary();
        table.integer('post_id').unsigned().notNullable();
        table.integer('user_id').unsigned().notNullable();
        table.text('content');
        table.string('images', 255);
        table.timestamps(true, true);
        table.datetime('deleted_at').nullable();

        table.foreign('post_id').references('id').inTable('posts');
        table.foreign('user_id').references('id').inTable('users');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTable('comments');
};
