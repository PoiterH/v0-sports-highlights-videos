-- Insert default sports categories
INSERT INTO videos (youtube_id, title, description, sport_category, is_score_free, created_at) VALUES
('sample_1', 'Sample Basketball Highlights', 'Amazing basketball plays without scores', 'Basketball', true, NOW()),
('sample_2', 'Sample Football Highlights', 'Best football moments score-free', 'Football', true, NOW()),
('sample_3', 'Sample Soccer Highlights', 'Soccer skills and plays', 'Soccer', true, NOW())
ON CONFLICT (youtube_id) DO NOTHING;
