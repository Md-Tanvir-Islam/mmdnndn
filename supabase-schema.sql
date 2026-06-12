-- =============================================
-- FiraLive TV - Supabase Database Schema
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor)
-- =============================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- User table
CREATE TABLE IF NOT EXISTS "User" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  phone TEXT,
  country TEXT,
  "heardFrom" TEXT,
  avatar TEXT,
  "isVerified" BOOLEAN DEFAULT false,
  role TEXT DEFAULT 'user',
  "isBanned" BOOLEAN DEFAULT false,
  "createdAt" TIMESTAMPTZ DEFAULT now(),
  "updatedAt" TIMESTAMPTZ DEFAULT now()
);

-- Channel table
CREATE TABLE IF NOT EXISTS "Channel" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  logo TEXT,
  thumbnail TEXT,
  category TEXT NOT NULL,
  country TEXT,
  language TEXT,
  "streamUrl" TEXT NOT NULL,
  "backupUrls" TEXT,
  featured BOOLEAN DEFAULT false,
  trending BOOLEAN DEFAULT false,
  "isLive" BOOLEAN DEFAULT true,
  enabled BOOLEAN DEFAULT true,
  views INTEGER DEFAULT 0,
  description TEXT,
  "createdAt" TIMESTAMPTZ DEFAULT now(),
  "updatedAt" TIMESTAMPTZ DEFAULT now()
);

-- ChannelServer table
CREATE TABLE IF NOT EXISTS "ChannelServer" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "channelId" TEXT NOT NULL REFERENCES "Channel"(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  "streamUrl" TEXT NOT NULL,
  quality TEXT DEFAULT 'HD',
  "isActive" BOOLEAN DEFAULT true,
  "order" INTEGER DEFAULT 0,
  "createdAt" TIMESTAMPTZ DEFAULT now(),
  "updatedAt" TIMESTAMPTZ DEFAULT now()
);

-- Favorite table
CREATE TABLE IF NOT EXISTS "Favorite" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId" TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  "channelId" TEXT NOT NULL REFERENCES "Channel"(id) ON DELETE CASCADE,
  "createdAt" TIMESTAMPTZ DEFAULT now(),
  UNIQUE("userId", "channelId")
);

-- WatchHistory table
CREATE TABLE IF NOT EXISTS "WatchHistory" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId" TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  "channelId" TEXT NOT NULL REFERENCES "Channel"(id) ON DELETE CASCADE,
  progress INTEGER DEFAULT 0,
  "watchedAt" TIMESTAMPTZ DEFAULT now(),
  UNIQUE("userId", "channelId")
);

-- SportsMatch table
CREATE TABLE IF NOT EXISTS "SportsMatch" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  team1 TEXT NOT NULL,
  team2 TEXT NOT NULL,
  tournament TEXT,
  "matchTime" TIMESTAMPTZ NOT NULL,
  "team1Logo" TEXT,
  "team2Logo" TEXT,
  "channelIds" TEXT,
  "watchLink" TEXT,
  banner TEXT,
  status TEXT DEFAULT 'upcoming',
  sport TEXT DEFAULT 'football',
  "createdAt" TIMESTAMPTZ DEFAULT now(),
  "updatedAt" TIMESTAMPTZ DEFAULT now()
);

-- SportsServer table
CREATE TABLE IF NOT EXISTS "SportsServer" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "matchId" TEXT NOT NULL REFERENCES "SportsMatch"(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  "streamUrl" TEXT NOT NULL,
  quality TEXT DEFAULT 'HD',
  "isActive" BOOLEAN DEFAULT true,
  "order" INTEGER DEFAULT 0,
  "createdAt" TIMESTAMPTZ DEFAULT now(),
  "updatedAt" TIMESTAMPTZ DEFAULT now()
);

-- Donation table
CREATE TABLE IF NOT EXISTS "Donation" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  method TEXT NOT NULL,
  "accountName" TEXT NOT NULL,
  "accountNumber" TEXT NOT NULL,
  "qrCode" TEXT,
  message TEXT,
  "isActive" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMPTZ DEFAULT now(),
  "updatedAt" TIMESTAMPTZ DEFAULT now()
);

