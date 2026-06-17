'use client'

import { useState } from 'react'
import Link from 'next/link'
import { forgotPassword } from '@/actions/auth'

export default function ForgotPasswordPage() {
  const [state, setState] = useState({ error: null, success: null, loading: false })

  async function handleSubmit(e) {
    e.preventDefault()
    setState({ error: null, success: null, loading: true })
    const formData = new FormData(e.target)
    const result = await forgotPassword(formData)
    setState({
      loading: false,
      error: result?.error || null,
      success: result?.success || null,
    })
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-brand">
          <Link href="/landing" className="brand-logo">RAAHI</Link>
          <h1 className="auth-title">Reset Password</h1>
          <p className="auth-subtitle">We&apos;ll send a reset link to your college email</p>
        </div>

        {state.error && <div className="alert alert-error"><span>⚠️</span> {state.error}</div>}
        {state.success && <div className="alert alert-success"><span>✅</span> {state.success}</div>}

        {!state.success && (
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="input-group">
              <label className="input-label">College Email</label>
              <input name="email" type="email" className="input" placeholder="you@aitr.ac.in" required />
            </div>
            <button type="submit" className="btn btn-primary w-full" disabled={state.loading}>
              {state.loading ? <span className="spinner spinner-sm" /> : 'Send Reset Link'}
            </button>
          </form>
        )}

        <p className="auth-footer">
          <Link href="/login" className="text-link">← Back to Sign In</Link>
        </p>
      </div>
    </div>
  )
}
