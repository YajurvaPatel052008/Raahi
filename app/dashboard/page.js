import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { logout } from '@/actions/auth'

export const metadata = { title: 'Dashboard — Raahi' }

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Fetch user's trips
  const { data: trips } = await supabase
    .from('trips')
    .select('*, trip_members(count)')
    .eq('host_id', user.id)
    .order('created_at', { ascending: false })
    .limit(3)

  // Fetch pending join requests for host's trips
  const { data: pendingRequests } = await supabase
    .from('trip_members')
    .select('*, trip:trips(destination), requester:profiles!user_id(full_name, avatar_url)')
    .eq('status', 'pending')
    .in('trip_id', (trips || []).map(t => t.id))

  // Fetch unread notifications count
  const { count: notifCount } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('is_read', false)

  const trustLevel = profile?.trust_level || 'Bronze'
  const trustScore = profile?.trust_score || 0
  const levelColors = {
    'Bronze': '#cd7f32',
    'Silver': '#94a3b8',
    'Gold': '#f59e0b',
    'Explorer Elite': '#2563eb',
  }

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <Link href="/dashboard" className="sidebar-brand">RAAHI <span className="brand-dot" /></Link>
        </div>
        <nav className="sidebar-nav">
          <Link href="/dashboard" className="sidebar-link active">
            <span className="sidebar-link-icon">📊</span><span>Dashboard</span>
          </Link>
          <Link href="/discover" className="sidebar-link">
            <span className="sidebar-link-icon">🔍</span><span>Discover</span>
          </Link>
          <Link href="/matches" className="sidebar-link">
            <span className="sidebar-link-icon">🤝</span><span>Matches</span>
          </Link>
          <div className="sidebar-section-title">My Travel</div>
          <Link href="/trips" className="sidebar-link">
            <span className="sidebar-link-icon">✈️</span><span>My Trips</span>
          </Link>
          <Link href="/chat" className="sidebar-link">
            <span className="sidebar-link-icon">💬</span><span>Messages</span>
          </Link>
          <Link href="/reviews" className="sidebar-link">
            <span className="sidebar-link-icon">⭐</span><span>Reviews</span>
          </Link>
          <div className="sidebar-section-title">Account</div>
          <Link href="/profile" className="sidebar-link">
            <span className="sidebar-link-icon">👤</span><span>Profile</span>
          </Link>
          <Link href="/settings" className="sidebar-link">
            <span className="sidebar-link-icon">⚙️</span><span>Settings</span>
          </Link>
          <form action={logout} className="sidebar-logout">
            <button type="submit" className="sidebar-link" style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-error)' }}>
              <span className="sidebar-link-icon">🚪</span><span>Logout</span>
            </button>
          </form>
        </nav>
      </aside>

      {/* Main */}
      <main className="main-content">
        <div className="container container-full">
          {/* Page Header */}
          <div className="page-header">
            <div>
              <h1 className="page-title">
                Welcome back, {profile?.full_name?.split(' ')[0] || 'Traveller'} 👋
              </h1>
              <p className="page-subtitle">{profile?.college}</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {notifCount > 0 && (
                <div className="badge badge-primary">{notifCount} new</div>
              )}
              <div className="avatar avatar-md" style={{ background: '#DBEAFE', color: '#2563EB' }}>
                {profile?.full_name?.[0] || 'U'}
              </div>
            </div>
          </div>

          {/* Trust Score Banner */}
          <div className="card mb-6" style={{ background: `linear-gradient(135deg, ${levelColors[trustLevel]}22, ${levelColors[trustLevel]}11)`, border: `1px solid ${levelColors[trustLevel]}44` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ fontSize: '40px' }}>
                {trustLevel === 'Bronze' ? '🥉' : trustLevel === 'Silver' ? '🥈' : trustLevel === 'Gold' ? '🥇' : '🏆'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: '18px', color: levelColors[trustLevel] }}>{trustLevel}</div>
                <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '8px' }}>Trust Score: {trustScore} pts</div>
                <div style={{ height: '6px', background: '#e5e7eb', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${Math.min(trustScore, 100)}%`, background: levelColors[trustLevel], borderRadius: '4px', transition: 'width 1s ease' }} />
                </div>
              </div>
              {!profile?.is_verified && (
                <Link href="/profile" className="btn btn-sm btn-outline">Get Verified +20pts</Link>
              )}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="stats-grid mb-6">
            <div className="stat-card">
              <div className="stat-card-icon" style={{ background: '#DBEAFE' }}>✈️</div>
              <div>
                <div className="stat-card-value">{trips?.length || 0}</div>
                <div className="stat-card-label">My Trips</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-card-icon" style={{ background: '#CCFBF1' }}>🤝</div>
              <div>
                <div className="stat-card-value">{pendingRequests?.length || 0}</div>
                <div className="stat-card-label">Pending Requests</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-card-icon" style={{ background: '#FEF9C3' }}>⭐</div>
              <div>
                <div className="stat-card-value">{trustScore}</div>
                <div className="stat-card-label">Trust Points</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-card-icon" style={{ background: '#FEE2E2' }}>🔔</div>
              <div>
                <div className="stat-card-value">{notifCount || 0}</div>
                <div className="stat-card-label">Notifications</div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-2 mb-6">
            <Link href="/trips?action=create" className="btn btn-primary" style={{ justifyContent: 'center', padding: '16px' }}>
              ✈️ Create a Trip
            </Link>
            <Link href="/discover" className="btn btn-outline" style={{ justifyContent: 'center', padding: '16px' }}>
              🔍 Find Travel Partners
            </Link>
          </div>

          {/* Recent Trips */}
          {trips && trips.length > 0 && (
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 600 }}>My Recent Trips</h2>
                <Link href="/trips" className="text-link" style={{ fontSize: '14px' }}>View all →</Link>
              </div>
              <div className="flex-col gap-3">
                {trips.map(trip => (
                  <Link key={trip.id} href={`/trips/${trip.id}`} className="trip-list-item">
                    <div>
                      <div style={{ fontWeight: 600 }}>{trip.destination}</div>
                      <div style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
                        {trip.start_date} → {trip.end_date} · ₹{trip.budget?.toLocaleString()}
                      </div>
                    </div>
                    <span className={`badge badge-${trip.status === 'open' ? 'success' : 'neutral'}`}>{trip.status}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
