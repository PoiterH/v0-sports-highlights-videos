-- Create sports preferences table
CREATE TABLE IF NOT EXISTS sports_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  sport_name TEXT NOT NULL,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create videos table to store fetched YouTube videos
CREATE TABLE IF NOT EXISTS videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  youtube_id TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  channel_name TEXT,
  published_at TIMESTAMP WITH TIME ZONE,
  sport_category TEXT,
  duration TEXT,
  view_count BIGINT,
  is_score_free BOOLEAN DEFAULT false,
  content_analysis JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user video interactions table
CREATE TABLE IF NOT EXISTS user_video_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
  watched BOOLEAN DEFAULT false,
  liked BOOLEAN DEFAULT false,
  hidden BOOLEAN DEFAULT false,
  watched_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, video_id)
);

-- Enable Row Level Security
ALTER TABLE sports_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_video_interactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for sports_preferences
CREATE POLICY "Users can view their own sports preferences" 
  ON sports_preferences FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sports preferences" 
  ON sports_preferences FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sports preferences" 
  ON sports_preferences FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sports preferences" 
  ON sports_preferences FOR DELETE 
  USING (auth.uid() = user_id);

-- Create RLS policies for user_video_interactions
CREATE POLICY "Users can view their own video interactions" 
  ON user_video_interactions FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own video interactions" 
  ON user_video_interactions FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own video interactions" 
  ON user_video_interactions FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own video interactions" 
  ON user_video_interactions FOR DELETE 
  USING (auth.uid() = user_id);

-- Videos table is public read (no RLS needed for reading)
-- Only the system will insert videos, not users directly

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sports_preferences_user_id ON sports_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_videos_sport_category ON videos(sport_category);
CREATE INDEX IF NOT EXISTS idx_videos_published_at ON videos(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_videos_is_score_free ON videos(is_score_free);
CREATE INDEX IF NOT EXISTS idx_user_video_interactions_user_id ON user_video_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_video_interactions_video_id ON user_video_interactions(video_id);
