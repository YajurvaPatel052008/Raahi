'use client'

import { useState } from 'react'
import Link from 'next/link'
import { signup } from '@/actions/auth'

const ALLOWED_COLLEGES = [
  { name: 'AITR - Acropolis Institute of Technology & Research', domain: 'aitr.ac.in' },
  { name: 'Acropolis Faculty of Management & Research', domain: 'acropolis.in' },
]

export default function RegisterPage() {
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [password, setPassword] = useState('')

  const getStrength = (p) => {
    if (p.length === 0) return { label: '', color: '' }
    if (p.length < 6) return { label: 'Weak', color: '#ef4444' }
    if (p.length < 10) return { label: 'Fair', color: '#f97316' }
    return { label: 'Strong', color: '#22c55e' }
  }
  const strength = getStrength(password)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const formData = new FormData(e.target)
    if (formData.get('password') !== formData.get('confirmPassword')) {
      setError('Passwords do not match.')
      setLoading(false)
      return
    }
    const result = await signup(formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-container" style={{ maxWidth: '500px' }}>
        <div className="auth-brand">
          <Link href="/landing" className="brand-logo">RAAHI</Link>
          <h1 className="auth-title">Join Raahi</h1>
          <p className="auth-subtitle">Create your account with your college email</p>
        </div>

        {error && (
          <div className="alert alert-error">
            <span>⚠️</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-grid form-grid-2">
            <div className="input-group">
              <label className="input-label">First Name</label>
              <input name="fullName" type="text" className="input" placeholder="Arjun" required />
            </div>
            <div className="input-group">
              <label className="input-label">Last Name</label>
              <input name="lastName" type="text" className="input" placeholder="Sharma" required />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">College Email</label>
            <input name="email" type="email" className="input" placeholder="you@aitr.ac.in" required />
            <div className="input-hint">Only @aitr.ac.in and @acropolis.in emails are accepted</div>
          </div>

          <div className="input-group">
            <label className="input-label">College</label>
            <select name="college" className="input" required>
              <option value="">Select your college...</option>
              {ALLOWED_COLLEGES.map(c => (
                <option key={c.domain} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="input-group">
            <label className="input-label">Password</label>
            <input
              name="password"
              type="password"
              className="input"
              placeholder="Create a strong password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            {password && (
              <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ flex: 1, height: '4px', background: '#e5e7eb', borderRadius: '2px' }}>
                  <div style={{ width: password.length < 6 ? '33%' : password.length < 10 ? '66%' : '100%', height: '100%', background: strength.color, borderRadius: '2px', transition: 'all 0.3s' }} />
                </div>
                <span style={{ fontSize: '12px', color: strength.color, fontWeight: 500 }}>{strength.label}</span>
              </div>
            )}
          </div>

          <div className="input-group">
            <label className="input-label">Confirm Password</label>
            <input name="confirmPassword" type="password" className="input" placeholder="Repeat password" required />
          </div>

          <button type="submit" className="btn btn-primary w-full" disabled={loading}>
            {loading ? <span className="spinner spinner-sm" /> : 'Create Account'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account?{' '}
          <Link href="/login" className="text-link">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
