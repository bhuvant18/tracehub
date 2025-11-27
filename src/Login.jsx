import { useState } from 'react'
import { supabase } from './supabaseClient'

export default function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [isSignUp, setIsSignUp] = useState(false)

    const handleAuth = async (e) => {
        e.preventDefault()

        // --- NEW: DOMAIN RESTRICTION CHECK ---
        if (!email.endsWith('@saividya.ac.in')) {
            alert('Access Restricted: Only @saividya.ac.in emails can sign up.')
            return
        }
        // -------------------------------------

        setLoading(true)

        if (isSignUp) {
            const { data, error } = await supabase.auth.signUp({ email, password })
            if (error) alert(error.message)
            else {
                if (data.session) window.location.reload()
                else alert('Please check your email for a confirmation link.')
            }
        } else {
            const { data, error } = await supabase.auth.signInWithPassword({ email, password })
            if (error) alert(error.message)
            else if (data.session) window.location.reload()
        }
        setLoading(false)
    }

    return (
        <div className="flex items-center justify-center h-screen bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-md w-96">
                <h1 className="text-2xl font-bold mb-2 text-center text-black">
                    {isSignUp ? 'Create Account' : 'Welcome to TraceHub'}
                </h1>
                <p className="text-gray-500 mb-6 text-center text-sm">
                    Strictly for @saividya.ac.in
                </p>

                <form onSubmit={handleAuth} className="space-y-4">
                    <input
                        type="email"
                        placeholder="Student Email (@saividya.ac.in)"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full p-2 border rounded text-black bg-white"
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-2 border rounded text-black bg-white"
                        required
                        minLength={6}
                    />
                    <button disabled={loading} className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 font-bold">
                        {loading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Log In')}
                    </button>
                </form>

                <div className="mt-4 text-center">
                    <button onClick={() => setIsSignUp(!isSignUp)} className="text-sm text-blue-600 hover:underline">
                        {isSignUp ? 'Already have an account? Log In' : 'Need an account? Sign Up'}
                    </button>
                </div>
            </div>
        </div>
    )
}