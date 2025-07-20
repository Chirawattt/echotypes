-- Enhanced GameScores table schema for EchoTypes
-- This script should be run in your Supabase SQL editor

-- Drop existing table if you need to recreate it (BE CAREFUL - this will delete data!)
-- DROP TABLE IF EXISTS "GameScores";

-- Create improved GameScores table
CREATE TABLE IF NOT EXISTS "GameScores" (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    game_mode VARCHAR(20) NOT NULL CHECK (game_mode IN ('echo', 'memory', 'typing')),
    difficulty VARCHAR(10) NOT NULL DEFAULT 'dda' CHECK (difficulty = 'dda'),
    game_style VARCHAR(20) NOT NULL CHECK (game_style IN ('practice', 'challenge')),
    score INTEGER NOT NULL DEFAULT 0,
    highest_streak INTEGER NOT NULL DEFAULT 0,
    words_correct INTEGER NOT NULL DEFAULT 0,
    words_incorrect INTEGER NOT NULL DEFAULT 0,
    wpm INTEGER DEFAULT NULL, -- Only for typing mode
    time_spent_seconds INTEGER NOT NULL DEFAULT 0,
    challenge_total_score INTEGER DEFAULT NULL, -- Only for challenge mode
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one high score per user per mode/difficulty/style combination
    UNIQUE(user_id, game_mode, difficulty, game_style)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_gamescores_user_id ON "GameScores"(user_id);
CREATE INDEX IF NOT EXISTS idx_gamescores_game_mode ON "GameScores"(game_mode);
CREATE INDEX IF NOT EXISTS idx_gamescores_difficulty ON "GameScores"(difficulty);
CREATE INDEX IF NOT EXISTS idx_gamescores_score ON "GameScores"(score DESC);
CREATE INDEX IF NOT EXISTS idx_gamescores_created_at ON "GameScores"(created_at DESC);

-- Update the updated_at column automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_gamescores_updated_at 
    BEFORE UPDATE ON "GameScores" 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE "GameScores" ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only see and modify their own scores
CREATE POLICY "Users can view own scores" ON "GameScores"
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own scores" ON "GameScores"
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own scores" ON "GameScores"
    FOR UPDATE USING (auth.uid() = user_id);

-- Create leaderboard view for public access
CREATE OR REPLACE VIEW public_leaderboard AS
SELECT 
    u.name as player_name,
    gs.game_mode,
    gs.difficulty,
    gs.game_style,
    gs.score,
    gs.highest_streak,
    gs.wpm,
    gs.challenge_total_score,
    gs.created_at,
    ROW_NUMBER() OVER (
        PARTITION BY gs.game_mode, gs.difficulty, gs.game_style 
        ORDER BY gs.score DESC, gs.created_at ASC
    ) as rank
FROM "GameScores" gs
JOIN auth.users u ON u.id = gs.user_id
WHERE u.name IS NOT NULL
ORDER BY gs.game_mode, gs.difficulty, gs.game_style, gs.score DESC;

-- Grant access to the leaderboard view
GRANT SELECT ON public_leaderboard TO anon, authenticated;