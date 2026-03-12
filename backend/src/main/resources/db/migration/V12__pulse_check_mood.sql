ALTER TABLE weekly_commit ADD COLUMN mood_score INT CHECK (mood_score BETWEEN 1 AND 5);
