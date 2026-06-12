#!/usr/bin/env node

/**
 * M3U Playlist Importer for FiraLive TV
 *
 * Usage:
 *   node scripts/import-m3u.mjs <path-to-m3u-file>
 *   node scripts/import-m3u.mjs                          # reads from m3u-import.txt
 *   cat playlist.m3u | node scripts/import-m3u.mjs -      # reads from stdin
 */

import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const prisma = new PrismaClient();

// ─── CATEGORY MAPPING ────────────────────────────────────────────────────────
const CATEGORY_MAP = {
  'Bangla': 'Bangla',
  'News': 'News',
  'Sports': 'Sports',
  'Religious': 'Religious',
  'Kids': 'Kids',
  'Music': 'Music',
  'Documentary': 'Documentary',
  'Movie': 'Movie',
  'Movies': 'Movie',
  'Indian': 'Indian',
  'Live': 'Entertainment',
  'English': 'English',
  'Channels': 'Entertainment',
  'Hindi': 'Indian',
  'Indian Bangla': 'Bangla',
  'Latest': 'Entertainment',
  'Urdhu': 'Entertainment',
  'Weather': 'News',
};

// ─── FEATURED / TRENDING ─────────────────────────────────────────────────────
const FEATURED_NAMES = new Set(['BTV', 'Somoy TV', 'T Sports', 'Star Sports 1 HD', 'Gazi TV', 'Football World Cup 2026']);
const TRENDING_NAMES = new Set(['T Sports', 'Gazi TV', 'Channel 24', 'Football World Cup 2026', 'Live Sports']);

// ─── SMART CATEGORY DETECTION ────────────────────────────────────────────────
function detectCategoryFromName(name) {
  const lower = name.toLowerCase();

  const rules = [
    { keywords: ['sports', 'sport', 'fifa', 'willow', 'cricket', 'football', 'goal tv', 'gtv', 'gazi', 'espn', 'star sports', 't sports', 'asports', 'premier league', 'la liga', 'eurosport', 'ptv sports', 'bein sport', 'ten 2', 'ten 3', 'sony ten', 'live sports'], category: 'Sports' },
    { keywords: ['news', 'somoy', 'jamuna', 'dbc', 'ekhon', 'channel 24', 'independent', 'atn news', 'cnn', 'al jazeera', 'bbc', 'dw ', 'ndtv', 'sky news', 'cna ', 'abp ananda', 'zee 24', 'tv9 bangla', 'calcutta news', 'kolkata tv', 'tbn', 'france 24', 'cgtn', 'nhk', 'rt news', 'aljazeera'], category: 'News' },
    { keywords: ['cartoon', 'kids', 'doraemon', 'tom & j', 'mr bean', 'gopal bhar', 'baby', 'nickelodeon', 'disney', 'duronto', 'zoo moo', 'duck tv', 'smarty', 'lucky family', 'kids star', 'buddy', 'funny junior', 'nikki', 'rang', 'jungle book', 'pbs kids'], category: 'Kids' },
    { keywords: ['btv', 'rtv', 'channel i', 'deepto', 'ntv', 'channel9', 'bangla', 'ekattor', 'ekushe', 'maasranga', 'boishakhi', 'mohona', 'desh', 'bijoy', 'nexus', 'star jalsha', 'channel s', 'ayna tv', 'channel 1', 'satv', 'deshi', 'g-series', 'gserise', 'amar bangla', 'r plus', 'bengali', 'bengla', 'sangeet bangla', 'dhoom', 'r bangla', 'nk tv', 'zee bangla', 'colors bangla', 'sun bangla', 'sony aath', 'jalsha', 'srk tv', 'green tv'], category: 'Bangla' },
    { keywords: ['sony tv', 'sony sab', 'sony pal', 'sony kal', 'star plus', 'colors hd', 'zee tv', 'and tv', '9xm', '9x jalwa', '8xm', 'b4u', 'e24', 'music india', 'joo music', 'goldmine', 'manoranjan', 'sheemaroo', 'bollywood', 'hare krsna', 'big magic', 'hindi hit', 'zee anmol', 'zee action', 'south station'], category: 'Indian' },
    { keywords: ['hbo', 'national geographic', 'discovery', 'animal planet', 'nat geo', 'history channel', 'dw english', 'star movies'], category: 'English' },
    { keywords: ['movie', 'cinema', 'sony max', 'zee cinema', 'film', 'cineplex', 'cineedge', 'uniques', 'superrix', 'screem', 'crimes', 'true stories', 'intelligence', 'originals', 'lotus', 'action hollywood', 'tofan', 'utv', 'and pictures', 'rishtey', 'goldmines', 'khushboo'], category: 'Movie' },
    { keywords: ['music', 'mtv', 'vh1', 'channel v', 'mtv hits', 'party universe', 'yrf', 'show box', '8xm'], category: 'Music' },
    { keywords: ['peace tv', 'quran', 'islam', 'religious', 'madani', 'makkah', 'sunnah', 'ewtn', 'god tv', 'arihant', 'al quran', 'madina', 'islamic'], category: 'Religious' },
    { keywords: ['documentary', 'discovery science', 'discovery bangla', 'nat geo', 'bbc earth', 'travel xp', 'food food', 'cgtn doc', 'wild', 'accu weather', 'discover pakistan', 'colors infinity', 'history tv'], category: 'Documentary' },
  ];

  for (const rule of rules) {
    for (const kw of rule.keywords) {
      if (lower.includes(kw)) return rule.category;
    }
  }
  return null;
}

