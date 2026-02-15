-- Create bookmarks table
CREATE TABLE IF NOT EXISTS public.bookmarks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL CHECK (char_length(title) > 0 AND char_length(title) <= 200),
    url TEXT NOT NULL CHECK (url ~* '^https?://.*')
);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON public.bookmarks(user_id);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_bookmarks_created_at ON public.bookmarks(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view their own bookmarks" ON public.bookmarks;
DROP POLICY IF EXISTS "Users can insert their own bookmarks" ON public.bookmarks;
DROP POLICY IF EXISTS "Users can update their own bookmarks" ON public.bookmarks;
DROP POLICY IF EXISTS "Users can delete their own bookmarks" ON public.bookmarks;

-- RLS Policy: Users can only SELECT their own bookmarks
CREATE POLICY "Users can view their own bookmarks"
    ON public.bookmarks
    FOR SELECT
    USING (auth.uid() = user_id);

-- RLS Policy: Users can only INSERT bookmarks with their own user_id
CREATE POLICY "Users can insert their own bookmarks"
    ON public.bookmarks
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can only UPDATE their own bookmarks
CREATE POLICY "Users can update their own bookmarks"
    ON public.bookmarks
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can only DELETE their own bookmarks
CREATE POLICY "Users can delete their own bookmarks"
    ON public.bookmarks
    FOR DELETE
    USING (auth.uid() = user_id);

-- Enable Realtime for bookmarks table
ALTER PUBLICATION supabase_realtime ADD TABLE public.bookmarks;

-- Grant necessary permissions
GRANT ALL ON public.bookmarks TO authenticated;
GRANT ALL ON public.bookmarks TO service_role;
