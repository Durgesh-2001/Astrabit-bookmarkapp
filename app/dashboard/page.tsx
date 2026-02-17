import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { getBookmarks } from '@/app/actions/bookmarks'
import BookmarkList from '@/components/BookmarkList'
import DashboardHeader from '@/components/DashboardHeader'

// Allow caching for better performance
export const dynamic = 'force-dynamic'

async function BookmarksData() {
  const { data: bookmarks = [] } = await getBookmarks()
  return <BookmarkList initialBookmarks={bookmarks} />
}

function BookmarksLoading() {
  return (
    <div className="space-y-4">
      {/* Sync status skeleton */}
      <div className="flex justify-end">
        <div className="h-8 w-24 bg-gray-200 rounded-full animate-pulse"></div>
      </div>
      
      {/* Button skeleton */}
      <div className="h-12 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl animate-pulse"></div>
      
      {/* Bookmark cards skeleton */}
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white rounded-xl shadow-md border border-gray-100 p-4 sm:p-6 animate-pulse">
          <div className="space-y-3">
            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/4"></div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default async function DashboardPage() {
  const supabase = await createClient()

  // Get user info (middleware already verified auth)
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <DashboardHeader userEmail={user?.email || 'Guest'} />

      <main className="max-w-5xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 md:py-10">
        <div className="mb-6 sm:mb-8 animate-fade-in-up">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 sm:mb-3 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            My Bookmarks
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-gray-600 leading-relaxed">
            Save and organize your favorite links. Changes sync Instantly.
          </p>
        </div>

        <div className="animate-fade-in-up animation-delay-200">
          <Suspense fallback={<BookmarksLoading />}>
            <BookmarksData />
          </Suspense>
        </div>
      </main>

      <footer className="mt-12 sm:mt-16 pb-8 sm:pb-10">
        <div className="max-w-5xl mx-auto px-4">
          {/* Divider */}
          <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent mb-8"></div>
          
          <div className="flex flex-col items-center gap-6">
            {/* Built by section */}
            <div className="text-center">
              <p className="text-sm sm:text-base text-gray-700 font-medium flex items-center justify-center gap-2">
                Built with <span className="text-red-500 animate-pulse">❤️</span> by 
                <span className="font-semibold text-gray-900">Durgesh</span>
              </p>
            </div>

            {/* Copyright */}
            <p className="text-xs sm:text-sm text-gray-500">
              © {new Date().getFullYear()} • Abstra-mark 🔖
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
