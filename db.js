const { Client } = require('db');

const URI = process.env.NODE_ENV === 'test' ? process.env.DB_URI_TEST : process.env.DB_URI;

const db = new Client({
    connectionString: URI
});

db.connect();

module.exports = db;

