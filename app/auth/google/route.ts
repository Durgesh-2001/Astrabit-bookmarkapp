import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get the actual origin from the request
    const origin = request.headers.get('origin') || 
                   request.headers.get('referer')?.split('/').slice(0, 3).join('/') ||
                   `http://localhost:${process.env.PORT || 3000}`
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    })

    if (error) {
      return NextResponse.json(
        { error: error.message, details: error },
        { status: 400 }
      )
    }

    if (!data?.url) {
      return NextResponse.json(
        { error: 'No OAuth URL returned. Check Supabase Google provider configuration.' },
        { status: 500 }
      )
    }

    return NextResponse.redirect(data.url)
    
  } catch (err) {
    return NextResponse.json(
      { error: 'Internal server error', details: String(err) },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  // Alternative: Handle GET requests directly
  return POST(request)
}
