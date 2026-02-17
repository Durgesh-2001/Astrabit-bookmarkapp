'use client'

import { useEffect, useState, useTransition, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { createBookmark, deleteBookmark } from '@/app/actions/bookmarks'
import type { Bookmark } from '@/types/database'
import DeleteConfirmationModal from './DeleteConfirmationModal'

interface BookmarkListProps {
  initialBookmarks: Bookmark[]
}

export default function BookmarkList({ initialBookmarks }: BookmarkListProps) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(initialBookmarks)
  const [isPending, startTransition] = useTransition()
  const [showForm, setShowForm] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [syncStatus, setSyncStatus] = useState<'syncing' | 'synced' | 'error'>('synced')
  const [lastSync, setLastSync] = useState<Date>(new Date())
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: string; title: string }>({ 
    isOpen: false, 
    id: '', 
    title: '' 
  })

  // Polling approach - Check for updates every 2 seconds
  useEffect(() => {
    const supabase = createClient()
    
    const pollBookmarks = async () => {
      try {
        setSyncStatus('syncing')
        
        // Get current user to verify session
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          setSyncStatus('error')
          return
        }
        
        // Fetch latest bookmarks from server (RLS + explicit filter for defense-in-depth)
        const { data: latestBookmarks, error } = await supabase
          .from('bookmarks')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (error) {
          setSyncStatus('error')
          return
        }

        if (latestBookmarks) {
          setBookmarks((current) => {
            // Compare and update bookmarks
            const currentIds = new Set(current.map(b => b.id))
            const latestIds = new Set(latestBookmarks.map(b => b.id))
            
            // Find new bookmarks (in latest but not in current)
            const newBookmarks = latestBookmarks.filter(b => !currentIds.has(b.id))
            
            // Find deleted bookmarks (in current but not in latest)
            const deletedIds = [...currentIds].filter(id => !latestIds.has(id))
            
            // If no changes, return current state
            if (newBookmarks.length === 0 && deletedIds.length === 0) {
              return current
            }
            
            // Return the latest bookmarks (simplest approach)
            return latestBookmarks as Bookmark[]
          })
          
          setSyncStatus('synced')
          setLastSync(new Date())
        }
      } catch (err) {
        setSyncStatus('error')
      }
    }

    // Poll immediately on mount
    pollBookmarks()

    // Then poll every 2 seconds
    const pollInterval = setInterval(pollBookmarks, 2000)

    return () => {
      clearInterval(pollInterval)
    }
  }, []) // Empty dependency array - only run once on mount

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setFormError(null)
    
    const form = e.currentTarget
    const formData = new FormData(form)
    
    // Reset form and close immediately for better UX
    form.reset()
    setShowForm(false)
    
    startTransition(async () => {
      const result = await createBookmark(formData)
      
      if (result.error) {
        setFormError(result.error)
        setShowForm(true)
      } else if (result.data) {
        // Manually add to state immediately (polling will sync other tabs)
        setBookmarks((current) => {
          // Check if already exists
          if (current.some(b => b.id === result.data!.id)) {
            return current
          }
          return [result.data!, ...current]
        })
      }
    })
  }

  const handleDelete = useCallback((id: string, title: string) => {
    if (deletingId) return // Prevent multiple deletes
    setDeleteModal({ isOpen: true, id, title })
  }, [deletingId])

  const confirmDelete = useCallback(async () => {
    const { id } = deleteModal
    
    setDeletingId(id)
    
    startTransition(async () => {
      const result = await deleteBookmark(id)
      
      if (result.error) {
        alert(`Error: ${result.error}`)
      }
      // Realtime subscription will remove the bookmark automatically
      
      setDeletingId(null)
      setDeleteModal({ isOpen: false, id: '', title: '' })
    })
  }, [deleteModal])

  const cancelDelete = useCallback(() => {
    setDeleteModal({ isOpen: false, id: '', title: '' })
  }, [])

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Sync Status Indicator - Always Visible */}
      <div className="flex items-center justify-end gap-2 text-xs sm:text-sm">
        <div className="flex items-center gap-1.5 text-green-600 bg-green-50 px-3 py-1.5 rounded-full border border-green-200">
          <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>Auto-sync</span>
        </div>
      </div>

      {/* Add Bookmark Button - Mobile Optimized */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 sm:px-6 py-3 sm:py-3.5 rounded-xl text-sm sm:text-base font-semibold hover:from-blue-700 hover:to-indigo-700 active:from-blue-800 active:to-indigo-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] touch-manipulation"
        >
          <svg className="w-5 h-5 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add New Bookmark
        </button>
      )}

      {/* Add Bookmark Form - Mobile Responsive */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-xl p-4 sm:p-6 border-2 border-indigo-200 animate-fade-in-up">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">New Bookmark</h3>
            <button
              onClick={() => {
                setShowForm(false)
                setFormError(null)
              }}
              className="text-gray-400 hover:text-gray-600 p-1 touch-manipulation"
              aria-label="Close form"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-900 mb-1">
                Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                maxLength={200}
                className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                placeholder="My awesome website"
                disabled={isPending}
                autoFocus
              />
            </div>
            
            <div>
              <label htmlFor="url" className="block text-sm font-medium text-gray-900 mb-1">
                URL
              </label>
              <input
                type="url"
                id="url"
                name="url"
                required
                className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                placeholder="https://example.com"
                disabled={isPending}
              />
            </div>

            {formError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {formError}
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button
                type="submit"
                disabled={isPending}
                className="flex-1 bg-indigo-600 text-white px-4 sm:px-6 py-2 rounded-lg text-sm sm:text-base font-semibold hover:bg-indigo-700 active:bg-indigo-800 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
              >
                {isPending ? 'Saving...' : 'Add Bookmark'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  setFormError(null)
                }}
                disabled={isPending}
                className="px-4 sm:px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg text-sm sm:text-base font-semibold hover:bg-gray-50 active:bg-gray-100 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Bookmarks List - Mobile Responsive */}
      {bookmarks.length === 0 ? (
        <div className="text-center py-12 sm:py-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl shadow-lg border border-gray-200">
          <div className="bg-gradient-to-br from-blue-500 to-indigo-500 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg">
            <svg
              className="w-8 h-8 sm:w-10 sm:h-10 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
              />
            </svg>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">No bookmarks yet</h3>
          <p className="text-sm sm:text-base text-gray-600 max-w-sm mx-auto px-4">Start building your collection. Add your first bookmark to get organized!</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:gap-4">
          {bookmarks.map((bookmark) => {
            const isOptimistic = bookmark.id.startsWith('temp-')
            
            return (
              <div
                key={bookmark.id}
                className={`bg-white rounded-xl shadow-md p-4 sm:p-6 hover:shadow-xl transition-all duration-300 border transform hover:-translate-y-1 ${
                  isOptimistic ? 'border-indigo-200 opacity-70' : 'border-gray-100 hover:border-indigo-200'
                }`}
              >
                <div className="flex items-start justify-between gap-2 sm:gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 break-words">
                        {bookmark.title}
                      </h3>
                      {isOptimistic && (
                        <span className="text-xs text-indigo-600 font-medium">Saving...</span>
                      )}
                    </div>
                    <a
                      href={bookmark.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-800 text-xs sm:text-sm break-all hover:underline block"
                    >
                      {bookmark.url}
                    </a>
                    <p className="text-xs text-gray-500 mt-1 sm:mt-2">
                      {new Date(bookmark.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  
                  <button
                    onClick={() => handleDelete(bookmark.id, bookmark.title)}
                    disabled={isPending || deletingId === bookmark.id || isOptimistic}
                    className="flex-shrink-0 text-red-600 hover:text-red-800 hover:bg-red-50 active:bg-red-100 p-1.5 sm:p-2 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
                    title={isOptimistic ? "Saving..." : "Delete bookmark"}
                    aria-label="Delete bookmark"
                  >
                  {deletingId === bookmark.id ? (
                    <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            )
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        title={deleteModal.title}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        isDeleting={deletingId === deleteModal.id}
      />
    </div>
  )
}
