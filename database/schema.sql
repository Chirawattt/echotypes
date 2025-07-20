-- Enhanced GameScores table schema for EchoTypes
-- This script should be run in your Supabase SQL editor

-- Drop existing table if you need to recreate it (BE CAREFUL - this will delete data!)
-- DROP TABLE IF EXISTS "GameScores";

-- Create improved GameScores table
-- Simple Users table for our app
CREATE TABLE IF NOT EXISTS "Users" (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT UNIQUE,
    email TEXT UNIQUE NOT NULL,
    image TEXT,
    "emailVerified" TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "GameScores" (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES "Users"(id) ON DELETE CASCADE,
    game_mode VARCHAR(20) NOT NULL CHECK (game_mode IN ('echo', 'memory', 'typing')),
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
    
    -- Ensure one high score per user per mode/style combination
    UNIQUE(user_id, game_mode, game_style)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_gamescores_user_id ON "GameScores"(user_id);
CREATE INDEX IF NOT EXISTS idx_gamescores_game_mode ON "GameScores"(game_mode);
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
ALTER TABLE "Users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "GameScores" ENABLE ROW LEVEL SECURITY;

-- RLS policies for Users
CREATE POLICY "Public read access to Users" ON "Users"
    FOR SELECT USING (true);

CREATE POLICY "Users can insert own profile" ON "Users"
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own profile" ON "Users"
    FOR UPDATE USING (true);

-- RLS policies for GameScores
CREATE POLICY "Users can view own scores" ON "GameScores"
    FOR SELECT USING (true);

CREATE POLICY "Users can insert own scores" ON "GameScores"
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own scores" ON "GameScores"
    FOR UPDATE USING (true);

-- Create leaderboard view for public access
CREATE OR REPLACE VIEW public_leaderboard AS
SELECT 
    u.name as player_name,
    gs.game_mode,
    gs.game_style,
    gs.score,
    gs.highest_streak,
    gs.wpm,
    gs.challenge_total_score,
    gs.created_at,
    ROW_NUMBER() OVER (
        PARTITION BY gs.game_mode, gs.game_style 
        ORDER BY gs.score DESC, gs.created_at ASC
    ) as rank
FROM "GameScores" gs
JOIN "Users" u ON u.id = gs.user_id
WHERE u.name IS NOT NULL
ORDER BY gs.game_mode, gs.game_style, gs.score DESC;

-- Grant access to the leaderboard view
GRANT SELECT ON public_leaderboard TO anon, authenticated;