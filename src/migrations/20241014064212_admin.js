/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable("superAdmin", function (table) {
      table.increments("id").comment("primary key");
      table.string("email", 100).notNullable();
      table.string("password", 100).notNullable();
      table.string("forgotPassCode", 10).nullable();
      table.dateTime("createdAt").notNullable();
    });
};
  
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
*/
exports.down = function (knex) {
    return knex.schema.dropTable("superAdmin");
};