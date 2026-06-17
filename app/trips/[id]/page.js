import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { joinTrip, updateMemberStatus } from '@/actions/trips'

export async function generateMetadata({ params }) {
  return { title: 'Trip Details — Raahi' }
}

export default async function TripDetailsPage({ params }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch trip
  const { data: trip } = await supabase
    .from('trips')
    .select('*, host:profiles!host_id(*), members:trip_members(*, user:profiles!user_id(*))')
    .eq('id', id)
    .single()

  if (!trip) redirect('/trips')

  const isHost = trip.host_id === user.id
  const myMembership = trip.members?.find(m => m.user_id === user.id)
  const approvedMembers = trip.members?.filter(m => m.status === 'approved') || []
  const pendingMembers = trip.members?.filter(m => m.status === 'pending') || []

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
          <Link href="/trips" className="sidebar-link">✈️ My Trips</Link>
          <Link href="/chat" className="sidebar-link">💬 Messages</Link>
          <Link href="/reviews" className="sidebar-link">⭐ Reviews</Link>
          <div className="sidebar-section-title">Account</div>
          <Link href="/profile" className="sidebar-link">👤 Profile</Link>
          <Link href="/settings" className="sidebar-link">⚙️ Settings</Link>
        </nav>
      </aside>

      <main className="main-content">
        <div className="container container-md">
          <div className="mb-6">
            <Link href="/trips" className="text-link">← Back to Trips</Link>
          </div>

          <div className="card mb-6">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '8px' }}>{trip.destination}</h1>
                <div style={{ display: 'flex', gap: '12px', fontSize: '14px', color: 'var(--color-text-muted)' }}>
                  <span>📅 {trip.start_date} — {trip.end_date}</span>
                  <span>💰 ₹{trip.budget?.toLocaleString()}</span>
                  <span>👥 {approvedMembers.length}/{trip.max_members}</span>
                </div>
              </div>
              <span className={`badge badge-${trip.status === 'open' ? 'success' : 'neutral'}`}>{trip.status}</span>
            </div>

            <p style={{ fontSize: '15px', lineHeight: '1.6', marginBottom: '24px' }}>
              {trip.description || 'No description provided.'}
            </p>

            <div style={{ display: 'flex', gap: '16px', borderTop: '1px solid var(--color-border-light)', paddingTop: '20px' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '8px' }}>HOSTED BY</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div className="avatar avatar-sm" style={{ background: '#DBEAFE', color: '#2563EB' }}>
                    {trip.host?.full_name?.[0] || '?'}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '14px' }}>{trip.host?.full_name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{trip.host?.college} · {trip.host?.trust_level}</div>
                  </div>
                </div>
              </div>

              {!isHost && !myMembership && trip.status === 'open' && (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <form action={async () => { 'use server'; await joinTrip(trip.id) }}>
                    <button type="submit" className="btn btn-primary">Request to Join</button>
                  </form>
                </div>
              )}
              {!isHost && myMembership && (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span className={`badge badge-${myMembership.status === 'approved' ? 'success' : 'neutral'}`}>
                    Status: {myMembership.status.charAt(0).toUpperCase() + myMembership.status.slice(1)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Members Section */}
          <div className="card">
            <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '20px' }}>Approved Members ({approvedMembers.length})</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
              {approvedMembers.map(m => (
                <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'var(--color-bg-secondary)', borderRadius: '12px' }}>
                  <div className="avatar avatar-sm" style={{ background: '#DBEAFE', color: '#2563EB' }}>{m.user?.full_name?.[0]}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500 }}>{m.user?.full_name} {m.user_id === trip.host_id ? '(Host)' : ''}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pending Requests (Host Only) */}
            {isHost && pendingMembers.length > 0 && (
              <>
                <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '20px', borderTop: '1px solid var(--color-border-light)', paddingTop: '20px' }}>
                  Pending Requests ({pendingMembers.length})
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {pendingMembers.map(m => (
                    <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'var(--color-bg-secondary)', borderRadius: '12px' }}>
                      <div className="avatar avatar-sm" style={{ background: '#DBEAFE', color: '#2563EB' }}>{m.user?.full_name?.[0]}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 500 }}>{m.user?.full_name}</div>
                        <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Trust Level: {m.user?.trust_level}</div>
                      </div>
                      <form action={async () => { 'use server'; await updateMemberStatus(trip.id, m.user_id, 'approved') }}>
                        <button type="submit" className="btn btn-sm btn-primary">Approve</button>
                      </form>
                      <form action={async () => { 'use server'; await updateMemberStatus(trip.id, m.user_id, 'rejected') }}>
                        <button type="submit" className="btn btn-sm btn-outline">Reject</button>
                      </form>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
