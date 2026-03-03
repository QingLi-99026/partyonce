-- PartyOnce Database Schema
-- MySQL Database Setup

CREATE DATABASE IF NOT EXISTS partyonce CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE partyonce;

-- Users table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    user_type VARCHAR(50) DEFAULT 'personal', -- personal, corporate
    role VARCHAR(50) DEFAULT 'user', -- user, manager, executor, agent, admin
    phone VARCHAR(50),
    company_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    INDEX idx_email (email),
    INDEX idx_user_type (user_type)
);

-- Venues table
CREATE TABLE venues (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    address VARCHAR(500) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100),
    postcode VARCHAR(20),
    country VARCHAR(100) DEFAULT 'Australia',
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    capacity INT,
    venue_type VARCHAR(100), -- wedding, restaurant, garden, exhibition, corporate
    price_range VARCHAR(50), -- $, $$, $$$, $$$$
    regular_price DECIMAL(10, 2),
    images JSON,
    amenities JSON,
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    website VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Partnership fields
    is_partner BOOLEAN DEFAULT FALSE,
    discount_rate DECIMAL(5, 4) DEFAULT 0.0, -- e.g., 0.15 for 15%
    partner_price DECIMAL(10, 2),
    commission_rate DECIMAL(5, 4) DEFAULT 0.0,
    
    INDEX idx_city (city),
    INDEX idx_venue_type (venue_type),
    INDEX idx_is_partner (is_partner),
    INDEX idx_price_range (price_range)
);

-- Events table
CREATE TABLE events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    venue_id INT NOT NULL,
    event_type VARCHAR(100), -- wedding, birthday, corporate, exhibition, etc.
    event_date DATE,
    guest_count INT,
    budget DECIMAL(10, 2),
    style VARCHAR(100), -- modern, classic, tech, warm, luxury
    status VARCHAR(50) DEFAULT 'planning', -- planning, confirmed, completed, cancelled
    ai_plan JSON, -- AI generated plans
    scene_config JSON, -- 3D scene configuration
    total_price DECIMAL(10, 2),
    savings_amount DECIMAL(10, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (venue_id) REFERENCES venues(id),
    INDEX idx_user_id (user_id),
    INDEX idx_venue_id (venue_id),
    INDEX idx_event_date (event_date)
);

-- Materials table
CREATE TABLE materials (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100), -- furniture, decoration, lighting, flower, stage
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    image_url VARCHAR(500),
    is_3d_available BOOLEAN DEFAULT FALSE,
    model_3d_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Scene Models table
CREATE TABLE scene_models (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    model_type VARCHAR(100), -- venue, furniture, decoration, prop
    model_url VARCHAR(500) NOT NULL,
    thumbnail_url VARCHAR(500),
    scale_x DECIMAL(5, 2) DEFAULT 1.0,
    scale_y DECIMAL(5, 2) DEFAULT 1.0,
    scale_z DECIMAL(5, 2) DEFAULT 1.0,
    category VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Pricing Rules table
CREATE TABLE pricing_rules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    rule_name VARCHAR(255) NOT NULL,
    event_type VARCHAR(100),
    base_service_fee DECIMAL(10, 2) DEFAULT 0.0,
    design_fee_percentage DECIMAL(5, 4) DEFAULT 0.0,
    setup_fee DECIMAL(10, 2) DEFAULT 0.0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders table
CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_id INT NOT NULL,
    order_type VARCHAR(100), -- venue, material, service
    supplier_id INT,
    item_name VARCHAR(255),
    quantity INT DEFAULT 1,
    unit_price DECIMAL(10, 2),
    total_price DECIMAL(10, 2),
    status VARCHAR(50) DEFAULT 'pending', -- pending, confirmed, completed, cancelled
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (event_id) REFERENCES events(id),
    INDEX idx_event_id (event_id)
);

