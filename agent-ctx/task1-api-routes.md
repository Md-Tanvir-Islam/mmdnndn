# Task: Build FiraLive TV API Routes

## Summary
Built all 12 API route groups for the FiraLive TV IPTV streaming application. All routes use proper TypeScript, `NextRequest`/`NextResponse`, Prisma ORM with typed client, and proper error handling.

## Routes Created

### 1. `/api/channels/route.ts`
- **GET**: List channels with optional filters (`category`, `search`, `featured`, `trending`, `country`, `language`). Only returns enabled channels, sorted by views.
- **POST**: Create channel with validation (name, category, streamUrl required).
- **PUT**: Update channel by ID.
- **DELETE**: Delete channel by ID (query param).

### 2. `/api/sports/route.ts`
- **GET**: List sports matches with optional `sport` and `status` filters, sorted by matchTime.
- **POST**: Create match (team1, team2, matchTime required).
- **PUT**: Update match by ID.
- **DELETE**: Delete match by ID (query param).

### 3. `/api/donations/route.ts`
- **GET**: List active donations only (isActive=true).
- **POST**: Create donation (method, accountName, accountNumber required).
- **PUT**: Update donation by ID.
- **DELETE**: Delete donation by ID (query param).

### 4. `/api/favorites/route.ts`
- **GET**: Get user favorites with channel details (userId query param required).
- **POST**: Toggle favorite - if exists delete (returns favorited:false), if not create (returns favorited:true).

### 5. `/api/history/route.ts`
- **GET**: Get user watch history with channel details (userId required), limited to 50, ordered by watchedAt desc.
- **POST**: Upsert watch history - update progress if exists, create if not.

### 6. `/api/auth/login/route.ts`
- **POST**: Login with email/password. Checks password hash (btoa-based). Returns user without password. Returns 403 with needsVerification if not verified.

### 7. `/api/auth/register/route.ts`
- **POST**: Register with name/email/password (phone, country, heardFrom optional). Hashes password with btoa. Creates 6-digit OTP. Returns devOtp for development.

### 8. `/api/auth/otp/route.ts`
- **POST**: Verify OTP (email, otp required). Checks not expired, marks verified, updates user isVerified=true.

### 9. `/api/admin/stats/route.ts`
- **GET**: Returns { totalUsers, totalChannels, totalMatches, totalFavorites, liveChannels, activeDonations } using Promise.all for efficiency.

### 10. `/api/admin/users/route.ts`
- **GET**: List all users without passwords, with optional search/role filters.
- **PUT**: Update user isBanned/role by ID.

### 11. `/api/admin/m3u/route.ts`
- **POST**: Parse M3U content, import channels with category mapping. Deduplicates by name+streamUrl. Returns { imported, duplicates }.

### 12. `/api/stream/[id]/route.ts`
- **GET**: Stream proxy that hides real stream URLs. Proxies M3U8 manifests with URL rewriting, TS segments. Supports sub-resource proxying via `?url=` param.

## Seed Script
- Created `prisma/seed.ts` with admin user, 48 channels from M3U, 6 sports matches, 4 donation methods.
- Added `db:seed` script to package.json.

## Lint Status
- All files pass `bun run lint` with 0 errors and 0 warnings.
