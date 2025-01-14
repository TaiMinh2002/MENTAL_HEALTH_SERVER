/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable('post_images', function (table) {
        table.increments('id').primary();
        table.integer('post_id').unsigned().notNullable();
        table.string('image', 255).notNullable();
        table.timestamps(true, true);
        table.datetime('deleted_at').nullable();

        table.foreign('post_id').references('id').inTable('posts').onDelete('CASCADE');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTable('post_images');
};
