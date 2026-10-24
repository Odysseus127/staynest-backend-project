import { pool } from "../config/db.js";


/* DASHBOARD STATS*/

export async function getDashboardStats() {
  const [[{ hotels }]] = await pool.query("SELECT COUNT(*) AS hotels FROM hotels");
  const [[{ rooms }]] = await pool.query("SELECT COUNT(*) AS rooms FROM room_types");
  const [[{ users }]] = await pool.query(
    "SELECT COUNT(*) AS users FROM users WHERE role = 'USER'"
  );
  const [[{ bookings }]] = await pool.query("SELECT COUNT(*) AS bookings FROM bookings");

  const [statusRows] = await pool.query(
    "SELECT status, COUNT(*) AS count FROM bookings GROUP BY status"
  );
  const statusCounts = Object.fromEntries(statusRows.map((r) => [r.status, r.count]));

  const [[{ revenue }]] = await pool.query(
    `SELECT COALESCE(SUM(total_amount), 0) AS revenue FROM bookings
     WHERE status IN ('CONFIRMED','CHECKED_IN','COMPLETED')`
  );

  const today = new Date().toISOString().slice(0, 10);

  const [[{ checkinsToday }]] = await pool.query(
    `SELECT COUNT(*) AS checkinsToday FROM bookings
     WHERE check_in = ? AND status IN ('CONFIRMED','CHECKED_IN')`,
    [today]
  );

  const [[{ checkoutsToday }]] = await pool.query(
    `SELECT COUNT(*) AS checkoutsToday FROM bookings
     WHERE check_out = ? AND status = 'CHECKED_IN'`,
    [today]
  );

  const [recentRows] = await pool.query(
    `SELECT b.id, b.status, b.check_in AS checkIn, b.check_out AS checkOut,
            b.total_amount AS totalAmount, b.created_at AS createdAt,
            u.name AS userName, h.name AS hotelName
     FROM bookings b
     JOIN users u ON b.user_id = u.id
     JOIN hotels h ON b.hotel_id = h.id
     ORDER BY b.created_at DESC
     LIMIT 5`
  );

  return {
    totals: {
      hotels,
      rooms,
      users,
      bookings,
      revenue: Number(revenue),
    },
    byStatus: {
      pending: statusCounts.PENDING || 0,
      confirmed: statusCounts.CONFIRMED || 0,
      checkedIn: statusCounts.CHECKED_IN || 0,
      completed: statusCounts.COMPLETED || 0,
      cancelled: statusCounts.CANCELLED || 0,
    },
    today: { checkinsToday, checkoutsToday },
    recentBookings: recentRows,
  };
}

/* LIST ALL BOOKINGS (filters + pagination)*/
export async function listAllBookings({
  status, hotelId, userId, from, to, page = 1, limit = 20,
}) {
  const where = [];
  const params = [];

  if (status)   { where.push("b.status = ?");   params.push(status); }
  if (hotelId)  { where.push("b.hotel_id = ?"); params.push(Number(hotelId)); }
  if (userId)   { where.push("b.user_id = ?");  params.push(Number(userId)); }
  if (from)     { where.push("b.check_in >= ?"); params.push(from); }
  if (to)       { where.push("b.check_out <= ?"); params.push(to); }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const offset = (Number(page) - 1) * Number(limit);

  const [rows] = await pool.query(
    `SELECT b.id, b.user_id AS userId, u.name AS userName, u.email AS userEmail,
            b.check_in AS checkIn, b.check_out AS checkOut, b.guests,
            b.total_amount AS totalAmount, b.status, b.created_at AS createdAt,
            h.id AS hotelId, h.name AS hotelName, h.slug AS hotelSlug,
            rt.name AS roomTypeName
     FROM bookings b
     JOIN users u ON b.user_id = u.id
     JOIN hotels h ON b.hotel_id = h.id
     JOIN room_types rt ON b.room_type_id = rt.id
     ${whereSql}
     ORDER BY b.created_at DESC
     LIMIT ? OFFSET ?`,
    [...params, Number(limit), offset]
  );

  const [[{ total }]] = await pool.query(
    `SELECT COUNT(*) AS total FROM bookings b ${whereSql}`,
    params
  );

  return {
    bookings: rows,
    page: Number(page),
    limit: Number(limit),
    total,
    totalPages: Math.ceil(total / limit),
  };
}

