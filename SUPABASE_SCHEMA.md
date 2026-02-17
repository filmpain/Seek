# Supabase Database Schema

This document describes the database schema for the Seek NYC Transit App using Supabase.

## Overview

The Seek app uses Supabase for backend data storage, primarily for storing user favorites and preferences. The app works with or without Supabase - if Supabase is unavailable, it gracefully falls back to localStorage.

## Authentication

Currently, the app uses **anonymous user IDs** stored in localStorage. No authentication is required.

- Each user gets a unique ID: `user_<random>_<timestamp>`
- User ID is stored in localStorage: `seek_userId`

## Database Tables

### `favorites`

Stores user's favorite bus stops.

#### Schema

```sql
CREATE TABLE favorites (
    id BIGSERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    stop_id TEXT NOT NULL,
    stop_code TEXT NOT NULL,
    stop_name TEXT NOT NULL,
    lat DOUBLE PRECISION NOT NULL,
    lon DOUBLE PRECISION NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, stop_id)
);

-- Index for faster user queries
CREATE INDEX idx_favorites_user_id ON favorites(user_id);

-- Index for stop lookups
CREATE INDEX idx_favorites_stop_id ON favorites(stop_id);
```

#### Columns

| Column | Type | Description |
|--------|------|-------------|
| `id` | BIGSERIAL | Primary key, auto-incrementing |
| `user_id` | TEXT | Anonymous user identifier |
| `stop_id` | TEXT | MTA Bus Stop ID (e.g., "MTA_305423") |
| `stop_code` | TEXT | Stop code for display (e.g., "305423") |
| `stop_name` | TEXT | Human-readable stop name |
| `lat` | DOUBLE PRECISION | Latitude of the stop |
| `lon` | DOUBLE PRECISION | Longitude of the stop |
| `created_at` | TIMESTAMP | When the favorite was added |
| `updated_at` | TIMESTAMP | Last update timestamp |

#### Row Level Security (RLS)

Enable RLS and create policies for user data isolation:

```sql
-- Enable RLS
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- For production with user authentication, use policies like:
-- CREATE POLICY "Users can view own favorites"
--     ON favorites FOR SELECT
--     USING (auth.uid()::text = user_id);

-- For anonymous/demo usage (current implementation):
-- Note: This allows any user to read all data. Consider implementing 
-- session-based auth or requiring users to only access their own data
-- by checking user_id matches a session token.

CREATE POLICY "Enable read for all users" ON favorites
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON favorites
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON favorites
    FOR UPDATE USING (true);

CREATE POLICY "Enable delete for all users" ON favorites
    FOR DELETE USING (true);

-- For better security in production, replace the above with:
-- CREATE POLICY "Users can manage own favorites" ON favorites
--     FOR ALL USING (user_id = current_setting('app.user_id', true));
```

**Security Note**: The current RLS policies allow unrestricted access for anonymous usage. For production deployments with sensitive data:

1. Implement proper authentication (Supabase Auth, OAuth, etc.)
2. Update RLS policies to check `auth.uid()`
3. Validate user_id matches authenticated user
4. Consider rate limiting and additional security measures

### Future Tables

#### `user_preferences`

Store user preferences like theme, default view, etc.

```sql
CREATE TABLE user_preferences (
    id BIGSERIAL PRIMARY KEY,
    user_id TEXT UNIQUE NOT NULL,
    theme TEXT DEFAULT 'light',
    default_view TEXT DEFAULT 'nearby',
    auto_refresh_interval INTEGER DEFAULT 30,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);
```

#### `recent_searches`

Store recent location searches or viewed stops.

```sql
CREATE TABLE recent_searches (
    id BIGSERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    stop_id TEXT NOT NULL,
    stop_name TEXT NOT NULL,
    accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    access_count INTEGER DEFAULT 1
);

CREATE INDEX idx_recent_searches_user_id ON recent_searches(user_id);
CREATE INDEX idx_recent_searches_accessed_at ON recent_searches(accessed_at);
```

## Setup Instructions

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Note your project URL and anon key

### 2. Run SQL Migrations

In your Supabase SQL editor, run:

```sql
-- Create favorites table
CREATE TABLE favorites (
    id BIGSERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    stop_id TEXT NOT NULL,
    stop_code TEXT NOT NULL,
    stop_name TEXT NOT NULL,
    lat DOUBLE PRECISION NOT NULL,
    lon DOUBLE PRECISION NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, stop_id)
);

CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_favorites_stop_id ON favorites(stop_id);

-- Enable RLS
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- Create policies (permissive for anonymous access)
CREATE POLICY "Enable all operations for all users" ON favorites
    FOR ALL USING (true) WITH CHECK (true);
```

### 3. Update Configuration

In `app.js`, update the Supabase configuration:

```javascript
const SUPABASE_URL = 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key-here';
```

## API Usage

The app automatically handles Supabase operations:

### Loading Favorites

```javascript
const { data, error } = await supabase
    .from('favorites')
    .select('*')
    .eq('user_id', state.userId);
```

### Adding Favorite

```javascript
const { error } = await supabase
    .from('favorites')
    .insert({
        user_id: state.userId,
        stop_id: stop.id,
        stop_code: stop.code,
        stop_name: stop.name,
        lat: stop.lat,
        lon: stop.lon
    });
```

### Removing Favorites

```javascript
await supabase
    .from('favorites')
    .delete()
    .eq('user_id', state.userId);
```

## Data Flow

```
User Action → JavaScript Function → Supabase Client → Database
                                   ↓ (on error)
                                   localStorage (fallback)
```

## Fallback Mechanism

If Supabase is unavailable:
1. All data is stored in localStorage
2. User experience is not affected
3. Console warnings are logged
4. Data syncs when Supabase becomes available

## Environment Variables

For production deployments, consider using environment variables:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Security Considerations

1. **Anon Key**: The anon key is safe to expose in client-side code
2. **RLS Policies**: Always enable RLS for data isolation
3. **Rate Limiting**: Supabase handles rate limiting automatically
4. **CORS**: Supabase allows requests from any origin by default
5. **Data Validation**: Client-side validation is performed before insertion

## Monitoring

Use Supabase Dashboard to:
- Monitor database usage
- View query performance
- Check API analytics
- Monitor storage

## Backup

Supabase automatically backs up your database:
- Point-in-time recovery available
- Manual backups can be triggered from dashboard
- Export data as CSV or JSON

## Migration Path

To migrate from localStorage to Supabase:

1. User loads app
2. App checks for localStorage data
3. If found and Supabase is available, sync to Supabase
4. Clear localStorage after successful sync

This feature can be added in future updates.
