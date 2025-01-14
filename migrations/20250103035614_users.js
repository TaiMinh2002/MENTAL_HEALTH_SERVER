/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable('users', function (table) {
        table.increments('id').primary();
        table.integer('expert_id').unique().nullable();
        table.string('avatar', 255);
        table.string('username', 255);
        table.string('email', 255).unique();
        table.string('phone_number', 255);
        table.string('password', 255).notNullable();
        table.tinyint('status').notNullable().defaultTo(1);
        table.tinyint('is_professional_request').nullable();
        table.tinyint('gender', 4).nullable();
        table.integer('age').nullable();
        table.tinyint('mood', 4).nullable();
        table.tinyint('sleep', 4).nullable();
        table.tinyint('stress', 4).nullable();
        table.tinyint('role', 4).nullable();
        table.datetime('email_verified_at').nullable();
        table.timestamps(true, true);
        table.datetime('deleted_at').nullable();
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTable('users');
};
