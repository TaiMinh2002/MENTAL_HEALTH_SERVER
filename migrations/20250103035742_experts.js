/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable('experts', function (table) {
        table.increments('id').primary();
        table.string('name', 255).notNullable();
        table.tinyint('specialization').notNullable();
        table.text('bio');
        table.string('contact_info', 255);
        table.string('phone_number', 255);
        table.string('avatar', 255);
        table.timestamps(true, true);
        table.datetime('deleted_at').nullable();
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTable('experts');
};
