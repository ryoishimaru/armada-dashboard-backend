/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.alterTable('salonProductMapping', function(table) {
      table.varchar('externalProductId',100).nullable().comment('Stores the product ID from the external system or third-party server for mapping with internal products').after('discountRateOnSubscription');
    });
};
  
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.alterTable('salonProductMapping', function(table) {
        table.dropColumn('externalProductId');
    });
};