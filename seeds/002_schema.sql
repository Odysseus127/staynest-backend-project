USE staynestdb;

-- Hotels ------------------------------------------------------
INSERT INTO hotels
  (name, slug, city, address, description, rating, price_from, cover_image, gallery) VALUES

('The Azure Bay', 'azure-bay-mumbai', 'Mumbai',
 'Marine Drive, Nariman Point, Mumbai 400021',
 'A five-star luxury hotel overlooking the Arabian Sea. Floor-to-ceiling windows, an award-winning restaurant, and an infinity pool facing Marine Drive.',
 4.8, 8500.00,
 '/images/hotels/azure-bay-mumbai/exterior.jpg',
 JSON_ARRAY('/images/hotels/azure-bay-mumbai/lobby.jpg',
            '/images/hotels/azure-bay-mumbai/deluxe.jpg',
            '/images/hotels/azure-bay-mumbai/suite.jpg')),

('Palm Grove Inn', 'palm-grove-inn-goa', 'Goa',
 'Calangute Beach Road, North Goa 403516',
 'A boutique beach resort with Portuguese-Goan architecture, private cottages, and an infinity pool opening onto the sand.',
 4.5, 4200.00,
 '/images/hotels/palm-grove-inn-goa/exterior.jpg',
 JSON_ARRAY('/images/hotels/palm-grove-inn-goa/cottage.jpg',
            '/images/hotels/palm-grove-inn-goa/seaview-cottage.jpg',
            '/images/hotels/palm-grove-inn-goa/standard-room.jpg')),

('Urban Nest Suites', 'urban-nest-suites-bangalore', 'Bangalore',
 'MG Road, Bangalore 560001',
 'A contemporary business hotel in the heart of Bangalore. Co-working lobby, ergonomic rooms, and skyline views for the modern traveler.',
 4.3, 5500.00,
 '/images/hotels/urban-nest-suites-bangalore/exterior.jpg',
 JSON_ARRAY('/images/hotels/urban-nest-suites-bangalore/lobby.jpg',
            '/images/hotels/urban-nest-suites-bangalore/business-room.jpg',
            '/images/hotels/urban-nest-suites-bangalore/executive-suite.jpg')),

('Heritage Haveli', 'heritage-haveli-jaipur', 'Jaipur',
 'Old City, Jaipur 302002',
 'A restored 19th-century haveli with carved sandstone jharokhas, frescoed courtyards, and rooms appointed with hand-embroidered Rajasthani textiles.',
 4.7, 6200.00,
 '/images/hotels/heritage-haveli-jaipur/exterior.jpg',
 JSON_ARRAY('/images/hotels/heritage-haveli-jaipur/courtyard.jpg',
            '/images/hotels/heritage-haveli-jaipur/heritage-room.jpg',
            '/images/hotels/heritage-haveli-jaipur/royal-suite.jpg')),

('Lakeview Lodge', 'lakeview-lodge-udaipur', 'Udaipur',
 'Lake Pichola, Udaipur 313001',
 'A mid-range boutique hotel on the banks of Lake Pichola. Rooftop restaurant, lake-facing rooms, and views of the City Palace at sunset.',
 4.4, 3800.00,
 '/images/hotels/lakeview-lodge-udaipur/exterior.jpg',
 JSON_ARRAY('/images/hotels/lakeview-lodge-udaipur/rooftop-restaurant.jpg',
            '/images/hotels/lakeview-lodge-udaipur/lakeview.jpg',
            '/images/hotels/lakeview-lodge-udaipur/lounge.jpg')),

('Backpackers Hub', 'backpackers-hub-manali', 'Manali',
 'Old Manali, Himachal Pradesh 175131',
 'A colorful mountain hostel with A-frame dorms, a cozy common lounge, and views of snow-capped Himalayas. Ideal for backpackers and trekkers.',
 4.1, 1200.00,
 '/images/hotels/backpackers-hub-manali/exterior.jpg',
 JSON_ARRAY('/images/hotels/backpackers-hub-manali/common-lounge.jpg',
            '/images/hotels/backpackers-hub-manali/dorm-room.jpg',
            '/images/hotels/backpackers-hub-manali/private-room.jpg'));

-- Room Types --------------------------------------------------
INSERT INTO room_types
  (hotel_id, name, description, capacity, base_price, total_rooms, image_url) VALUES

(1, 'Deluxe Ocean View',
 'King bed, panoramic Arabian Sea view, marble bath, 42 sqm.',
 2, 8500.00, 20, '/images/hotels/azure-bay-mumbai/deluxe.jpg'),
(1, 'Azure Suite',
 'Separate living area, king bed, skyline view, butler service, 78 sqm.',
 3, 15500.00, 8, '/images/hotels/azure-bay-mumbai/suite.jpg'),

(2, 'Sea-View Cottage',
 'Private cottage with four-poster bed, deck facing the sea, 36 sqm.',
 2, 5500.00, 12, '/images/hotels/palm-grove-inn-goa/seaview-cottage.jpg'),
(2, 'Garden Cottage',
 'Detached cottage surrounded by palms, queen bed, outdoor shower.',
 2, 4200.00, 10, '/images/hotels/palm-grove-inn-goa/cottage.jpg'),

(3, 'Business Room',
 'Queen bed, ergonomic workstation, city view, 28 sqm.',
 2, 5500.00, 30, '/images/hotels/urban-nest-suites-bangalore/business-room.jpg'),
(3, 'Executive Suite',
 'Separate work and living space, king bed, panoramic city view.',
 2, 8900.00, 10, '/images/hotels/urban-nest-suites-bangalore/executive-suite.jpg'),

(4, 'Heritage Room',
 'Four-poster bed, hand-painted frescoes, carved jharokha windows.',
 2, 6200.00, 14, '/images/hotels/heritage-haveli-jaipur/heritage-room.jpg'),
(4, 'Royal Suite',
 'Private balcony, antique furnishings, silk upholstery, palace view.',
 3, 12000.00, 6, '/images/hotels/heritage-haveli-jaipur/royal-suite.jpg'),

(5, 'Lake-View Deluxe',
 'Queen bed, arched window overlooking Lake Pichola, 24 sqm.',
 2, 3800.00, 18, '/images/hotels/lakeview-lodge-udaipur/lakeview.jpg'),
(5, 'Rooftop Family Room',
 'Rooftop terrace with family seating, lake and palace views.',
 4, 6500.00, 6, '/images/hotels/lakeview-lodge-udaipur/rooftop-restaurant.jpg'),

(6, 'Mixed Dorm Bed',
 'Bunk bed with privacy curtain, reading light, locker, shared bath.',
 1, 1200.00, 24, '/images/hotels/backpackers-hub-manali/dorm-room.jpg'),
(6, 'Private Budget Room',
 'Double bed, mountain view, private bath, cozy wooden interiors.',
 2, 2800.00, 10, '/images/hotels/backpackers-hub-manali/private-room.jpg');