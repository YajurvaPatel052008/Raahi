import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { calculateMatchScores } from '@/services/matching-engine'

export const metadata = { title: 'Matches — Raahi' }

export default async function MatchesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  let matches = []
  try {
    matches = await calculateMatchScores(user.id)
  } catch (e) {
    // No matches found or engine error
  }

  const getScoreColor = (score) => {
    if (score >= 80) return '#22c55e'
    if (score >= 60) return '#f59e0b'
    return '#94a3b8'
  }

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <Link href="/dashboard" className="sidebar-brand">RAAHI <span className="brand-dot" /></Link>
        </div>
        <nav className="sidebar-nav">
          <Link href="/dashboard" className="sidebar-link">📊 Dashboard</Link>
          <Link href="/discover" className="sidebar-link">🔍 Discover</Link>
          <Link href="/matches" className="sidebar-link active">🤝 Matches</Link>
          <div className="sidebar-section-title">My Travel</div>
          <Link href="/trips" className="sidebar-link">✈️ My Trips</Link>
          <Link href="/chat" className="sidebar-link">💬 Messages</Link>
          <Link href="/reviews" className="sidebar-link">⭐ Reviews</Link>
          <div className="sidebar-section-title">Account</div>
          <Link href="/profile" className="sidebar-link">👤 Profile</Link>
          <Link href="/settings" className="sidebar-link">⚙️ Settings</Link>
        </nav>
      </aside>

      <main className="main-content">
        <div className="container container-full">
          <div className="page-header">
            <div>
              <h1 className="page-title">Your Matches</h1>
              <p className="page-subtitle">Trips and partners ranked by compatibility with your profile.</p>
            </div>
          </div>

          {matches.length > 0 ? (
            <div className="grid grid-3">
              {matches.map(({ trip, host, matchScore, breakdown }) => (
                <div key={trip.id} className="card">
                  {/* Score Circle */}
                  <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                    <div style={{
                      width: '80px', height: '80px', borderRadius: '50%',
                      border: `4px solid ${getScoreColor(matchScore)}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      margin: '0 auto 8px', fontSize: '24px', fontWeight: 800,
                      color: getScoreColor(matchScore)
                    }}>
                      {matchScore}%
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 500, color: getScoreColor(matchScore) }}>
                      {matchScore >= 80 ? 'Highly Compatible' : matchScore >= 60 ? 'Good Match' : 'Partial Match'}
                    </div>
                  </div>

                  {/* Trip Info */}
                  <h3 style={{ fontWeight: 700, fontSize: '18px', textAlign: 'center', marginBottom: '4px' }}>
                    {trip.destination}
                  </h3>
                  <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', textAlign: 'center', marginBottom: '16px' }}>
                    {trip.start_date} → {trip.end_date} · ₹{trip.budget?.toLocaleString()}
                  </p>

                  {/* Breakdown */}
                  <div style={{ borderTop: '1px solid var(--color-border-light)', paddingTop: '16px' }}>
                    <div style={{ fontSize: '12px', fontWeight: 500, marginBottom: '8px', color: 'var(--color-text-muted)' }}>COMPATIBILITY BREAKDOWN</div>
                    {[
                      { label: 'Budget', value: breakdown.budget, max: 30, icon: '💰' },
                      { label: 'Travel Style', value: breakdown.style, max: 30, icon: '🏔️' },
                      { label: 'Interests', value: breakdown.interests, max: 20, icon: '🎯' },
                      { label: 'Destination', value: breakdown.destination, max: 20, icon: '📍' },
                    ].map(item => (
                      <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '13px' }}>
                        <span>{item.icon}</span>
                        <span style={{ width: '90px', color: 'var(--color-text-muted)' }}>{item.label}</span>
                        <div style={{ flex: 1, height: '4px', background: '#e5e7eb', borderRadius: '2px' }}>
                          <div style={{ height: '100%', width: `${(item.value / item.max) * 100}%`, background: getScoreColor(matchScore), borderRadius: '2px' }} />
                        </div>
                        <span style={{ fontWeight: 600, width: '30px', textAlign: 'right' }}>{item.value}/{item.max}</span>
                      </div>
                    ))}
                  </div>

                  {/* Host */}
                  {host && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingTop: '16px', borderTop: '1px solid var(--color-border-light)', marginTop: '16px' }}>
                      <div className="avatar avatar-sm" style={{ background: '#DBEAFE', color: '#2563EB' }}>
                        {host.full_name?.[0] || '?'}
                      </div>
                      <div style={{ flex: 1, fontSize: '14px', fontWeight: 500 }}>{host.full_name}</div>
                    </div>
                  )}

                  <Link href={`/trips/${trip.id}`} className="btn btn-primary w-full" style={{ marginTop: '16px' }}>
                    View Trip
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: '64px', color: 'var(--color-text-muted)' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🤝</div>
              <h3 style={{ fontWeight: 600, marginBottom: '8px' }}>No matches yet</h3>
              <p>Complete your profile with interests and travel style to get matched.</p>
              <Link href="/profile" className="btn btn-primary" style={{ marginTop: '16px' }}>Complete Profile</Link>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
