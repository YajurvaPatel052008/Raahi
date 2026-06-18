'use client'

import { useState } from 'react'
import Link from 'next/link'
import { login } from '@/actions/auth'

export default function LoginPage({ searchParams }) {
  const [error, setError] = useState(searchParams?.error || null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const formData = new FormData(e.target)
    const result = await login(formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-brand">
          <Link href="/landing" className="brand-logo">RAAHI</Link>
          <h1 className="auth-title">Welcome back</h1>
          <p className="auth-subtitle">Sign in to your Raahi account</p>
        </div>

        {error && (
          <div className="alert alert-error">
            <span>⚠️</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <label className="input-label" htmlFor="email">College Email</label>
            <input
              id="email"
              name="email"
              type="email"
              className="input"
              placeholder="you@acropolis.in"
              required
            />
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              className="input"
              placeholder="••••••••"
              required
            />
          </div>

          <div style={{ textAlign: 'right', marginTop: '-8px' }}>
            <Link href="/forgot-password" className="text-link" style={{ fontSize: '13px' }}>
              Forgot password?
            </Link>
          </div>

          <button type="submit" className="btn btn-primary w-full" disabled={loading}>
            {loading ? <span className="spinner spinner-sm" /> : 'Sign In'}
          </button>
        </form>

        <p className="auth-footer">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-link">Create one</Link>
        </p>
      </div>
    </div>
  )
}
