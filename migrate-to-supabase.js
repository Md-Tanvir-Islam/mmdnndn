/**
 * FiraLive TV - Data Migration Script
 * Migrates data from SQLite to Supabase PostgreSQL
 *
 * Usage:
 * 1. First, run supabase-schema.sql in Supabase SQL Editor
 * 2. Set your DB password in .env file (replace [YOUR-DB-PASSWORD])
 * 3. Run: node migrate-to-supabase.js
 */

const { createClient } = require('@supabase/supabase-js');
const { PrismaClient } = require('@prisma/client');

// SQLite Prisma client (read from local DB)
const sqliteDb = new PrismaClient({
  datasourceUrl: 'file:/home/z/my-project/db/custom.db',
});

// Supabase client (write to Supabase)
const SUPABASE_URL = 'https://quqkfsqxhhhpqkugshwr.supabase.co';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF1cWtmc3F4aGhocHFrdWdzaHdyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTk1MjkwNSwiZXhwIjoyMDk1NTI4OTA1fQ.W3yYll5Xu8djiSlzXeyatyKFhuI9fLkO0BuvERHiKSw';
const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

async function migrate() {
  console.log('🚀 Starting migration from SQLite to Supabase...\n');

  // 1. Migrate Users
  console.log('📦 Migrating Users...');
  const users = await sqliteDb.user.findMany();
  for (const u of users) {
    const { error } = await supabase.from('User').upsert({
      id: u.id,
      name: u.name,
      email: u.email,
      password: u.password,
      phone: u.phone,
      country: u.country,
      heardFrom: u.heardFrom,
      avatar: u.avatar,
      isVerified: u.isVerified,
      role: u.role,
      isBanned: u.isBanned,
      createdAt: u.createdAt.toISOString(),
      updatedAt: u.updatedAt.toISOString(),
    }, { onConflict: 'id' });
    if (error) console.log(`  ❌ User ${u.email}: ${error.message}`);
    else console.log(`  ✅ User ${u.email}`);
  }

  // 2. Migrate Channels
  console.log('\n📦 Migrating Channels...');
  const channels = await sqliteDb.channel.findMany();
  for (const c of channels) {
    const { error } = await supabase.from('Channel').upsert({
      id: c.id,
      name: c.name,
      logo: c.logo,
      thumbnail: c.thumbnail,
      category: c.category,
      country: c.country,
      language: c.language,
      streamUrl: c.streamUrl,
      backupUrls: c.backupUrls,
      featured: c.featured,
      trending: c.trending,
      isLive: c.isLive,
      enabled: c.enabled,
      views: c.views,
      description: c.description,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
    }, { onConflict: 'id' });
    if (error) console.log(`  ❌ Channel ${c.name}: ${error.message}`);
    else console.log(`  ✅ Channel ${c.name}`);
  }

  // 3. Migrate ChannelServers
  console.log('\n📦 Migrating Channel Servers...');
  const servers = await sqliteDb.channelServer.findMany();
  for (const s of servers) {
    const { error } = await supabase.from('ChannelServer').upsert({
      id: s.id,
      channelId: s.channelId,
      name: s.name,
      streamUrl: s.streamUrl,
      quality: s.quality,
      isActive: s.isActive,
      order: s.order,
      createdAt: s.createdAt.toISOString(),
      updatedAt: s.updatedAt.toISOString(),
    }, { onConflict: 'id' });
    if (error) console.log(`  ❌ Server ${s.name}: ${error.message}`);
    else console.log(`  ✅ Server ${s.name}`);
  }

  // 4. Migrate Sports Matches
  console.log('\n📦 Migrating Sports Matches...');
  const matches = await sqliteDb.sportsMatch.findMany();
  for (const m of matches) {
    const { error } = await supabase.from('SportsMatch').upsert({
      id: m.id,
      team1: m.team1,
      team2: m.team2,
      tournament: m.tournament,
      matchTime: m.matchTime.toISOString(),
      team1Logo: m.team1Logo,
      team2Logo: m.team2Logo,
      channelIds: m.channelIds,
      watchLink: m.watchLink,
      banner: m.banner,
      status: m.status,
      sport: m.sport,
      createdAt: m.createdAt.toISOString(),
      updatedAt: m.updatedAt.toISOString(),
    }, { onConflict: 'id' });
    if (error) console.log(`  ❌ Match ${m.team1} vs ${m.team2}: ${error.message}`);
    else console.log(`  ✅ Match ${m.team1} vs ${m.team2}`);
  }

  // 5. Migrate Sports Servers
  console.log('\n📦 Migrating Sports Servers...');
  const sportsServers = await sqliteDb.sportsServer.findMany();
  for (const s of sportsServers) {
    const { error } = await supabase.from('SportsServer').upsert({
      id: s.id,
      matchId: s.matchId,
      name: s.name,
      streamUrl: s.streamUrl,
      quality: s.quality,
      isActive: s.isActive,
      order: s.order,
      createdAt: s.createdAt.toISOString(),
      updatedAt: s.updatedAt.toISOString(),
    }, { onConflict: 'id' });
    if (error) console.log(`  ❌ Sports Server ${s.name}: ${error.message}`);
    else console.log(`  ✅ Sports Server ${s.name}`);
  }

  // 6. Migrate Donations
  console.log('\n📦 Migrating Donations...');
  const donations = await sqliteDb.donation.findMany();
  for (const d of donations) {
    const { error } = await supabase.from('Donation').upsert({
      id: d.id,
      method: d.method,
      accountName: d.accountName,
      accountNumber: d.accountNumber,
      qrCode: d.qrCode,
      message: d.message,
      isActive: d.isActive,
      createdAt: d.createdAt.toISOString(),
      updatedAt: d.updatedAt.toISOString(),
    }, { onConflict: 'id' });
    if (error) console.log(`  ❌ Donation ${d.method}: ${error.message}`);
    else console.log(`  ✅ Donation ${d.method}`);
  }

  // 7. Migrate Favorites
  console.log('\n📦 Migrating Favorites...');
  const favorites = await sqliteDb.favorite.findMany();
  for (const f of favorites) {
    const { error } = await supabase.from('Favorite').upsert({
      id: f.id,
      userId: f.userId,
      channelId: f.channelId,
      createdAt: f.createdAt.toISOString(),
    }, { onConflict: 'id' });
    if (error) console.log(`  ❌ Favorite: ${error.message}`);
  }
  console.log(`  ✅ ${favorites.length} favorites migrated`);

  // 8. Migrate Watch History
  console.log('\n📦 Migrating Watch History...');
  const history = await sqliteDb.watchHistory.findMany();
  for (const h of history) {
    const { error } = await supabase.from('WatchHistory').upsert({
      id: h.id,
      userId: h.userId,
      channelId: h.channelId,
      progress: h.progress,
      watchedAt: h.watchedAt.toISOString(),
    }, { onConflict: 'id' });
    if (error) console.log(`  ❌ History: ${error.message}`);
  }
  console.log(`  ✅ ${history.length} history entries migrated`);

  // 9. Migrate OTP Verifications
  console.log('\n📦 Migrating OTP Verifications...');
  const otps = await sqliteDb.otpVerification.findMany();
  for (const o of otps) {
    const { error } = await supabase.from('OtpVerification').upsert({
      id: o.id,
      email: o.email,
      otp: o.otp,
      verified: o.verified,
      expiresAt: o.expiresAt.toISOString(),
      createdAt: o.createdAt.toISOString(),
    }, { onConflict: 'id' });
    if (error) console.log(`  ❌ OTP ${o.email}: ${error.message}`);
  }
  console.log(`  ✅ ${otps.length} OTP records migrated`);

  await sqliteDb.$disconnect();
  console.log('\n🎉 Migration complete!');
}

migrate().catch(console.error);
