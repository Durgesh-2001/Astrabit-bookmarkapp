import { redirect } from 'next/navigation'

// Root redirects to home (landing page)
export default function RootPage() {
  redirect('/home')
}
