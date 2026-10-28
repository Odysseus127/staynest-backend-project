import { pool } from "../config/db.js";
import { verifyToken } from "../utils/jwt.js";

export async function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ error: "Authentication required" });
  }

  let tokenUser;
  try {
    tokenUser = verifyToken(token);
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }

  if (!Number.isSafeInteger(tokenUser.id) || tokenUser.id < 1) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }

  try {
    const [users] = await pool.query(
      "SELECT id, email, role FROM users WHERE id = ?",
      [tokenUser.id]
    );
    if (users.length === 0) {
      return res.status(401).json({ error: "User account no longer exists" });
    }

    req.user = users[0];
    next();
  } catch (err) {
    next(err);
  }
}

export function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== "ADMIN") {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
}