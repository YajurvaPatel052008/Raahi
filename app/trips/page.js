import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createTrip, deleteTrip } from '@/actions/trips'

export const metadata = { title: 'My Trips — Raahi' }

export default async function TripsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch user's hosted trips
  const { data: myTrips } = await supabase
    .from('trips')
    .select('*, trip_members(count)')
    .eq('host_id', user.id)
    .order('created_at', { ascending: false })

  // Fetch trips user has joined
  const { data: joinedTrips } = await supabase
    .from('trip_members')
    .select('*, trip:trips(*, profiles!host_id(full_name))')
    .eq('user_id', user.id)
    .neq('trips.host_id', user.id)
    .eq('status', 'approved')

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <Link href="/dashboard" className="sidebar-brand">RAAHI <span className="brand-dot" /></Link>
        </div>
        <nav className="sidebar-nav">
          <Link href="/dashboard" className="sidebar-link">📊 Dashboard</Link>
          <Link href="/discover" className="sidebar-link">🔍 Discover</Link>
          <Link href="/matches" className="sidebar-link">🤝 Matches</Link>
          <div className="sidebar-section-title">My Travel</div>
          <Link href="/trips" className="sidebar-link active">✈️ My Trips</Link>
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
              <h1 className="page-title">My Trips</h1>
              <p className="page-subtitle">Manage the trips you host and trips you've joined.</p>
            </div>
            <Link href="/trips/create" className="btn btn-primary">+ Create Trip</Link>
          </div>

          {/* Hosted Trips */}
          <div className="mb-8">
            <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Trips I Host ({myTrips?.length || 0})</h2>
            {myTrips && myTrips.length > 0 ? (
              <div className="grid grid-3">
                {myTrips.map(trip => (
                  <div key={trip.id} className="card trip-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <span className={`badge badge-${trip.status === 'open' ? 'success' : 'neutral'}`}>{trip.status}</span>
                      <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>{trip.travel_type}</span>
                    </div>
                    <h3 style={{ fontWeight: 700, fontSize: '18px', marginBottom: '4px' }}>{trip.destination}</h3>
                    <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '16px' }}>
                      {trip.start_date} — {trip.end_date}
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '16px' }}>
                      <span>₹{trip.budget?.toLocaleString()}</span>
                      <span>{trip.trip_members?.[0]?.count || 0}/{trip.max_members} members</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <Link href={`/trips/${trip.id}`} className="btn btn-outline btn-sm" style={{ flex: 1 }}>View</Link>
                      <form action={async () => { 'use server'; await deleteTrip(trip.id) }}>
                        <button type="submit" className="btn btn-sm" style={{ background: '#FEE2E2', color: '#ef4444' }}>Delete</button>
                      </form>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="card" style={{ textAlign: 'center', padding: '48px', color: 'var(--color-text-muted)' }}>
                <div style={{ fontSize: '40px', marginBottom: '12px' }}>✈️</div>
                <p>You haven&apos;t created any trips yet.</p>
                <Link href="/trips/create" className="btn btn-primary" style={{ marginTop: '16px' }}>Create your first trip</Link>
              </div>
            )}
          </div>

          {/* Joined Trips */}
          {joinedTrips && joinedTrips.length > 0 && (
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Trips I&apos;ve Joined ({joinedTrips.length})</h2>
              <div className="grid grid-3">
                {joinedTrips.map(({ trip }) => trip && (
                  <Link key={trip.id} href={`/trips/${trip.id}`} className="card trip-card" style={{ textDecoration: 'none' }}>
                    <h3 style={{ fontWeight: 700, fontSize: '18px', marginBottom: '4px' }}>{trip.destination}</h3>
                    <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
                      Hosted by {trip.profiles?.full_name}
                    </p>
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
