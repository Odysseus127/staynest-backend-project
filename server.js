import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { testConnection } from "./src/config/db.js";

import hotelRoutes, { roomsRouter } from "./src/routes/hotel.routes.js";
import authRoutes from "./src/routes/auth.routes.js";
import bookingRoutes from "./src/routes/booking.routes.js";
import adminRoutes from "./src/routes/admin.routes.js";
import { errorHandler } from "./src/middleware/errorHandler.js";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 5000;

// ---------- Middleware ----------
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

// ---------- Static files (hotel images) ----------
app.use("/images", express.static(path.join(__dirname, "public/images")));

// ---------- Health check ----------
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "StayNest API is running" });
});

//hotel + room API routes
app.use("/api/hotels", hotelRoutes);
app.use("/api/rooms", roomsRouter);

//auth API routes
app.use("/api/auth", authRoutes);

//booking API routes
app.use("/api/bookings", bookingRoutes);

//admin API routes
app.use("/api/admin", adminRoutes);

//Error handling 
app.use(errorHandler);

//Start server
async function start() {
  await testConnection();
  app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
  });
}

start();