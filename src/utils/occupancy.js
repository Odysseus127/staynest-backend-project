export function getPeakOccupancy(bookings, checkIn, checkOut) {
  const events = new Map();
  const addEvent = (date, type) => {
    const event = events.get(date) || { checkIns: 0, checkOuts: 0 };
    event[type] += 1;
    events.set(date, event);
  };

  for (const booking of bookings) {
    addEvent(booking.checkIn < checkIn ? checkIn : booking.checkIn, "checkIns");
    addEvent(booking.checkOut > checkOut ? checkOut : booking.checkOut, "checkOuts");
  }

  let occupancy = 0;
  let peak = 0;
  for (const date of [...events.keys()].sort()) {
    const event = events.get(date);
    occupancy -= event.checkOuts;
    occupancy += event.checkIns;
    peak = Math.max(peak, occupancy);
  }

  return peak;
}

export function getPeakOccupancyAcrossBookings(bookings) {
  if (bookings.length === 0) return 0;

  const checkIn = bookings.reduce((earliest, booking) => (
    booking.checkIn < earliest ? booking.checkIn : earliest
  ), bookings[0].checkIn);
  const checkOut = bookings.reduce((latest, booking) => (
    booking.checkOut > latest ? booking.checkOut : latest
  ), bookings[0].checkOut);

  return getPeakOccupancy(bookings, checkIn, checkOut);
}