-- Venue Partnership Applications table
CREATE TABLE venue_partnerships (
    id INT AUTO_INCREMENT PRIMARY KEY,
    venue_id INT NOT NULL,
    contact_name VARCHAR(255),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    discount_rate DECIMAL(5, 4),
    commission_rate DECIMAL(5, 4),
    status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (venue_id) REFERENCES venues(id),
    INDEX idx_venue_id (venue_id)
);

-- Insert sample pricing rules
INSERT INTO pricing_rules (rule_name, event_type, base_service_fee, design_fee_percentage, setup_fee) VALUES
('Wedding Basic', 'wedding', 500.00, 0.10, 300.00),
('Corporate Event', 'corporate', 800.00, 0.08, 500.00),
('Birthday Party', 'birthday', 300.00, 0.12, 200.00),
('Exhibition', 'exhibition', 1000.00, 0.05, 800.00);

-- Insert sample venues
INSERT INTO venues (name, description, address, city, state, postcode, capacity, venue_type, price_range, regular_price, is_partner, discount_rate, partner_price) VALUES
('Sydney Grand Ballroom', 'Elegant ballroom with harbor views', '123 Harbour St', 'Sydney', 'NSW', '2000', 300, 'wedding', '$$$$', 15000.00, TRUE, 0.15, 12750.00),
('Melbourne Garden Estate', 'Beautiful garden venue with indoor option', '456 Garden Rd', 'Melbourne', 'VIC', '3000', 200, 'wedding', '$$$', 8000.00, TRUE, 0.10, 7200.00),
('Brisbane Rooftop Bar', 'Modern rooftop venue for corporate events', '789 Sky High Ave', 'Brisbane', 'QLD', '4000', 150, 'corporate', '$$', 5000.00, FALSE, 0.0, NULL),
('Perth Beach Club', 'Beachfront venue for casual events', '321 Ocean Dr', 'Perth', 'WA', '6000', 100, 'birthday', '$$', 3500.00, TRUE, 0.12, 3080.00);

-- Insert sample materials
INSERT INTO materials (name, category, description, price, is_3d_available) VALUES
('Elegant Flower Arch', 'decoration', 'Beautiful floral arch for ceremonies', 800.00, TRUE),
('LED Stage Lighting Set', 'lighting', 'Professional stage lighting package', 1200.00, TRUE),
('Round Dining Table', 'furniture', 'Seats 10 guests, white linen included', 150.00, TRUE),
('Chiavari Chair', 'furniture', 'Elegant gold chiavari chair', 25.00, TRUE),
('Red Carpet Runner', 'decoration', 'Premium red carpet 10m length', 300.00, FALSE),
('Balloon Garland', 'decoration', 'Custom color balloon garland', 400.00, FALSE);

-- Insert sample scene models
INSERT INTO scene_models (name, model_type, model_url, category) VALUES
('Indoor Ballroom', 'venue', '/models/ballroom.gltf', 'venue'),
('Garden Lawn', 'venue', '/models/garden.gltf', 'venue'),
('Round Table 10pax', 'furniture', '/models/table_round.gltf', 'furniture'),
('Flower Arch', 'decoration', '/models/arch_flowers.gltf', 'decoration'),
('Stage Platform', 'prop', '/models/stage.gltf', 'prop');

-- ==================== 3D DESIGNS TABLE ====================

CREATE TABLE designs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Venue configuration
    venue_type VARCHAR(50) DEFAULT 'indoor_hall',
    venue_width DECIMAL(8, 2) DEFAULT 20.0,
    venue_depth DECIMAL(8, 2) DEFAULT 15.0,
    venue_height DECIMAL(8, 2) DEFAULT 6.0,
    
    -- Design data
    theme_color VARCHAR(10) DEFAULT '#ff6b6b',
    objects JSON,
    budget DECIMAL(12, 2) DEFAULT 0.00,
    
    -- Metadata
    is_public BOOLEAN DEFAULT FALSE,
    thumbnail_url VARCHAR(500),
    status VARCHAR(50) DEFAULT 'active', -- active, archived, deleted
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_user_id (user_id),
    INDEX idx_status (status)
);
