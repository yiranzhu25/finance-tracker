'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: 'var(--grouped-background)' }}
    >
      <div
        className="w-full max-w-sm"
        style={{
          backgroundColor: 'var(--system-background)',
          borderRadius: '16px',
          padding: '40px 32px',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        {/* App name */}
        <div className="text-center mb-8">
          <h1
            style={{
              fontSize: '34px',
              fontWeight: '700',
              letterSpacing: '-0.02em',
              color: 'var(--label)',
              fontFamily:
                "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif",
            }}
          >
            Finance
          </h1>
          <p
            style={{
              fontSize: '15px',
              color: 'var(--system-gray)',
              marginTop: '4px',
            }}
          >
            Personal Finance Tracker
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Email */}
          <div className="flex flex-col gap-1">
            <label
              htmlFor="email"
              style={{ fontSize: '13px', color: 'var(--secondary-label)', fontWeight: '500' }}
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={{
                height: '44px',
                borderRadius: '10px',
                border: '1px solid var(--system-gray4)',
                padding: '0 12px',
                fontSize: '15px',
                outline: 'none',
                transition: 'border-color 0.15s, box-shadow 0.15s',
                width: '100%',
                backgroundColor: 'var(--system-background)',
                color: 'var(--label)',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--system-blue)'
                e.target.style.boxShadow = '0 0 0 3px rgba(0, 122, 255, 0.15)'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--system-gray4)'
                e.target.style.boxShadow = 'none'
              }}
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1">
            <label
              htmlFor="password"
              style={{ fontSize: '13px', color: 'var(--secondary-label)', fontWeight: '500' }}
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{
                height: '44px',
                borderRadius: '10px',
                border: '1px solid var(--system-gray4)',
                padding: '0 12px',
                fontSize: '15px',
                outline: 'none',
                transition: 'border-color 0.15s, box-shadow 0.15s',
                width: '100%',
                backgroundColor: 'var(--system-background)',
                color: 'var(--label)',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--system-blue)'
                e.target.style.boxShadow = '0 0 0 3px rgba(0, 122, 255, 0.15)'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--system-gray4)'
                e.target.style.boxShadow = 'none'
              }}
            />
          </div>

          {/* Error */}
          {error && (
            <p
              style={{
                fontSize: '13px',
                color: 'var(--system-red)',
                backgroundColor: 'rgba(255, 59, 48, 0.08)',
                padding: '8px 12px',
                borderRadius: '8px',
              }}
            >
              {error}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{
              height: '44px',
              borderRadius: '10px',
              backgroundColor: loading ? 'var(--system-gray4)' : 'var(--system-blue)',
              color: '#fff',
              fontSize: '15px',
              fontWeight: '600',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.15s',
              width: '100%',
              marginTop: '4px',
            }}
          >
            {loading ? 'Signing In…' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}