function mapCategory(groupTitle, channelName) {
  if (groupTitle && CATEGORY_MAP[groupTitle]) return CATEGORY_MAP[groupTitle];
  const nameCategory = detectCategoryFromName(channelName);
  if (nameCategory) return nameCategory;
  return 'Entertainment';
}

// ─── M3U PARSER ──────────────────────────────────────────────────────────────
function parseM3U(content) {
  const lines = content.split('\n');
  const channels = [];
  let currentInfo = {};

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (line.startsWith('#EXTINF:')) {
      currentInfo = {};

      const logoMatch = line.match(/tvg-logo="([^"]*)"/);
      if (logoMatch) currentInfo.logo = logoMatch[1];

      const groupMatch = line.match(/group-title="([^"]*)"/);
      if (groupMatch) currentInfo.category = groupMatch[1];

      const nameMatch = line.match(/,(.+)$/);
      if (nameMatch) currentInfo.name = nameMatch[1].trim();

    } else if (line && !line.startsWith('#')) {
      // This is a stream URL line
      if (currentInfo.name) {
        // Skip names starting with #KODIPROP
        const cleanName = currentInfo.name
          .replace(/^\d+\.\s*/, '')
          .replace(/[\u{1F300}-\u{1F9FF}]/gu, '')
          .trim();

        if (cleanName.startsWith('#KODIPROP') || cleanName === '') {
          currentInfo = {};
          continue;
        }

        // Skip .mpd DASH streams
        const url = line;
        if (url.endsWith('.mpd') || url.includes('manifest.mpd')) {
          console.log(`  ⏭  Skipping DASH stream: ${cleanName} (${url})`);
          currentInfo = {};
          continue;
        }

        // Skip non-http URLs
        if (!url.startsWith('http')) {
          console.log(`  ⏭  Skipping non-HTTP URL: ${cleanName} (${url})`);
          currentInfo = {};
          continue;
        }

        channels.push({
          name: cleanName,
          logo: currentInfo.logo || null,
          category: mapCategory(currentInfo.category || '', cleanName),
          streamUrl: url,
        });
      }
      currentInfo = {};
    } else if (!line) {
      currentInfo = {};
    }
  }

  return channels;
}

