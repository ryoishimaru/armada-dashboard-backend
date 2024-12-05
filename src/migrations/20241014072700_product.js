/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('product', (table) => {
    table.increments('id').comment('primary key');
    table.string('name', 100).notNullable();
    table.string('detailedName', 150).notNullable();
    table.decimal('minPrice', 10, 2).notNullable();
    table.decimal('maxPrice', 10, 2).notNullable();
    table.decimal('askingPrice', 10, 2).notNullable();
    table.string('productCategory', 100).notNullable();
    table.string('htmlFileName', 100).notNullable();
    table.dateTime('createdAt').notNullable();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable('product');
};
