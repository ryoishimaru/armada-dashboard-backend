/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
const DateTimeUtil = require("../utils/DateTimeUtil");
const DateTimeUtilObj = new DateTimeUtil();

exports.seed = async function(knex) {
  const currentTime = DateTimeUtilObj.getCurrentTimeObjForDB();
  // Deletes ALL existing entries
  await knex('superAdmin').del()
  await knex('superAdmin').insert([
    {email:'admin@armada.com', password: process.env.ADMIN_DEFAULT_PASSWORD, createdAt: currentTime},
  ]);
};