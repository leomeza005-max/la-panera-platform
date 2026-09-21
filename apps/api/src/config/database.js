const mysql = require('mysql2/promise');
const path = require('path');

require('dotenv').config({
    path: path.resolve(__dirname, '../../.env')
});

const variablesObligatorias = [
    'DB_HOST',
    'DB_PORT',
    'DB_USER',
    'DB_PASSWORD',
    'DB_NAME'
];

const variablesFaltantes = variablesObligatorias.filter(
    (variable) => !process.env[variable]
);

if (variablesFaltantes.length > 0) {
    throw new Error(
        `Faltan variables de entorno: ${variablesFaltantes.join(', ')}`
    );
}

const puerto = Number(process.env.DB_PORT);

if (!Number.isInteger(puerto)) {
    throw new Error('DB_PORT debe ser un número válido');
}

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: puerto,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,

    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 60000,

    enableKeepAlive: true,
    keepAliveInitialDelay: 0,

    // Aiven exige una conexión con SSL.
    // Después se agregará el certificado CA para producción.
    ssl: {
        rejectUnauthorized: false
    }
});

async function probarConexion() {
    let connection;

    try {
        console.log(
            `[DB] Conectando a ${process.env.DB_HOST}:${puerto}/${process.env.DB_NAME}`
        );

        connection = await pool.getConnection();

        const [resultado] = await connection.query(`
            SELECT
                DATABASE() AS baseDatos,
                VERSION() AS version
        `);

        console.log('[DB] Conexión exitosa');
        console.log('[DB] Base de datos:', resultado[0].baseDatos);
        console.log('[DB] MySQL:', resultado[0].version);
    } catch (error) {
        console.error('[DB] Error de conexión:', error.code);
        console.error('[DB] Detalles:', error.message);
        throw error;
    } finally {
        if (connection) {
            connection.release();
        }
    }
}

if (require.main === module) {
    probarConexion()
        .then(() => pool.end())
        .catch(async () => {
            await pool.end();
            process.exitCode = 1;
        });
}

module.exports = pool;
