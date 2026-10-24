USE staynestdb;

-- Users -------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(100) NOT NULL,
  email         VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role          ENUM('USER', 'ADMIN') NOT NULL DEFAULT 'USER',
  phone         VARCHAR(20),
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Hotels ------------------------------------------------------
CREATE TABLE IF NOT EXISTS hotels (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(150) NOT NULL,
  slug        VARCHAR(150) NOT NULL UNIQUE,
  city        VARCHAR(100) NOT NULL,
  address     VARCHAR(255) NOT NULL,
  description TEXT,
  rating      DECIMAL(2,1) NOT NULL DEFAULT 0.0,
  price_from  DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  cover_image VARCHAR(255),
  gallery     JSON,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_hotels_city (city),
  INDEX idx_hotels_rating (rating)
) ENGINE=InnoDB;

-- Room Types --------------------------------------------------
CREATE TABLE IF NOT EXISTS room_types (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  hotel_id     INT NOT NULL,
  name         VARCHAR(100) NOT NULL,
  description  TEXT,
  capacity     INT NOT NULL DEFAULT 2,
  base_price   DECIMAL(10,2) NOT NULL,
  total_rooms  INT NOT NULL DEFAULT 1,
  image_url    VARCHAR(255),
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_room_types_hotel
    FOREIGN KEY (hotel_id) REFERENCES hotels(id)
    ON DELETE CASCADE,
  INDEX idx_room_types_hotel (hotel_id)
) ENGINE=InnoDB;

-- Bookings ----------------------------------------------------
CREATE TABLE IF NOT EXISTS bookings (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  user_id       INT NOT NULL,
  hotel_id      INT NOT NULL,
  room_type_id  INT NOT NULL,
  check_in      DATE NOT NULL,
  check_out     DATE NOT NULL,
  guests        INT NOT NULL DEFAULT 1,
  total_amount  DECIMAL(10,2) NOT NULL,
  status        ENUM('PENDING','CONFIRMED','CHECKED_IN','COMPLETED','CANCELLED')
                NOT NULL DEFAULT 'PENDING',
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_bookings_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
  CONSTRAINT fk_bookings_hotel
    FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE RESTRICT,
    CONSTRAINT fk_bookings_room_type
    FOREIGN KEY (room_type_id) REFERENCES room_types(id) ON DELETE RESTRICT,
    CONSTRAINT chk_dates CHECK (check_out > check_in),
  INDEX idx_bookings_room_dates (room_type_id, check_in, check_out, status),
  INDEX idx_bookings_user (user_id),
  INDEX idx_bookings_status (status)
) ENGINE=InnoDB;