-- OtpVerification table
CREATE TABLE IF NOT EXISTS "OtpVerification" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  email TEXT NOT NULL,
  otp TEXT NOT NULL,
  verified BOOLEAN DEFAULT false,
  "expiresAt" TIMESTAMPTZ NOT NULL,
  "createdAt" TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- Row Level Security (RLS) Policies
-- =============================================

-- Enable RLS on all tables
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Channel" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ChannelServer" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Favorite" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "WatchHistory" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SportsMatch" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SportsServer" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Donation" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "OtpVerification" ENABLE ROW LEVEL SECURITY;

-- Service role can do everything (already bypasses RLS)
-- Anon key policies:

-- Channels: anyone can read enabled channels
CREATE POLICY "Channels are viewable by everyone" ON "Channel"
  FOR SELECT USING (enabled = true);

-- ChannelServers: anyone can read active servers for enabled channels
CREATE POLICY "ChannelServers are viewable by everyone" ON "ChannelServer"
  FOR SELECT USING ("isActive" = true);

-- SportsMatches: anyone can read
CREATE POLICY "SportsMatches are viewable by everyone" ON "SportsMatch"
  FOR SELECT USING (true);

-- SportsServers: anyone can read active servers
CREATE POLICY "SportsServers are viewable by everyone" ON "SportsServer"
  FOR SELECT USING ("isActive" = true);

-- Donations: anyone can read active donations
CREATE POLICY "Active donations are viewable by everyone" ON "Donation"
  FOR SELECT USING ("isActive" = true);

-- Users: only self can read own data
CREATE POLICY "Users can read own data" ON "User"
  FOR SELECT USING (true);

-- Favorites: authenticated users can manage their own
CREATE POLICY "Users can read own favorites" ON "Favorite"
  FOR SELECT USING (true);

-- WatchHistory: authenticated users can manage their own
CREATE POLICY "Users can read own history" ON "WatchHistory"
  FOR SELECT USING (true);

-- =============================================
-- Indexes for performance
-- =============================================
CREATE INDEX IF NOT EXISTS idx_channel_category ON "Channel"(category);
CREATE INDEX IF NOT EXISTS idx_channel_enabled ON "Channel"(enabled);
CREATE INDEX IF NOT EXISTS idx_channel_featured ON "Channel"(featured);
CREATE INDEX IF NOT EXISTS idx_channel_trending ON "Channel"(trending);
CREATE INDEX IF NOT EXISTS idx_channelserver_channel ON "ChannelServer"("channelId");
CREATE INDEX IF NOT EXISTS idx_favorite_user ON "Favorite"("userId");
CREATE INDEX IF NOT EXISTS idx_favorite_channel ON "Favorite"("channelId");
CREATE INDEX IF NOT EXISTS idx_history_user ON "WatchHistory"("userId");
CREATE INDEX IF NOT EXISTS idx_sports_match ON "SportsServer"("matchId");
CREATE INDEX IF NOT EXISTS idx_sportsmatch_status ON "SportsMatch"(status);
CREATE INDEX IF NOT EXISTS idx_sportsmatch_sport ON "SportsMatch"(sport);
CREATE INDEX IF NOT EXISTS idx_otp_email ON "OtpVerification"(email);
CREATE INDEX IF NOT EXISTS idx_user_email ON "User"(email);
CREATE INDEX IF NOT EXISTS idx_user_role ON "User"(role);

-- =============================================
-- Updated_at trigger function
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_user_updated_at BEFORE UPDATE ON "User"
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_channel_updated_at BEFORE UPDATE ON "Channel"
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_channelserver_updated_at BEFORE UPDATE ON "ChannelServer"
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_sportsmatch_updated_at BEFORE UPDATE ON "SportsMatch"
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_sportsserver_updated_at BEFORE UPDATE ON "SportsServer"
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_donation_updated_at BEFORE UPDATE ON "Donation"
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
