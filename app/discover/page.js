import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export const metadata = { title: 'Discover Trips — Raahi' }

export default async function DiscoverPage({ searchParams }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const params = await searchParams
  const search = params?.q || ''
  const travelType = params?.type || ''
  const budgetMax = params?.budget || ''

  // Build query
  let query = supabase
    .from('trips')
    .select('*, host:profiles!host_id(id, full_name, avatar_url, college, trust_level)')
    .eq('status', 'open')
    .neq('host_id', user.id)
    .order('created_at', { ascending: false })

  if (search) {
    query = query.ilike('destination', `%${search}%`)
  }
  if (travelType) {
    query = query.eq('travel_type', travelType)
  }
  if (budgetMax) {
    query = query.lte('budget', parseInt(budgetMax))
  }

  const { data: trips } = await query

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <Link href="/dashboard" className="sidebar-brand">RAAHI <span className="brand-dot" /></Link>
        </div>
        <nav className="sidebar-nav">
          <Link href="/dashboard" className="sidebar-link">📊 Dashboard</Link>
          <Link href="/discover" className="sidebar-link active">🔍 Discover</Link>
          <Link href="/matches" className="sidebar-link">🤝 Matches</Link>
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
              <h1 className="page-title">Discover Trips</h1>
              <p className="page-subtitle">Find your next adventure and travel partners.</p>
            </div>
          </div>

          {/* Search & Filters */}
          <form method="GET" className="card mb-6">
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
              <div className="input-group" style={{ flex: 2, minWidth: '200px', margin: 0 }}>
                <label className="input-label">Search Destination</label>
                <input name="q" type="text" className="input" placeholder="Goa, Manali, Jaipur..." defaultValue={search} />
              </div>
              <div className="input-group" style={{ flex: 1, minWidth: '150px', margin: 0 }}>
                <label className="input-label">Travel Type</label>
                <select name="type" className="input" defaultValue={travelType}>
                  <option value="">All Types</option>
                  <option value="Adventure">Adventure</option>
                  <option value="Relaxation">Relaxation</option>
                  <option value="Cultural">Cultural</option>
                  <option value="Road Trip">Road Trip</option>
                  <option value="Beach">Beach</option>
                  <option value="Hill Station">Hill Station</option>
                </select>
              </div>
              <div className="input-group" style={{ flex: 1, minWidth: '120px', margin: 0 }}>
                <label className="input-label">Max Budget (₹)</label>
                <input name="budget" type="number" className="input" placeholder="10000" defaultValue={budgetMax} />
              </div>
              <button type="submit" className="btn btn-primary" style={{ height: '44px' }}>🔍 Search</button>
            </div>
          </form>

          <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '16px' }}>
            Showing {trips?.length || 0} open trips
          </p>

          {/* Results Grid */}
          {trips && trips.length > 0 ? (
            <div className="grid grid-3">
              {trips.map(trip => (
                <div key={trip.id} className="card trip-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span className="badge badge-success">{trip.travel_type}</span>
                    <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>₹{trip.budget?.toLocaleString()}</span>
                  </div>
                  <h3 style={{ fontWeight: 700, fontSize: '18px', marginBottom: '4px' }}>{trip.destination}</h3>
                  <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '12px' }}>
                    {trip.start_date} → {trip.end_date}
                  </p>
                  {trip.description && (
                    <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '16px', lineHeight: '1.5' }}>
                      {trip.description.substring(0, 120)}{trip.description.length > 120 ? '...' : ''}
                    </p>
                  )}
                  {/* Host Info */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingTop: '12px', borderTop: '1px solid var(--color-border-light)' }}>
                    <div className="avatar avatar-sm" style={{ background: '#DBEAFE', color: '#2563EB' }}>
                      {trip.host?.full_name?.[0] || '?'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 500, fontSize: '14px' }}>{trip.host?.full_name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{trip.host?.college}</div>
                    </div>
                    <span className="badge badge-neutral" style={{ fontSize: '11px' }}>{trip.host?.trust_level}</span>
                  </div>
                  <Link href={`/trips/${trip.id}`} className="btn btn-outline w-full" style={{ marginTop: '16px' }}>
                    View Trip →
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: '64px', color: 'var(--color-text-muted)' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🗺️</div>
              <h3 style={{ fontWeight: 600, marginBottom: '8px' }}>No trips found</h3>
              <p>Try adjusting your filters or be the first to create a trip!</p>
              <Link href="/trips/create" className="btn btn-primary" style={{ marginTop: '16px' }}>Create a Trip</Link>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
