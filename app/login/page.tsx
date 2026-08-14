'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      if (res.ok) {
        const data = await res.json()
        if (data.role === 'ADMIN') {
          router.push('/admin')
        } else {
          router.push('/')
        }
      } else {
        const data = await res.json()
        setError(data.error || 'Login failed')
      }
    } catch (err) {
      setError('An error occurred')
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white/80 p-8 shadow-2xl backdrop-blur-xl border border-white/50">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 shadow-lg shadow-blue-600/30">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Login Sistem</h1>
          <p className="mt-2 text-sm text-gray-500">Silakan masuk untuk melanjutkan</p>
        </div>
        
        {error && (
          <div className="mb-6 flex items-center rounded-lg bg-red-50 p-4 text-red-700 border border-red-200 shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}
        
        <form onSubmit={handleLogin} className="flex flex-col space-y-5">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">Username</label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                type="text"
                className="block w-full rounded-xl border border-gray-200 bg-gray-50/50 py-3 pl-10 pr-4 text-gray-900 placeholder-gray-400 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder="Masukkan username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">Password</label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                type="password"
                className="block w-full rounded-xl border border-gray-200 bg-gray-50/50 py-3 pl-10 pr-4 text-gray-900 placeholder-gray-400 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>
          
          <button
            type="submit"
            className="mt-2 flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all active:scale-[0.98]"
          >
            Masuk Sekarang
          </button>
        </form>
      </div>
    </div>
  )
}
