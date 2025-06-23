const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,// Attendre les connexions
    connectionLimit: 20, // Limite le nombre de connexions simultanées
    queueLimit: 0// Pas de limite de file d'attente sur les connexions
});

module.exports = pool.promise();