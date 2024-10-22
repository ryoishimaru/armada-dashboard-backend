/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable("product_images_mapping", function (table) {
        table.increments('id').comment('primary key');
        table
        .integer("productId", 10)
        .unsigned()
        .notNullable()
        .references("product.id")
        .onDelete("CASCADE")
        .comment("FK->product.id");
        table.varchar('image',100).notNullable();
        table.datetime('createdAt').notNullable();
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTable('product_images_mapping');
};