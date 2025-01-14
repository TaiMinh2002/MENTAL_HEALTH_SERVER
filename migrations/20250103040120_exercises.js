/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable('exercises', function (table) {
        table.increments('id').primary();
        table.string('title', 255).notNullable();
        table.text('description');
        table.tinyint('type').notNullable();
        table.string('content', 255);
        table.string('media_url', 255);
        table.string('thumbnail_url', 255);
        table.timestamps(true, true);
        table.datetime('deleted_at').nullable();
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTable('exercises');
};