// ─── MAIN IMPORT LOGIC ───────────────────────────────────────────────────────
async function importM3U(content) {
  console.log('📋 Parsing M3U content...');
  const parsedChannels = parseM3U(content);
  console.log(`📋 Parsed ${parsedChannels.length} channels from M3U`);

  // Get existing channels
  const existingChannels = await prisma.channel.findMany({
    select: { id: true, name: true, streamUrl: true, logo: true, backupUrls: true },
  });
  console.log(`📦 Found ${existingChannels.length} existing channels in database`);

  // Build lookup structures
  const exactMatchSet = new Set(
    existingChannels.map(c => `${c.name}|${c.streamUrl}`)
  );
  const nameToChannel = new Map();
  for (const c of existingChannels) {
    // Use lowercase for case-insensitive matching
    nameToChannel.set(c.name.toLowerCase(), c);
  }

  let imported = 0;
  let duplicates = 0;
  let backups = 0;

  for (const ch of parsedChannels) {
    // Check exact name+URL match
    const key = `${ch.name}|${ch.streamUrl}`;
    if (exactMatchSet.has(key)) {
      duplicates++;
      continue;
    }

    // Check if a channel with the same name already exists (case-insensitive)
    const existingChannel = nameToChannel.get(ch.name.toLowerCase());

    if (existingChannel) {
      // Same name, different URL → add as backup URL
      let currentBackups = [];
      try {
        if (existingChannel.backupUrls) {
          currentBackups = typeof existingChannel.backupUrls === 'string'
            ? JSON.parse(existingChannel.backupUrls)
            : Array.isArray(existingChannel.backupUrls)
              ? existingChannel.backupUrls
              : [];
        }
      } catch {
        currentBackups = [];
      }

      // Don't add duplicate backup URLs
      if (!currentBackups.includes(ch.streamUrl) && existingChannel.streamUrl !== ch.streamUrl) {
        currentBackups.push(ch.streamUrl);

        await prisma.channel.update({
          where: { id: existingChannel.id },
          data: {
            backupUrls: JSON.stringify(currentBackups),
            logo: existingChannel.logo || ch.logo,
          },
        });

        backups++;
        console.log(`  🔄 Added backup URL for "${ch.name}" (now ${currentBackups.length} backup${currentBackups.length > 1 ? 's' : ''})`);
      }
      duplicates++;
      continue;
    }

    // New channel → create it
    const isFeatured = FEATURED_NAMES.has(ch.name);
    const isTrending = TRENDING_NAMES.has(ch.name);

    await prisma.channel.create({
      data: {
        name: ch.name,
        logo: ch.logo,
        category: ch.category,
        streamUrl: ch.streamUrl,
        isLive: true,
        enabled: true,
        featured: isFeatured,
        trending: isTrending,
        views: Math.floor(Math.random() * 3000) + 200,
      },
    });

    imported++;
    exactMatchSet.add(key);

    // Update the name map so subsequent same-name channels become backups
    const newChannel = await prisma.channel.findFirst({
      where: { name: ch.name, streamUrl: ch.streamUrl },
      select: { id: true, name: true, streamUrl: true, logo: true, backupUrls: true },
    });
    if (newChannel) {
      nameToChannel.set(ch.name.toLowerCase(), newChannel);
    }
  }

  return { imported, duplicates, backups };
}

// ─── ENTRY POINT ─────────────────────────────────────────────────────────────
async function main() {
  console.log('🚀 FiraLive TV — M3U Playlist Importer\n');

  // Determine input source
  const arg = process.argv[2];
  let content;

  if (arg === '-') {
    // Read from stdin
    console.log('📖 Reading from stdin...');
    const chunks = [];
    for await (const chunk of process.stdin) {
      chunks.push(chunk);
    }
    content = Buffer.concat(chunks).toString('utf-8');
  } else if (arg) {
    // Read from specified file
    const filePath = resolve(arg);
    console.log(`📖 Reading from file: ${filePath}`);
    content = readFileSync(filePath, 'utf-8');
  } else {
    // Default: read from m3u-import.txt in project root
    const defaultPath = resolve(import.meta.dirname, '..', 'm3u-import.txt');
    console.log(`📖 Reading from default file: ${defaultPath}`);
    content = readFileSync(defaultPath, 'utf-8');
  }

  if (!content || content.trim().length === 0) {
    console.error('❌ No M3U content provided!');
    process.exit(1);
  }

  const stats = await importM3U(content);

  console.log('\n' + '═'.repeat(50));
  console.log('📊 IMPORT RESULTS');
  console.log('═'.repeat(50));
  console.log(`  ✅ New channels imported:  ${stats.imported}`);
  console.log(`  🔄 Backup URLs added:      ${stats.backups}`);
  console.log(`  ⏭  Duplicates skipped:     ${stats.duplicates}`);
  console.log('═'.repeat(50));

  // Print final channel count
  const totalChannels = await prisma.channel.count();
  console.log(`  📺 Total channels in DB:   ${totalChannels}`);
  console.log('');
}

main()
  .catch(e => {
    console.error('❌ Import failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
