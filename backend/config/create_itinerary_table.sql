-- Create itinerary table
CREATE TABLE IF NOT EXISTS itinerary (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    item_type ENUM('flight', 'hotel', 'attraction') NOT NULL,
    item_id VARCHAR(255) NOT NULL,
    item_data JSON NOT NULL,
    date DATE,
    time TIME,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_item (user_id, item_type, item_id)
);

-- Add indexes for better performance
CREATE INDEX idx_user_id ON itinerary(user_id);
CREATE INDEX idx_item_type ON itinerary(item_type);
CREATE INDEX idx_date ON itinerary(date);
CREATE INDEX idx_created_at ON itinerary(created_at);
CREATE INDEX idx_user_date ON itinerary(user_id, date);
