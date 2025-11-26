import mysql from 'mysql2/promise'

export const pool_vigitemp = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_SCHEMA_VIGITEMP,
    waitForConnections: true
})
export const pool_vigitemp_mesure = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_SCHEMA_VIGITEMP_MESURE,
    waitForConnections: true
})

// export default {pool_vigitemp, pool_vigitemp_mesure};