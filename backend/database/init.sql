USE giftcard_shop;


CREATE TABLE IF NOT EXISTS settings (
  setting_key VARCHAR(50) PRIMARY KEY,
  value INT NOT NULL
);
INSERT IGNORE INTO settings (setting_key, value) VALUES ('last_address_index', 0);

CREATE TABLE IF NOT EXISTS gift_card_types (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  image VARCHAR(255) NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT IGNORE INTO gift_card_types (name, image) VALUES
('Steam Gift Card', '/assets/steam.webp'),
('Amazon Gift Card', '/assets/amazon.webp'),
('Eneba Gift Card', '/assets/eneba.webp');


CREATE TABLE IF NOT EXISTS gift_cards (
  id INT AUTO_INCREMENT PRIMARY KEY,
  type_id INT NOT NULL,
  denomination DECIMAL(10,2) NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (type_id) REFERENCES gift_card_types(id),
  UNIQUE KEY (type_id, denomination)
);

INSERT IGNORE INTO gift_cards (type_id, denomination)
SELECT id, 5.00 FROM gift_card_types WHERE name = 'Steam Gift Card' UNION ALL
SELECT id, 10.00 FROM gift_card_types WHERE name = 'Steam Gift Card' UNION ALL
SELECT id, 20.00 FROM gift_card_types WHERE name = 'Steam Gift Card' UNION ALL
SELECT id, 50.00 FROM gift_card_types WHERE name = 'Steam Gift Card' UNION ALL
SELECT id, 100.00 FROM gift_card_types WHERE name = 'Steam Gift Card' UNION ALL
SELECT id, 10.00 FROM gift_card_types WHERE name = 'Amazon Gift Card' UNION ALL
SELECT id, 25.00 FROM gift_card_types WHERE name = 'Amazon Gift Card' UNION ALL
SELECT id, 50.00 FROM gift_card_types WHERE name = 'Amazon Gift Card' UNION ALL
SELECT id, 10.00 FROM gift_card_types WHERE name = 'Eneba Gift Card' UNION ALL
SELECT id, 25.00 FROM gift_card_types WHERE name = 'Eneba Gift Card' UNION ALL
SELECT id, 50.00 FROM gift_card_types WHERE name = 'Eneba Gift Card';


CREATE TABLE IF NOT EXISTS orders (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  address VARCHAR(42) NOT NULL,
  address_index INT NOT NULL,
  currency VARCHAR(10) NOT NULL,
  network VARCHAR(20) NOT NULL,
  email VARCHAR(255) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  paid_at TIMESTAMP NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  swept BOOLEAN DEFAULT FALSE,
  uid VARCHAR(32) NOT NULL UNIQUE,
  terms_accepted BOOLEAN DEFAULT FALSE,
  withdrawn_deadline TIMESTAMP NULL,
  expected_amount BIGINT NOT NULL
);


CREATE TABLE IF NOT EXISTS order_items (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id BIGINT UNSIGNED NOT NULL,
  gift_card_id INT NOT NULL,
  quantity INT NOT NULL,
  unit_amount_usd INT NOT NULL,
  total_amount_usd INT NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (gift_card_id) REFERENCES gift_cards(id)
);


CREATE TABLE IF NOT EXISTS gift_card_codes (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(255) NOT NULL UNIQUE,
  gift_card_id INT NOT NULL,
  order_item_id BIGINT UNSIGNED NULL,
  delivered_at TIMESTAMP NULL,
  used BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (gift_card_id) REFERENCES gift_cards(id),
  FOREIGN KEY (order_item_id) REFERENCES order_items(id)
);

-- Only generate codes if the table is empty 
INSERT INTO gift_card_codes (code, gift_card_id, used)
WITH RECURSIVE numbers AS (
  SELECT 1 AS n
  UNION ALL
  SELECT n + 1 FROM numbers WHERE n < 50
)
SELECT
  CONCAT(
    t.name, '_', gc.denomination, '_CODE_',
    -- Random 8-character alphanumeric suffix
    SUBSTRING(MD5(CONCAT(gc.id, numbers.n, RAND())), 1, 8)
  ),
  gc.id,
  FALSE
FROM gift_cards gc
JOIN gift_card_types t ON gc.type_id = t.id
CROSS JOIN numbers
WHERE NOT EXISTS (SELECT 1 FROM gift_card_codes LIMIT 1)
ORDER BY gc.id, numbers.n;


CREATE TABLE IF NOT EXISTS sweep_log (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id BIGINT UNSIGNED NOT NULL,
  tx_hash VARCHAR(66) NOT NULL,
  from_address VARCHAR(42) NOT NULL,
  amount BIGINT NOT NULL,
  swept_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id)
);

