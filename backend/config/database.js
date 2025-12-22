require('dotenv').config();
const mysql = require('mysql2/promise');

// Configuration qui fonctionne en local ET sur Azure
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'gymdb',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT) || 10,
    queueLimit: parseInt(process.env.DB_QUEUE_LIMIT) || 0,
    
    // SSL requis pour Azure MySQL (ignoré en local si undefined)
    ...(process.env.DB_HOST && process.env.DB_HOST.includes('azure.com') && {
        ssl: {
            rejectUnauthorized: false
        }
    })
});

// Test de connexion au démarrage
pool.getConnection()
    .then(connection => {
        console.log(' Connexion MySQL réussie');
        console.log(`  Base de données: ${process.env.DB_NAME || 'gymdb'}`);
        console.log(`  Environnement: ${process.env.NODE_ENV || 'development'}`);
        connection.release();
    })
    .catch(err => {
        console.error(' Erreur de connexion MySQL:', err.message);
        console.error('Vérifiez vos variables d\'environnement');
    });

module.exports = pool;