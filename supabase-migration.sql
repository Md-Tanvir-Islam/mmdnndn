-- FiraLive TV - Supabase Database Migration
-- Run this SQL in the Supabase SQL Editor (Dashboard → SQL Editor → New Query)

-- ============================================
-- 1. USERS TABLE (synced with Supabase Auth)
-- ============================================
CREATE TABLE IF NOT EXISTS "User" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "name" TEXT NOT NULL,
  "email" TEXT UNIQUE NOT NULL,
  "password" TEXT NOT NULL,
  "phone" TEXT,
  "country" TEXT,
  "heardFrom" TEXT,
  "avatar" TEXT,
  "isVerified" BOOLEAN DEFAULT false,
  "role" TEXT DEFAULT 'user',
  "isBanned" BOOLEAN DEFAULT false,
  "createdAt" TIMESTAMPTZ DEFAULT now(),
  "updatedAt" TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- 2. CHANNEL TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS "Channel" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "name" TEXT NOT NULL,
  "logo" TEXT,
  "thumbnail" TEXT,
  "category" TEXT NOT NULL,
  "country" TEXT,
  "language" TEXT,
  "streamUrl" TEXT NOT NULL,
  "backupUrls" TEXT,
  "featured" BOOLEAN DEFAULT false,
  "trending" BOOLEAN DEFAULT false,
  "isLive" BOOLEAN DEFAULT true,
  "enabled" BOOLEAN DEFAULT true,
  "views" INTEGER DEFAULT 0,
  "description" TEXT,
  "createdAt" TIMESTAMPTZ DEFAULT now(),
  "updatedAt" TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- 3. CHANNEL SERVER TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS "ChannelServer" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "channelId" TEXT NOT NULL REFERENCES "Channel"("id") ON DELETE CASCADE,
  "name" TEXT NOT NULL,
  "streamUrl" TEXT NOT NULL,
  "quality" TEXT DEFAULT 'HD',
  "isActive" BOOLEAN DEFAULT true,
  "order" INTEGER DEFAULT 0,
  "createdAt" TIMESTAMPTZ DEFAULT now(),
  "updatedAt" TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- 4. FAVORITE TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS "Favorite" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "channelId" TEXT NOT NULL REFERENCES "Channel"("id") ON DELETE CASCADE,
  "createdAt" TIMESTAMPTZ DEFAULT now(),
  UNIQUE("userId", "channelId")
);

-- ============================================
-- 5. WATCH HISTORY TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS "WatchHistory" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "channelId" TEXT NOT NULL REFERENCES "Channel"("id") ON DELETE CASCADE,
  "progress" INTEGER DEFAULT 0,
  "watchedAt" TIMESTAMPTZ DEFAULT now(),
  UNIQUE("userId", "channelId")
);

-- ============================================
-- 6. SPORTS MATCH TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS "SportsMatch" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "team1" TEXT NOT NULL,
  "team2" TEXT NOT NULL,
  "tournament" TEXT,
  "matchTime" TIMESTAMPTZ NOT NULL,
  "team1Logo" TEXT,
  "team2Logo" TEXT,
  "channelIds" TEXT,
  "watchLink" TEXT,
  "banner" TEXT,
  "status" TEXT DEFAULT 'upcoming',
  "sport" TEXT DEFAULT 'football',
  "createdAt" TIMESTAMPTZ DEFAULT now(),
  "updatedAt" TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- 7. SPORTS SERVER TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS "SportsServer" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "matchId" TEXT NOT NULL REFERENCES "SportsMatch"("id") ON DELETE CASCADE,
  "name" TEXT NOT NULL,
  "streamUrl" TEXT NOT NULL,
  "quality" TEXT DEFAULT 'HD',
  "isActive" BOOLEAN DEFAULT true,
  "order" INTEGER DEFAULT 0,
  "createdAt" TIMESTAMPTZ DEFAULT now(),
  "updatedAt" TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- 8. DONATION TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS "Donation" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "method" TEXT NOT NULL,
  "accountName" TEXT NOT NULL,
  "accountNumber" TEXT NOT NULL,
  "qrCode" TEXT,
  "message" TEXT,
  "isActive" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMPTZ DEFAULT now(),
  "updatedAt" TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- 9. OTP VERIFICATION TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS "OtpVerification" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "email" TEXT NOT NULL,
  "otp" TEXT NOT NULL,
  "verified" BOOLEAN DEFAULT false,
  "expiresAt" TIMESTAMPTZ NOT NULL,
  "createdAt" TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS "idx_user_email" ON "User"("email");
CREATE INDEX IF NOT EXISTS "idx_user_role" ON "User"("role");
CREATE INDEX IF NOT EXISTS "idx_channel_category" ON "Channel"("category");
CREATE INDEX IF NOT EXISTS "idx_channel_featured" ON "Channel"("featured");
CREATE INDEX IF NOT EXISTS "idx_channel_server_channel" ON "ChannelServer"("channelId");
CREATE INDEX IF NOT EXISTS "idx_favorite_user" ON "Favorite"("userId");
CREATE INDEX IF NOT EXISTS "idx_favorite_channel" ON "Favorite"("channelId");
CREATE INDEX IF NOT EXISTS "idx_watchhistory_user" ON "WatchHistory"("userId");
CREATE INDEX IF NOT EXISTS "idx_sports_match_status" ON "SportsMatch"("status");
CREATE INDEX IF NOT EXISTS "idx_sports_match_time" ON "SportsMatch"("matchTime");
CREATE INDEX IF NOT EXISTS "idx_sports_server_match" ON "SportsServer"("matchId");
CREATE INDEX IF NOT EXISTS "idx_otp_email" ON "OtpVerification"("email");

-- ============================================
-- ROW LEVEL SECURITY (RLS) - Enable but allow service role full access
-- ============================================
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Channel" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ChannelServer" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Favorite" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "WatchHistory" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SportsMatch" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SportsServer" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Donation" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "OtpVerification" ENABLE ROW LEVEL SECURITY;

-- Service role can do everything (using anon key for read, service role for write)
CREATE POLICY "Service role full access on User" ON "User" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on Channel" ON "Channel" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on ChannelServer" ON "ChannelServer" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on Favorite" ON "Favorite" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on WatchHistory" ON "WatchHistory" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on SportsMatch" ON "SportsMatch" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on SportsServer" ON "SportsServer" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on Donation" ON "Donation" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on OtpVerification" ON "OtpVerification" FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- REALTIME - Enable for live channels and sports
-- ============================================
ALTER PUBLICATION supabase_realtime ADD TABLE "Channel";
ALTER PUBLICATION supabase_realtime ADD TABLE "SportsMatch";

-- ============================================
-- SEED: Admin user (mdtanvirislam.personal@gmail.com)
-- ============================================
INSERT INTO "User" ("id", "name", "email", "password", "isVerified", "role")
VALUES (
  'admin-001',
  'Admin',
  'mdtanvirislam.personal@gmail.com',
  encode(encode('Tanvir123@123', 'base64')::bytea, 'base64')::text,
  true,
  'admin'
) ON CONFLICT ("email") DO UPDATE SET
  "role" = 'admin',
  "isVerified" = true;

-- ============================================
-- Updated_at trigger function
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_updated_at BEFORE UPDATE ON "User" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_channel_updated_at BEFORE UPDATE ON "Channel" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_channel_server_updated_at BEFORE UPDATE ON "ChannelServer" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sports_match_updated_at BEFORE UPDATE ON "SportsMatch" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sports_server_updated_at BEFORE UPDATE ON "SportsServer" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_donation_updated_at BEFORE UPDATE ON "Donation" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