/* LIST USERS */
export async function listAllUsers({ role, page = 1, limit = 20 }) {
  const where = [];
  const params = [];
  if (role) { where.push("role = ?"); params.push(role); }
  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const offset = (Number(page) - 1) * Number(limit);

  const [rows] = await pool.query(
    `SELECT id, name, email, phone, role, created_at AS createdAt
     FROM users ${whereSql}
     ORDER BY created_at DESC
     LIMIT ? OFFSET ?`,
    [...params, Number(limit), offset]
  );

  const [[{ total }]] = await pool.query(
    `SELECT COUNT(*) AS total FROM users ${whereSql}`,
    params
  );

  return {
    users: rows,
    page: Number(page),
    limit: Number(limit),
    total,
    totalPages: Math.ceil(total / limit),
  };
}

/* UPDATE BOOKING STATUS (admin override)*/
export async function updateBookingStatus(id, newStatus) {
  const allowed = ["PENDING", "CONFIRMED", "CHECKED_IN", "COMPLETED", "CANCELLED"];
  if (!allowed.includes(newStatus)) {
    throw httpError(400, `Invalid status. Must be one of: ${allowed.join(", ")}`);
  }

  const [result] = await pool.query(
    "UPDATE bookings SET status = ? WHERE id = ?",
    [newStatus, id]
  );
  if (result.affectedRows === 0) throw httpError(404, "Booking not found");

  return { id, status: newStatus };
}

/* HOTEL CRUD  */
export async function createHotel(data) {
  const [result] = await pool.query(
    `INSERT INTO hotels
      (name, slug, city, address, description, rating, price_from, cover_image, gallery)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.name, data.slug, data.city, data.address,
      data.description || null, data.rating || 0, data.priceFrom || 0,
      data.coverImage || null,
      data.gallery ? JSON.stringify(data.gallery) : null,
    ]
  );
  return { id: result.insertId, ...data };
}

export async function updateHotel(id, data) {
  const map = {
    name: "name", slug: "slug", city: "city", address: "address",
    description: "description", rating: "rating",
    priceFrom: "price_from", coverImage: "cover_image",
  };
  const fields = [];
  const params = [];

  for (const [key, col] of Object.entries(map)) {
    if (data[key] !== undefined) { fields.push(`${col} = ?`); params.push(data[key]); }
  }
  if (data.gallery !== undefined) {
    fields.push("gallery = ?");
    params.push(JSON.stringify(data.gallery));
  }
  if (fields.length === 0) throw httpError(400, "No fields to update");

  params.push(id);
  const [result] = await pool.query(
    `UPDATE hotels SET ${fields.join(", ")} WHERE id = ?`,
    params
  );
  if (result.affectedRows === 0) throw httpError(404, "Hotel not found");
  return { id };
}

export async function deleteHotel(id) {
  const [[{ count }]] = await pool.query(
    `SELECT COUNT(*) AS count FROM bookings
     WHERE hotel_id = ? AND status IN ('PENDING','CONFIRMED','CHECKED_IN')`,
    [id]
  );
  if (count > 0) {
    throw httpError(409, `Cannot delete hotel with ${count} active booking(s)`);
  }
  const [result] = await pool.query("DELETE FROM hotels WHERE id = ?", [id]);
  if (result.affectedRows === 0) throw httpError(404, "Hotel not found");
  return { id };
}

/* ROOM TYPE CRUD */
export async function createRoomType(data) {
  const [result] = await pool.query(
    `INSERT INTO room_types
      (hotel_id, name, description, capacity, base_price, total_rooms, image_url)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      data.hotelId, data.name, data.description || null,
      data.capacity || 2, data.basePrice,
      data.totalRooms || 1, data.imageUrl || null,
    ]
  );
  return { id: result.insertId, ...data };
}

export async function updateRoomType(id, data) {
  const map = {
    name: "name", description: "description", capacity: "capacity",
    basePrice: "base_price", totalRooms: "total_rooms", imageUrl: "image_url",
  };
  const fields = [];
  const params = [];

  for (const [key, col] of Object.entries(map)) {
    if (data[key] !== undefined) { fields.push(`${col} = ?`); params.push(data[key]); }
  }
  if (fields.length === 0) throw httpError(400, "No fields to update");

  params.push(id);
  const [result] = await pool.query(
    `UPDATE room_types SET ${fields.join(", ")} WHERE id = ?`,
    params
  );
  if (result.affectedRows === 0) throw httpError(404, "Room type not found");
  return { id };
}

export async function deleteRoomType(id) {
  const [[{ count }]] = await pool.query(
    `SELECT COUNT(*) AS count FROM bookings
     WHERE room_type_id = ? AND status IN ('PENDING','CONFIRMED','CHECKED_IN')`,
    [id]
  );
  if (count > 0) {
    throw httpError(409, `Cannot delete room type with ${count} active booking(s)`);
  }
  const [result] = await pool.query("DELETE FROM room_types WHERE id = ?", [id]);
  if (result.affectedRows === 0) throw httpError(404, "Room type not found");
  return { id };
}

function httpError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}