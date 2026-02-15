'use server'

import { createClient } from '@/lib/supabase/server'
import { bookmarkSchema } from '@/lib/validations/bookmark'
import type { Database } from '@/types/database'

type Bookmark = Database['public']['Tables']['bookmarks']['Row']

export async function createBookmark(formData: FormData) {
  try {
    const supabase = await createClient()
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return { error: 'Unauthorized' }
    }

    // Validate input
    const title = formData.get('title') as string
    const url = formData.get('url') as string

    const validationResult = bookmarkSchema.safeParse({ title, url })
    
    if (!validationResult.success) {
      return { error: validationResult.error.errors[0].message }
    }

    // Insert bookmark
    const { data, error } = await supabase
      .from('bookmarks')
      .insert({
        user_id: user.id,
        title: validationResult.data.title,
        url: validationResult.data.url,
      })
      .select()
      .single()

    if (error) {
      return { error: 'Failed to create bookmark' }
    }

    return { data }
  } catch (err) {
    return { error: 'An unexpected error occurred' }
  }
}

export async function deleteBookmark(id: string) {
  try {
    const supabase = await createClient()
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return { error: 'Unauthorized' }
    }

    // Delete bookmark (RLS ensures user can only delete their own)
    const { error } = await supabase
      .from('bookmarks')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      return { error: 'Failed to delete bookmark' }
    }
    
    return { success: true }
  } catch (err) {
    return { error: 'An unexpected error occurred' }
  }
}

export async function getBookmarks(): Promise<{ data?: Bookmark[], error?: string }> {
  try {
    const supabase = await createClient()
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return { error: 'Unauthorized' }
    }

    // Fetch bookmarks (RLS ensures user only sees their own, but we add explicit filter for defense-in-depth)
    const { data, error } = await supabase
      .from('bookmarks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      return { error: 'Failed to fetch bookmarks' }
    }

    return { data }
  } catch (err) {
    return { error: 'An unexpected error occurred' }
  }
}
