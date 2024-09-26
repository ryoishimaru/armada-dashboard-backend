// Update with your config settings.
require('dotenv').config()
module.exports = {

    development: {
        client: process.env.DB_CLIENT,
        connection: {
            host: process.env.DB_HOST,
            database: process.env.DB_NAME,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            charset: process.env.DB_CHARSET,
            timezone: process.env.DB_TIMEZONE
        },
        pool: {
            min: 2,
            max: 10
        },
        migrations: {
            tableName: 'knex_migrations',
            directory: "./src/migrations",

        },
        seeds: {
            directory: "./src/seeds",

        }
    }

};