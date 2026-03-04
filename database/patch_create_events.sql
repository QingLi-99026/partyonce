-- PartyOnce Events Table Patch (Complete)
-- Date: 2026-03-04

USE partyonce;

-- Drop and recreate events table with all required fields
DROP TABLE IF EXISTS event_albums;
DROP TABLE IF EXISTS events;

CREATE TABLE events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    event_name VARCHAR(255) NULL,
    event_type VARCHAR(100) NULL,
    event_date DATETIME NULL,
    event_duration_hours INT NULL DEFAULT 4,
    guest_count INT NULL DEFAULT 0,
    event_notes TEXT NULL,
    venue_id INT NULL,
    venue_partner_id INT NULL,
    template_id INT NULL,
    customizations JSON NULL,
    order_id INT NULL,
    status VARCHAR(50) NULL DEFAULT 'planning',
    setup_time DATETIME NULL,
    event_start_time DATETIME NULL,
    event_end_time DATETIME NULL,
    teardown_time DATETIME NULL,
    address VARCHAR(500) NULL,
    city VARCHAR(100) NULL,
    state VARCHAR(100) NULL,
    postcode VARCHAR(20) NULL,
    latitude DECIMAL(10,8) NULL,
    longitude DECIMAL(11,8) NULL,
    estimated_budget DECIMAL(12,2) NULL,
    final_price DECIMAL(12,2) NULL,
    created_at DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_template_id (template_id),
    INDEX idx_venue_id (venue_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create event_albums table
CREATE TABLE event_albums (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_id INT NOT NULL,
    media_id INT NOT NULL,
    album_type VARCHAR(50) NULL DEFAULT 'general',
    caption TEXT NULL,
    taken_at DATETIME NULL,
    taken_by VARCHAR(255) NULL,
    sort_order INT NULL DEFAULT 0,
    is_featured TINYINT(1) NULL DEFAULT 0,
    like_count INT NULL DEFAULT 0,
    uploaded_by INT NULL,
    uploaded_at DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_event_id (event_id),
    INDEX idx_uploaded_by (uploaded_by)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Verify
SHOW TABLES LIKE 'events';
SHOW TABLES LIKE 'event_albums';
