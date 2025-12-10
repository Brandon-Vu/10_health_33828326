// models/db.js
const mysql = require('mysql2');

// Create a connection pool to the MySQL database
const pool = mysql.createPool({
  host: process.env.HEALTH_HOST,
  user: process.env.HEALTH_USER,
  password: process.env.HEALTH_PASSWORD,
  database: process.env.HEALTH_DATABASE
});

// Export the pool for use in other modules
module.exports = pool.promise();