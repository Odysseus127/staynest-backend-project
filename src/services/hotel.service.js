import { pool } from "../config/db.js";

/**
 * Fetch all hotels, optionally filtered by city and sorted.
 */
export async function getAllHotels({ city, sort } = {}) {
  let sql = `
    SELECT h.id, h.name, h.slug, h.city, h.address, h.description,
           h.rating, h.price_from AS priceFrom,
           h.cover_image AS coverImage, h.gallery,
           (SELECT COUNT(*) FROM room_types rt WHERE rt.hotel_id = h.id) AS roomCount
    FROM hotels h
  `;
  const params = [];

  if (city) {
    sql += " WHERE city LIKE ?";
    params.push(`%${city}%`);
  }

  // Whitelist sorting to prevent SQL injection
  const sortMap = {
    rating: "rating DESC",
    price_asc: "price_from ASC",
    price_desc: "price_from DESC",
    name: "name ASC",
  };
  sql += ` ORDER BY ${sortMap[sort] || "rating DESC"}`;

  const [rows] = await pool.query(sql, params);
  return rows.map(normalizeHotel);
}

/**
 * Fetch a single hotel by slug, including its room types.
 */
export async function getHotelBySlug(slug) {
  const [hotelRows] = await pool.query(
    `SELECT id, name, slug, city, address, description,
            rating, price_from AS priceFrom,
            cover_image AS coverImage, gallery
     FROM hotels WHERE slug = ?`,
    [slug]
  );

  if (hotelRows.length === 0) return null;

  const hotel = normalizeHotel(hotelRows[0]);

  const [roomRows] = await pool.query(
    `SELECT id, hotel_id AS hotelId, name, description,
            capacity, base_price AS basePrice,
            total_rooms AS totalRooms, image_url AS imageUrl
     FROM room_types
     WHERE hotel_id = ?
     ORDER BY base_price ASC`,
    [hotel.id]
  );

  hotel.rooms = roomRows;
  return hotel;
}

/**
 * Get room types for a hotel (by hotel id).
 */
export async function getRoomsForHotel(hotelId) {
  const [rows] = await pool.query(
    `SELECT id, hotel_id AS hotelId, name, description,
            capacity, base_price AS basePrice,
            total_rooms AS totalRooms, image_url AS imageUrl
     FROM room_types
     WHERE hotel_id = ?
     ORDER BY base_price ASC`,
    [hotelId]
  );
  return rows;
}

/**
 * mysql2 returns JSON columns as strings in some versions.
 * This ensures `gallery` is always a real array in the response.
 */
function normalizeHotel(row) {
  let gallery = row.gallery;
  if (typeof gallery === "string") {
    try {
      gallery = JSON.parse(gallery);
    } catch {
      gallery = [];
    }
  }
  return { ...row, gallery: gallery || [] };
}