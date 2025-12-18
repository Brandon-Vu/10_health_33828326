USE health;

-- Insert a sample user
INSERT INTO users (username, email, password_hash) VALUES (
'gold',
'gold@example.com',
'$2b$10$RD53wDpoQdgMFF/NmZNqNurMUYMzpTzAsXtaSYKNZmZfKVDb5G2Ka'
);

-- Insert a sample meal for the user: gold
INSERT INTO meals (user_id, meal_name, meal_date, calories) VALUES (
1, 'Chicken Salad', '2025-12-10', 450
);