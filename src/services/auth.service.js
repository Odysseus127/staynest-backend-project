import { pool } from "../config/db.js";
import { hashPassword, verifyPassword } from "../utils/hash.js";

export async function createUser({ name, email, password, phone }) {
  // Check for existing user
  const [existing] = await pool.query(
    "SELECT id FROM users WHERE email = ?",
    [email]
  );
  if (existing.length > 0) {
    const err = new Error("Email already registered");
    err.status = 409;
    throw err;
  }

  const passwordHash = await hashPassword(password);
  const [result] = await pool.query(
    `INSERT INTO users (name, email, password_hash, phone, role)
     VALUES (?, ?, ?, ?, 'USER')`,
    [name, email, passwordHash, phone || null]
  );

  return {
    id: result.insertId,
    name,
    email,
    phone: phone || null,
    role: "USER",
  };
}

export async function authenticate({ email, password }) {
  const [rows] = await pool.query(
    `SELECT id, name, email, phone, role, password_hash AS passwordHash
     FROM users WHERE email = ?`,
    [email]
  );
  if (rows.length === 0) {
    const err = new Error("Invalid email or password");
    err.status = 401;
    throw err;
  }

  const user = rows[0];
  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) {
    const err = new Error("Invalid email or password");
    err.status = 401;
    throw err;
  }

  delete user.passwordHash; // never return the hash
  return user;
}

export async function getUserById(id) {
  const [rows] = await pool.query(
    `SELECT id, name, email, phone, role, created_at AS createdAt
     FROM users WHERE id = ?`,
    [id]
  );
  return rows[0] || null;
}