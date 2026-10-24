import {
  getAllHotels,
  getHotelBySlug,
  getRoomsForHotel,
} from "../services/hotel.service.js";

export async function listHotels(req, res, next) {
  try {
    const { city, sort } = req.query;
    const hotels = await getAllHotels({ city, sort });
    res.json({ count: hotels.length, hotels });
  } catch (err) {
    next(err); // forward to global error handler
  }
}

export async function getHotel(req, res, next) {
  try {
    const { slug } = req.params;
    const hotel = await getHotelBySlug(slug);
    if (!hotel) {
      return res.status(404).json({ error: "Hotel not found" });
    }
    res.json({ hotel });
  } catch (err) {
    next(err);
  }
}

export async function listRoomsForHotel(req, res, next) {
  try {
    const { id } = req.params;
    const rooms = await getRoomsForHotel(Number(id));
    if (rooms.length === 0) {
      return res.status(404).json({ error: "No rooms found for this hotel" });
    }
    res.json({ count: rooms.length, rooms });
  } catch (err) {
    next(err);
  }
}