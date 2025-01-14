/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable('user_expert_messages', function (table) {
        table.increments('id').primary();
        table.integer('chat_id').unsigned().notNullable();
        table.integer('sender_id').unsigned().notNullable();
        table.integer('receiver_id').unsigned().notNullable();
        table.text('message').notNullable();
        table.timestamps(true, true);

        table.foreign('chat_id').references('id').inTable('user_expert_chats').onDelete('CASCADE');
        table.foreign('sender_id').references('id').inTable('users').onDelete('CASCADE');
        table.foreign('receiver_id').references('id').inTable('users').onDelete('CASCADE');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTable('user_expert_messages');
};
