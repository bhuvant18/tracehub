import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom'
import { supabase } from './supabaseClient'
import { LogOut, PlusCircle } from 'lucide-react'
import Login from './Login'
import Home from './Home'
import PostItem from './PostItem'

export default function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  // SAFETY CHECK: If keys are missing, show error on screen
  if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
    return (
      <div className="p-10 text-red-600">
        <h1 className="text-2xl font-bold">Configuration Error</h1>
        <p>Your Supabase keys are missing.</p>
        <p>Please check your <code>.env.local</code> file and restart the server.</p>
      </div>
    )
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setLoading(false)
    })
    return () => subscription.unsubscribe()
  }, [])

  if (loading) return <div className="p-10">Loading...</div>

  if (!session) return <Login />

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow p-4 flex justify-between items-center sticky top-0 z-50">

          <Link to="/" className="text-xl font-bold text-gray-800 flex items-center gap-2">
            TraceHub
          </Link>
          <div className="flex gap-4">
            <Link to="/post" className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              <PlusCircle size={18} /> Post Item
            </Link>
            <button onClick={() => supabase.auth.signOut()} className="text-gray-500 hover:text-red-500">
              <LogOut size={20} />
            </button>
          </div>
        </nav>
        <div className="p-4 max-w-4xl mx-auto">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/post" element={<PostItem session={session} />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  )
}