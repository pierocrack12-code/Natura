const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',  
    database: 'plantas_medicinales',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Probar conexión
(async () => {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Conexión a MySQL exitosa');
        connection.release();
    } catch (error) {
        console.error('❌ Error de conexión a MySQL:', error.message);
    }
})();

module.exports = pool;