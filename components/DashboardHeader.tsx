'use client'

import { useState } from 'react'
import Link from 'next/link'
import SignOutButton from './SignOutButton'

interface DashboardHeaderProps {
  userEmail: string
}

export default function DashboardHeader({ userEmail }: DashboardHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-3">
          {/* Left: Logo + Brand */}
          <div className="flex items-center gap-2 sm:gap-3">
            <img 
              src="/favicon.png" 
              alt="Astra-mark Logo" 
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg object-contain"
            />
            <h1 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 whitespace-nowrap">
              Astra-mark
            </h1>
          </div>

          {/* Right: User Email + Menu */}
          <div className="flex items-center gap-3">
            {/* User Email */}
            <div className="hidden sm:flex items-center gap-2 text-xs sm:text-sm text-gray-600 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-200">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="font-medium truncate max-w-[150px] md:max-w-[200px]">{userEmail}</span>
            </div>

            {/* Desktop: Home + Sign Out Buttons */}
            <div className="hidden md:flex items-center gap-2">
              <Link
                href="/home"
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Home
              </Link>
              <SignOutButton />
            </div>

            {/* Mobile: Hamburger Menu */}
            <div className="md:hidden relative">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center justify-center w-10 h-10 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                aria-label="Toggle menu"
                aria-expanded={isMenuOpen}
              >
                {isMenuOpen ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>

              {/* Mobile Dropdown Menu */}
              {isMenuOpen && (
                <>
                  {/* Backdrop */}
                  <div 
                    className="fixed inset-0 bg-black/20 z-40"
                    onClick={() => setIsMenuOpen(false)}
                  />
                  
                  {/* Menu */}
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50">
                    {/* User Info */}
                    <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span className="font-medium truncate">{userEmail}</span>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      <Link
                        href="/home"
                        className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        Home
                      </Link>
                      
                      <div className="px-4 py-1">
                        <SignOutButton />
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
