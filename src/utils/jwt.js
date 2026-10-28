import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const SECRET = process.env.JWT_SECRET;
const EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";


if (!SECRET || Buffer.byteLength(SECRET) < 32) {
  throw new Error("JWT_SECRET must be set to a random value of at least 32 bytes");
}

export function signToken(payload) {
  return jwt.sign(payload, SECRET, { algorithm: "HS256", expiresIn: EXPIRES_IN });
}

export function verifyToken(token) {
  return jwt.verify(token, SECRET, { algorithms: ["HS256"] });
}