# Supabase Database Setup

This directory contains the database migration scripts for the Smart Bookmark Manager.

## Setup Instructions

### 1. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Fill in the project details and wait for the database to be provisioned

### 2. Run the Migration

Open the SQL Editor in your Supabase dashboard and execute the migration file:

1. Go to your Supabase project dashboard
2. Click on "SQL Editor" in the left sidebar
3. Click "New Query"
4. Copy the contents of `001_create_bookmarks_table.sql`
5. Paste it into the SQL editor
6. Click "Run" to execute

### 3. Configure Google OAuth

1. In your Supabase dashboard, go to "Authentication" > "Providers"
2. Find "Google" and enable it
3. Follow the instructions to set up Google OAuth:
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create a new project or select an existing one
   - Enable Google+ API
   - Go to "Credentials" and create OAuth 2.0 Client ID
   - Add authorized redirect URIs:
     - `https://your-project-ref.supabase.co/auth/v1/callback`
   - Copy the Client ID and Client Secret
4. Paste the Client ID and Client Secret into Supabase
5. Save the configuration

### 4. Verify Setup

You can verify the setup by running this query in the SQL Editor:

```sql
-- Check if table exists and RLS is enabled
SELECT 
    tablename, 
    rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'bookmarks';

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'bookmarks';
```

## Database Schema

### bookmarks table

| Column     | Type      | Description                          |
|------------|-----------|--------------------------------------|
| id         | UUID      | Primary key (auto-generated)         |
| created_at | TIMESTAMP | Creation timestamp (auto-generated)  |
| user_id    | UUID      | Foreign key to auth.users            |
| title      | TEXT      | Bookmark title (1-200 characters)    |
| url        | TEXT      | Valid HTTP/HTTPS URL                 |

## Row Level Security Policies

The following RLS policies ensure complete data isolation:

1. **SELECT**: Users can only view their own bookmarks
2. **INSERT**: Users can only create bookmarks with their own user_id
3. **UPDATE**: Users can only modify their own bookmarks
4. **DELETE**: Users can only delete their own bookmarks

All policies use `auth.uid() = user_id` to enforce user isolation.

## Realtime Configuration

The bookmarks table is enabled for Supabase Realtime, allowing:
- Instant updates across multiple browser tabs
- Real-time INSERT, UPDATE, and DELETE notifications
- Automatic UI synchronization without polling
