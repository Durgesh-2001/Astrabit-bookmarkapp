import Image from 'next/image'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import LoginButton from './LoginButton'

export default async function LoginPage() {
  const supabase = await createClient()
  
  // Check if user is already logged in
  const { data: { user } } = await supabase.auth.getUser()
  
  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="relative bg-white rounded-3xl shadow-xl p-8 sm:p-12 md:p-14 max-w-lg w-full border border-gray-200 animate-fade-in-up">
        {/* Logo Section */}
        <div className="text-center mb-10">
          <Image
            src="/favicon.png"
            alt="Astra-mark Logo"
            width={96}
            height={96}
            className="w-24 h-24 mx-auto mb-8 object-contain rounded-3xl"
            priority
          />
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            Astra-mark
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 leading-relaxed">
            Your smart bookmark manager
          </p>
        </div>

        {/* Sign In Section */}
        <div className="space-y-6 mb-10">
          <LoginButton />
          
          <p className="text-center text-sm text-gray-500">
            Secure sign-in with your Google account
          </p>
        </div>

        {/* Features Section */}
        <div className="pt-8 border-t border-gray-200 mb-10">
          <div className="space-y-4">
            {[
              { icon: '🚀', text: 'Real-time sync across devices' },
              { icon: '🔒', text: 'Secure & private by default' },
              { icon: '⚡', text: 'Lightning fast performance' },
            ].map((feature, index) => (
              <div key={index} className="flex items-center justify-center gap-3 text-sm text-gray-700">
                <span className="text-2xl">{feature.icon}</span>
                <span className="font-medium">{feature.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Back to Home Button */}
        <div className="text-center">
          <a 
            href="/home"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </a>
        </div>
      </div>
    </div>
  )
}
