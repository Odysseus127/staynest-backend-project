import mysql from "mysql2/promise";
import dotenv from "dotenv";
import fs from 'fs';

dotenv.config();

const DB_PORT = Number(process.env.DB_PORT || 3306);
if (!Number.isInteger(DB_PORT) || DB_PORT < 1 || DB_PORT > 65535) {
  throw new Error("DB_PORT must be a valid TCP port number");
}

function buildSslConfig() {
  const caValue = process.env.DB_SSL_CA;
  const caPath = process.env.DB_SSL_CA_PATH;

  // If we are running locally (no env vars set), return undefined (no SSL)
  if (!caValue && !caPath) return undefined;

  // If running in production on Render, read the file and enable SSL
  const ca = caValue || fs.readFileSync(caPath, "utf8");

  return {
    ca,
    rejectUnauthorized: true, 
  };
}

export const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: buildSslConfig(),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 10000,
});

// Quick helper to test the connection
export async function testConnection() {
  try {
    const conn = await pool.getConnection();
    console.log("✅ MySQL connected successfully");
    conn.release();
  } catch (err) {
    console.error("❌ MySQL connection failed:", err.message);
    process.exit(1);
  }
}