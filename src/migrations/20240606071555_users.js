/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable("users", function (table) {
      table.increments("id").comment("primary key");
      table.string("firstName", 60).notNullable();
      table.string("lastName", 60).notNullable();
      table.string('deviceId',100).nullable().comment('unique device id');
      table.string('deviceToken',500).nullable().comment('FCM token use from notification');
      table.tinyint('deviceType',1).nullable().comment('1:Android, 2:IOS, 3:Web');
      table.string("email", 100).notNullable();
      table.string("password", 100).notNullable();
      table.dateTime("createdAt").notNullable();
    });
};
  
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
*/
exports.down = function (knex) {
    return knex.schema.dropTable("users");
};  