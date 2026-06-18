import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { updateProfile } from '@/actions/profile'

export const metadata = { title: 'Profile — Raahi' }

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

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
          <Link href="/profile" className="sidebar-link active">👤 Profile</Link>
          <Link href="/settings" className="sidebar-link">⚙️ Settings</Link>
        </nav>
      </aside>

      <main className="main-content">
        <div className="container container-md">
          <div className="page-header">
            <div>
              <h1 className="page-title">My Profile</h1>
              <p className="page-subtitle">Update your personal details and travel preferences.</p>
            </div>
            {!profile?.is_verified && (
              <span className="badge" style={{ background: '#FEF9C3', color: '#854D0E', padding: '8px 12px' }}>
                ⚠️ Pending Verification
              </span>
            )}
          </div>

          <div className="card">
            <form action={updateProfile} className="auth-form">
              <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '24px', borderBottom: '1px solid var(--color-border-light)', paddingBottom: '12px' }}>
                Basic Information
              </h2>

              <div className="input-group">
                <label className="input-label">Full Name</label>
                <input name="fullName" type="text" className="input" defaultValue={profile?.full_name} required />
              </div>

              <div className="input-group">
                <label className="input-label">Bio</label>
                <textarea name="bio" className="input" rows={3} defaultValue={profile?.bio} placeholder="Tell others a bit about yourself..." />
              </div>

              <div className="form-grid form-grid-2">
                <div className="input-group">
                  <label className="input-label">Department/Course</label>
                  <input name="department" type="text" className="input" defaultValue={profile?.department} placeholder="e.g. B.Tech CSE" />
                </div>
                <div className="input-group">
                  <label className="input-label">Year of Study</label>
                  <select name="year" className="input" defaultValue={profile?.year}>
                    <option value="">Select year...</option>
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                    <option value="Alumni">Alumni</option>
                  </select>
                </div>
              </div>

              <div className="form-grid form-grid-2">
                <div className="input-group">
                  <label className="input-label">City</label>
                  <input name="city" type="text" className="input" defaultValue={profile?.city} placeholder="e.g. Indore" />
                </div>
                <div className="input-group">
                  <label className="input-label">Gender</label>
                  <select name="gender" className="input" defaultValue={profile?.gender}>
                    <option value="">Select...</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '24px', marginTop: '32px', borderBottom: '1px solid var(--color-border-light)', paddingBottom: '12px' }}>
                Travel Preferences
              </h2>

              <div className="input-group">
                <label className="input-label">Primary Travel Style</label>
                <select name="travelStyle" className="input" defaultValue={profile?.travel_style}>
                  <option value="">Select style...</option>
                  <option value="Adventure">Adventure & Exploring</option>
                  <option value="Relaxation">Relaxation & Luxury</option>
                  <option value="Cultural">Cultural & Historical</option>
                  <option value="Budget">Budget Backpacking</option>
                </select>
              </div>

              <div className="input-group">
                <label className="input-label">Interests (comma separated)</label>
                <input name="interests" type="text" className="input" defaultValue={profile?.interests?.join(', ')} placeholder="Photography, Trekking, Food, Museums..." />
              </div>

              <button type="submit" className="btn btn-primary" style={{ marginTop: '16px' }}>Save Profile</button>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}
