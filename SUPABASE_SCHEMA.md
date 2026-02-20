# Supabase Schema Setup

This document describes how to set up the Supabase backend for the Seek NYC Transit App.

## Prerequisites

1. Create a free [Supabase](https://supabase.com) project
2. Note your **Project URL** and **Anon Key** from the project settings

## Database Schema

Run the following SQL in your Supabase SQL Editor:

```sql
-- Create favorites table
CREATE TABLE IF NOT EXISTS favorites (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id TEXT NOT NULL,
    stop_id TEXT NOT NULL,
    stop_code TEXT,
    stop_name TEXT,
    lat DOUBLE PRECISION,
    lon DOUBLE PRECISION,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, stop_id)
);

-- Enable Row Level Security
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- Allow anonymous users to read/write their own favorites
CREATE POLICY "Users can read own favorites"
    ON favorites FOR SELECT
    USING (true);

CREATE POLICY "Users can insert own favorites"
    ON favorites FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Users can update own favorites"
    ON favorites FOR UPDATE
    USING (true);

CREATE POLICY "Users can delete own favorites"
    ON favorites FOR DELETE
    USING (true);
```

## Configuration

Update the following constants in `app.js` with your Supabase project credentials:

```javascript
const SUPABASE_URL = 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key';
```

## Fallback

The app works without Supabase by using `localStorage` as a fallback for storing favorites and preferences. No setup is required for local-only usage.
