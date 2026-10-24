import { pool } from "../config/db.js";


/* CREATE BOOKING (transaction + lock)*/
export async function createBooking({ userId, roomTypeId, checkIn, checkOut, guests }) {
  // ---- Basic validation (before touching DB) ----
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const ci = new Date(checkIn);
  const co = new Date(checkOut);

  if (Number.isNaN(ci.getTime()) || Number.isNaN(co.getTime())) {
    throw httpError(400, "Invalid dates");
  }
  if (co <= ci) {
    throw httpError(400, "Check-out must be after check-in");
  }
  if (ci < today) {
    throw httpError(400, "Check-in cannot be in the past");
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Lock the room type — this is the key to preventing double-booking
    const [roomRows] = await conn.query(
      `SELECT id, hotel_id, total_rooms, base_price, capacity
       FROM room_types WHERE id = ? FOR UPDATE`,
      [roomTypeId]
    );
    if (roomRows.length === 0) {
      throw httpError(404, "Room type not found");
    }
    const room = roomRows[0];

    if (guests > room.capacity) {
      throw httpError(400, `Room capacity is ${room.capacity} guests`);
    }

    // Count overlapping bookings
    const [bookedRows] = await conn.query(
      `SELECT COUNT(*) AS booked FROM bookings
       WHERE room_type_id = ?
         AND status IN ('PENDING', 'CONFIRMED', 'CHECKED_IN')
         AND check_in  < ?
         AND check_out > ?`,
      [roomTypeId, checkOut, checkIn]
    );
    const booked = bookedRows[0].booked;

    if (room.total_rooms - booked <= 0) {
      throw httpError(409, "No rooms available for the selected dates");
    }

    // Calculate total: nights × base_price
    const nights = Math.round(
      (co.getTime() - ci.getTime()) / (1000 * 60 * 60 * 24)
    );
    const totalAmount = Number(room.base_price) * nights;

    // Insert (status = CONFIRMED to skip payment for now)
    const [result] = await conn.query(
      `INSERT INTO bookings
        (user_id, hotel_id, room_type_id, check_in, check_out, guests, total_amount, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'CONFIRMED')`,
      [userId, room.hotel_id, roomTypeId, checkIn, checkOut, guests, totalAmount]
    );

    await conn.commit();

    return {
      id: result.insertId,
      userId,
      hotelId: room.hotel_id,
      roomTypeId,
      checkIn,
      checkOut,
      guests,
      nights,
      totalAmount,
      status: "CONFIRMED",
    };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}


/* LIST USER'S BOOKINGS*/
export async function getUserBookings(userId) {
  const [rows] = await pool.query(
    `SELECT b.id, b.check_in AS checkIn, b.check_out AS checkOut,
            b.guests, b.total_amount AS totalAmount, b.status,
            b.created_at AS createdAt,
            h.id AS hotelId, h.name AS hotelName, h.slug AS hotelSlug,
            h.city AS hotelCity, h.cover_image AS hotelImage,
            rt.id AS roomTypeId, rt.name AS roomTypeName,
            rt.image_url AS roomImage
     FROM bookings b
     JOIN hotels h ON b.hotel_id = h.id
     JOIN room_types rt ON b.room_type_id = rt.id
     WHERE b.user_id = ?
     ORDER BY b.check_in DESC`,
    [userId]
  );
  return rows;
}

/* GET ONE BOOKING (owner or admin) */
export async function getBookingById(id, user) {
  const [rows] = await pool.query(
    `SELECT b.id, b.user_id AS userId, b.check_in AS checkIn,
            b.check_out AS checkOut, b.guests,
            b.total_amount AS totalAmount, b.status, b.created_at AS createdAt,
            h.name AS hotelName, h.slug AS hotelSlug,
            h.cover_image AS hotelImage,
            rt.name AS roomTypeName, rt.image_url AS roomImage
     FROM bookings b
     JOIN hotels h ON b.hotel_id = h.id
     JOIN room_types rt ON b.room_type_id = rt.id
     WHERE b.id = ?`,
    [id]
  );
  if (rows.length === 0) return null;

  const booking = rows[0];
  if (user.role !== "ADMIN" && booking.userId !== user.id) {
    throw httpError(403, "Not authorized to view this booking");
  }
  return booking;
}

/* CANCEL BOOKING (transaction + lock)                                 */

export async function cancelBooking(id, user) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [rows] = await conn.query(
      `SELECT id, user_id AS userId, status, check_in AS checkIn
       FROM bookings WHERE id = ? FOR UPDATE`,
      [id]
    );
    if (rows.length === 0) throw httpError(404, "Booking not found");
    const booking = rows[0];

    if (user.role !== "ADMIN" && booking.userId !== user.id) {
      throw httpError(403, "Not authorized to cancel this booking");
    }
    if (booking.status === "CANCELLED") {
      throw httpError(400, "Booking is already cancelled");
    }
    if (booking.status === "CHECKED_IN" || booking.status === "COMPLETED") {
      throw httpError(400, `Cannot cancel a ${booking.status.toLowerCase()} booking`);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (new Date(booking.checkIn) <= today) {
      throw httpError(400, "Cannot cancel a booking that has already started");
    }
    await conn.query("UPDATE bookings SET status = 'CANCELLED' WHERE id = ?", [id]);
    await conn.commit();
    return { id, status: "CANCELLED" };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

/* Helper: create an error object with a status code*/
function httpError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}