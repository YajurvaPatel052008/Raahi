'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createTrip } from '@/actions/trips'

export default function CreateTripPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const formData = new FormData(e.target)
    const result = await createTrip(formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    } else {
      router.push('/trips')
    }
  }

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <Link href="/dashboard" className="sidebar-brand">RAAHI <span className="brand-dot" /></Link>
        </div>
        <nav className="sidebar-nav">
          <Link href="/dashboard" className="sidebar-link">📊 Dashboard</Link>
          <Link href="/trips" className="sidebar-link active">✈️ My Trips</Link>
          <Link href="/discover" className="sidebar-link">🔍 Discover</Link>
        </nav>
      </aside>

      <main className="main-content">
        <div className="container container-md">
          <div className="page-header">
            <div>
              <h1 className="page-title">Create a Trip</h1>
              <p className="page-subtitle">Plan your next adventure and find travel partners.</p>
            </div>
          </div>

          {error && <div className="alert alert-error mb-4"><span>⚠️</span> {error}</div>}

          <div className="card">
            <form onSubmit={handleSubmit} className="auth-form">
              <div className="input-group">
                <label className="input-label">Destination *</label>
                <input name="destination" type="text" className="input" placeholder="e.g., Goa, Manali, Jaipur" required />
              </div>

              <div className="form-grid form-grid-2">
                <div className="input-group">
                  <label className="input-label">Start Date *</label>
                  <input name="startDate" type="date" className="input" required />
                </div>
                <div className="input-group">
                  <label className="input-label">End Date *</label>
                  <input name="endDate" type="date" className="input" required />
                </div>
              </div>

              <div className="form-grid form-grid-2">
                <div className="input-group">
                  <label className="input-label">Budget (₹ per person) *</label>
                  <input name="budget" type="number" className="input" placeholder="5000" min="0" required />
                </div>
                <div className="input-group">
                  <label className="input-label">Max Members *</label>
                  <input name="maxMembers" type="number" className="input" min="2" max="10" defaultValue="4" required />
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Travel Type *</label>
                <select name="travelType" className="input" required>
                  <option value="">Select type...</option>
                  <option value="Adventure">Adventure</option>
                  <option value="Relaxation">Relaxation</option>
                  <option value="Cultural">Cultural</option>
                  <option value="Road Trip">Road Trip</option>
                  <option value="Beach">Beach</option>
                  <option value="Hill Station">Hill Station</option>
                </select>
              </div>

              <div className="input-group">
                <label className="input-label">Description</label>
                <textarea name="description" className="input" rows={4} placeholder="Describe the vibe, what you'll do, expectations for fellow travelers..." />
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={loading}>
                  {loading ? <span className="spinner spinner-sm" /> : '✈️ Create Trip'}
                </button>
                <Link href="/trips" className="btn btn-ghost">Cancel</Link>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}
