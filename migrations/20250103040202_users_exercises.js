/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable('user_exercises', function (table) {
        table.increments('id').primary();
        table.integer('user_id').unsigned().notNullable();
        table.integer('exercise_id').unsigned().notNullable();
        table.tinyint('status').notNullable();
        table.string('date_completed', 255);
        table.timestamps(true, true);
        table.datetime('deleted_at').nullable();

        table.foreign('user_id').references('id').inTable('users');
        table.foreign('exercise_id').references('id').inTable('exercises');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTable('user_exercises');
};
