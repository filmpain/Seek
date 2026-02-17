# Supabase Configuration Guide

This guide explains how to configure the Seek app with your Supabase backend.

## Current Configuration

The app is pre-configured with:
- **Token**: `sbp_e93229dd77e37821acfe76ddee3ab8a0c2a15a51`
- **Fallback**: localStorage (works without Supabase)

## Quick Setup

### Option 1: Use Existing Configuration (Recommended for Testing)

The app works immediately with localStorage. No setup required.

### Option 2: Configure Your Own Supabase Instance

1. **Create Supabase Project**
   ```
   - Visit https://supabase.com
   - Create new project
   - Note your Project URL and anon key
   ```

2. **Set Up Database**
   ```sql
   -- Copy from SUPABASE_SCHEMA.md and run in Supabase SQL Editor
   CREATE TABLE favorites (
       id BIGSERIAL PRIMARY KEY,
       user_id TEXT NOT NULL,
       stop_id TEXT NOT NULL,
       stop_code TEXT NOT NULL,
       stop_name TEXT NOT NULL,
       lat DOUBLE PRECISION NOT NULL,
       lon DOUBLE PRECISION NOT NULL,
       created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
       UNIQUE(user_id, stop_id)
   );
   
   -- Enable RLS
   ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
   
   -- Create policy
   CREATE POLICY "Enable all for demo" ON favorites
       FOR ALL USING (true) WITH CHECK (true);
   ```

3. **Update Configuration in app.js**
   ```javascript
   // Line 10-11 in app.js
   const SUPABASE_URL = 'https://your-project-id.supabase.co';
   const SUPABASE_ANON_KEY = 'your-anon-key-here';
   ```

## Features

### What Works Without Supabase
- ✅ All favorites functionality
- ✅ Theme persistence
- ✅ Data stored in browser localStorage
- ✅ No account needed

### What Supabase Adds
- ✅ Cross-device sync
- ✅ Cloud backup of favorites
- ✅ Scalable storage
- ✅ Future: User authentication
- ✅ Future: Advanced features

## Testing

### Verify Supabase Connection

Open browser console and check for:
```
Supabase client initialized
Loaded favorites from Supabase: X
```

### Test Without Supabase

If Supabase is unavailable, you'll see:
```
Supabase initialization failed, using localStorage fallback
Loaded favorites from localStorage: X
```

Both modes work identically from user perspective!

## Troubleshooting

### Favorites Not Syncing

**Check:**
1. Browser console for errors
2. Supabase dashboard for database issues
3. Network tab for blocked requests

**Solution:**
- App falls back to localStorage automatically
- Favorites saved locally, will sync when connection restored

### CORS Errors

**Cause:** Supabase URL or key incorrect

**Solution:**
- Verify SUPABASE_URL matches your project
- Check anon key is correct in Supabase dashboard

## Security Notes

### For Development/Testing
- Current setup uses anonymous user IDs
- RLS policies allow all operations
- Safe for demo and testing

### For Production
- Implement Supabase Auth
- Update RLS policies to check `auth.uid()`
- Use service role key only on backend
- See `SUPABASE_SCHEMA.md` for secure policies

## Environment Variables (Optional)

For build systems like Vite or Next.js:

```bash
# .env.local
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Update app.js to use:
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
```

## Migration from localStorage

If users have existing favorites in localStorage:

1. App loads localStorage data first
2. On next favorite action, syncs to Supabase
3. Future loads use Supabase as source of truth

No data loss - automatic migration!

## Support

- **Database Issues**: Check Supabase Dashboard → Database
- **API Issues**: Check Supabase Dashboard → API
- **Schema Help**: See `SUPABASE_SCHEMA.md`
- **Code Help**: See `TECHNICAL.md`

## Cost

- **Supabase Free Tier**: 500MB database, perfect for this app
- **Expected Usage**: ~1KB per user (very light)
- **Scalability**: Can handle thousands of users on free tier
