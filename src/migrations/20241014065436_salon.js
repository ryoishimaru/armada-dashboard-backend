/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable("salon", function (table) {
      table.increments("id").comment("primary key");
      table.string("salonCode", 30).notNullable();
      table.string("email", 100).notNullable();
      table.string("password", 100).notNullable();
      table.string("resetToken", 255).nullable();
      table.dateTime("createdAt").notNullable();
    });
};
  
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
*/
exports.down = function (knex) {
    return knex.schema.dropTable("salon");
};