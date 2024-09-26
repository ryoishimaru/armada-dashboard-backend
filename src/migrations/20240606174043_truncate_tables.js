/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.raw(`DROP PROCEDURE IF EXISTS truncate_tables`)
    .then(() => {
      return knex.raw(`CREATE DEFINER=root@localhost PROCEDURE truncate_tables()
          BEGIN 
          -- Disable foreign key constraints
          SET FOREIGN_KEY_CHECKS = 0;
  
          -- Truncate tables
          TRUNCATE TABLE users;
          TRUNCATE TABLE tasks;
  
          -- Re-enable foreign key constraints
          SET FOREIGN_KEY_CHECKS = 1;
          END`);
    });
};
  
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.raw(`DROP PROCEDURE truncate_tables`);  
};
  