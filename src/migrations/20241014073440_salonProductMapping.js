/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable("salonProductMapping", function (table) {
      table.increments("id").comment("primary key");
      table
      .integer("salonId", 10)
      .unsigned()
      .notNullable()
      .references("salon.id")
      .onDelete("CASCADE")
      .comment("FK->salon.id");
      table
      .integer("productId", 10)
      .unsigned()
      .notNullable()
      .references("product.id")
      .onDelete("CASCADE")
      .comment("FK->product.id");
      table.dateTime("createdAt").notNullable();
    });
};
  
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
*/
exports.down = function (knex) {
    return knex.schema.dropTable("salonProductMapping");
};