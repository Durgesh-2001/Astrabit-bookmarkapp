# Astra-mark 🔖

A real-time bookmark manager where users can save, view, and delete bookmarks with instant synchronization across tabs. Built with Next.js 15 App Router, Supabase, and Tailwind CSS.

## Project Requirements

This application was built to meet the following specifications:

1. ✅ **Google OAuth Only** - User can sign up and log in using Google (no email/password authentication)
2. ✅ **Add Bookmarks** - Logged-in user can add a bookmark (URL + title)
3. ✅ **Private Bookmarks** - Bookmarks are private to each user (User A cannot see User B's bookmarks)
4. ✅ **Real-time Updates** - Bookmark list updates in real-time without page refresh (if you open two tabs and add a bookmark in one, it should appear in the other)
5. ✅ **Delete Bookmarks** - User can delete their own bookmarks
6. ✅ **Deployed on Vercel** - App is deployed on Vercel with a working live URL

**Tech Stack**: Next.js (App Router), Supabase (Auth, Database, Realtime), Tailwind CSS

## Live Demo

**Live Site**: [Your Vercel URL here]  
**Repository**: [Your GitHub URL here]

**Note**: This project was developed with assistance from GitHub Copilot (Claude Sonnet 4.5) for implementation assistance. Design decisions, architecture choices, and OAuth configuration approach were my own.

## Features

- **Google OAuth Authentication** - Users can only sign in with Google
- **Row Level Security** - Each user can only access their own bookmarks (enforced at database level)
- **Real-time Sync** - Add or delete a bookmark in one tab, it updates instantly in all other tabs
- **Responsive Design** - Works on desktop and mobile
- **Input Validation** - Both client-side and server-side validation using Zod
- **Server Actions** - Using Next.js server actions instead of API routes

## Tech Stack

- Next.js 15 (App Router)
- Supabase (PostgreSQL, Authentication, Realtime)
- TypeScript
- Tailwind CSS
- Zod (validation)

## How Security Works

**Row Level Security (RLS)**: All database operations (SELECT, INSERT, UPDATE, DELETE) enforce `auth.uid() = user_id`. This means the database itself ensures users can only see and modify their own bookmarks, even if they try to manipulate API requests.

## How Real-time Works

Using **Supabase Realtime** with PostgreSQL's logical replication:
- Clients subscribe to the bookmarks table
- Database pushes INSERT/DELETE events to all connected clients
- Changes appear instantly (under 100ms) across all tabs
- RLS policies automatically filter events, so users only see their own bookmark changes

## Getting Started

You'll need:
- Node.js 18+ and npm
- A Supabase account (free tier works fine)
- A Google Cloud account for OAuth setup

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd smart-bookmark-manager
npm install
```

### 2. Set Up Supabase

1. Create a new project at [https://supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the migration from `supabase/migrations/001_create_bookmarks_table.sql`

### 3. Configure Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com) and create OAuth credentials
2. Add redirect URI: `https://<your-project-ref>.supabase.co/auth/v1/callback`
3. In Supabase: **Authentication** > **Providers** > Enable **Google** and add your credentials

### 4. Environment Variables

Create `.env.local`:

```bash
cp .env.local.example .env.local
```

Update with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Find these in Supabase: **Settings** > **API**

### 5. Run Locally

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Deployment to Vercel

1. Push code to GitHub
2. Import to Vercel and add environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
3. Deploy
4. Update Google OAuth redirect URIs with your Vercel URL
5. Update Supabase site URL to your Vercel domain

## Key Implementation Details

**Authentication**: Google OAuth → callback handler → session stored in secure cookies → middleware protects routes

**Bookmarks**: Server actions handle CRUD with Zod validation. Initial data fetched server-side, updates via realtime subscription.

**Security**: RLS policies, middleware checks, input validation, secure cookie handling

## Problems I Ran Into and How I Solved Them

**1. Real-time Not Working Across Tabs**

Realtime events weren't appearing in other tabs. Fixed by adding the bookmarks table to the Supabase realtime publication:
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE public.bookmarks;
```

**2. OAuth Redirect Loop**

Users got stuck in a redirect loop after Google login. The issue was improper cookie handling in the middleware. Fixed by using `@supabase/ssr` package with correct `setAll` cookie method.

**3. TypeScript Errors with Supabase Data**

Got type errors when working with database rows. Created type definitions in `types/database.ts` that exactly match the database schema.

## Testing Real-time Functionality

1. Open the app in two browser tabs with the same account
2. Add a bookmark in one tab - it appears instantly in the other
3. Delete a bookmark in one tab - it disappears from both immediately

## Project Submission

### Deliverables

1. **Live Vercel URL**: [Your deployed URL] - Test by logging in with any Google account
2. **GitHub Repository**: [Your repo URL] - Public repository with complete source code
3. **README.md**: This comprehensive documentation includes:
   - Complete implementation details
   - Problems encountered and solutions (see "Challenges & Solutions" section)
   - Architecture and design decisions
   - Setup and deployment instructions

### Development Notes

- Used GitHub Copilot (Claude Sonnet 4.5) to help with implementation
- Design decisions, architecture, and OAuth configuration approach were independently planned
- All problems documented above were researched and solved through debugging.

### Testing Instructions

1. Visit the live Vercel URL
2. Click "Continue with Google" and sign in with any Google account
3. Add a bookmark with a title and URL
4. Open the app in another browser tab (same account)
5. Add/delete bookmarks in either tab - changes appear instantly in both tabs
6. Sign out and verify you cannot access bookmarks without authentication
7. Sign in with a different Google account - verify you only see your own bookmarks

## License

MIT License - free to use for learning or production.

---

**Built with ❤️ by Durgesh**
**using Next.js, Supabase, Tailwind CSS and Bit of Claude Sonnet 😅**