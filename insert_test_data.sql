USE health;

-- Insert a sample user
INSERT INTO users (username, email, password_hash) VALUES (
'gold',
'gold@example.com',
'$2b$10$RD53wDpoQdgMFF/NmZNqNurMUYMzpTzAsXtaSYKNZmZfKVDb5G2Ka'
);      

-- Insert a sample meal for the user: gold
INSERT INTO meals (user_id, meal_name, meal_date, calories) VALUES
(1, '10 chicken nuggets', '2025-12-11', 420),
(1, '20 chicken nuggets', '2025-12-12', 840),
(1, '5 chicken tenders', '2025-12-11', 550),
(1, '20 chicken tenders', '2025-12-13', 1200),
(1, 'grilled chicken breast', '2025-12-14', 280),
(1, 'fried chicken wings', '2025-12-14', 600),

(1, 'bowl of rice', '2025-12-11', 300),
(1, 'large bowl of white rice', '2025-12-12', 420),
(1, 'brown rice bowl', '2025-12-13', 350),

(1, 'spaghetti bolognese', '2025-12-14', 650),
(1, 'chicken pasta', '2025-12-15', 700),

(1, 'cheese sandwich', '2025-12-11', 380),
(1, 'ham and cheese sandwich', '2025-12-12', 450),

(1, 'apple', '2025-12-11', 95),
(1, 'banana', '2025-12-12', 105),
(1, 'protein bar', '2025-12-13', 220),

(1, 'glass of orange juice', '2025-12-11', 110),
(1, 'can of coke', '2025-12-12', 140),
(1, 'bottle of water', '2025-12-13', 0);