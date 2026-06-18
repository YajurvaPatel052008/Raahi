/* ============================================
   RAAHI — Dashboard Logic (Supabase Connected)
   ============================================ */

document.addEventListener('DOMContentLoaded', async () => {
  setupSidebar();

  // Auth guard
  const user = await window.raahi.requireAuth();
  if (!user) return;

  // Load data in parallel
  await Promise.all([
    loadProfile(user),
    loadMyTrips(user.id),
    loadStats(user.id)
  ]);
});

async function loadProfile(user) {
  const { data: profile } = await window.raahi.getProfile(user.id);
  if (!profile) return;

  // Update user name
  const nameEl = document.getElementById('userName') || document.querySelector('.user-name');
  if (nameEl) nameEl.textContent = profile.full_name || user.email;

  const firstNameEl = document.querySelector('.welcome-name');
  if (firstNameEl) firstNameEl.textContent = profile.full_name?.split(' ')[0] || 'Traveller';

  // Update avatar initials
  const avatarEl = document.querySelector('.user-avatar, .avatar');
  if (avatarEl) {
    if (profile.avatar_url) {
      avatarEl.innerHTML = `<img src="${profile.avatar_url}" alt="avatar" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">`;
    } else {
      avatarEl.textContent = profile.full_name?.[0]?.toUpperCase() || 'U';
    }
  }

  // Update trust score & level
  const trustScoreEl = document.getElementById('trustScore');
  const trustLevelEl = document.getElementById('trustLevel');
  const trustBarEl = document.getElementById('trustBar');

  if (trustScoreEl) trustScoreEl.textContent = profile.trust_score || 0;
  if (trustLevelEl) trustLevelEl.textContent = profile.trust_level || 'Bronze';
  if (trustBarEl) trustBarEl.style.width = `${Math.min(profile.trust_score || 0, 100)}%`;

  // College info
  const collegeEl = document.querySelector('.user-college');
  if (collegeEl) collegeEl.textContent = profile.college;
}

async function loadMyTrips(userId) {
  const { data: trips } = await window.raahi.getMyTrips(userId);
  const grid = document.getElementById('myTripsGrid') || document.getElementById('tripsGrid');

  if (!grid || !trips) return;

  if (trips.length === 0) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column:1/-1;text-align:center;padding:48px;">
        <div style="font-size:40px;margin-bottom:12px;">✈️</div>
        <h3>No trips yet</h3>
        <p style="color:var(--color-text-muted);margin-bottom:16px;">Create your first trip and find travel partners!</p>
        <a href="trips.html" class="btn btn-primary">Create a Trip</a>
      </div>`;
    return;
  }

  grid.innerHTML = trips.slice(0, 3).map(trip => `
    <div class="trip-card card" style="cursor:pointer;" onclick="window.location='trip-detail.html?id=${trip.id}'">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
        <span class="badge badge-${trip.status === 'open' ? 'success' : 'neutral'}">${trip.status}</span>
        <span style="font-size:13px;color:var(--color-text-muted);">${trip.travel_type}</span>
      </div>
      <h3 style="font-weight:700;font-size:18px;margin-bottom:4px;">${trip.destination}</h3>
      <p style="font-size:13px;color:var(--color-text-muted);margin-bottom:16px;">${trip.start_date} — ${trip.end_date} · ₹${Number(trip.budget).toLocaleString('en-IN')}</p>
      <div style="display:flex;justify-content:space-between;font-size:13px;">
        <span>👥 ${trip.current_members}/${trip.max_members} members</span>
        <a href="trip-detail.html?id=${trip.id}" class="text-link" style="font-size:13px;">View →</a>
      </div>
    </div>`).join('');
}

async function loadStats(userId) {
  const supabase = window.raahi.supabase;

  const [tripsRes, notifRes] = await Promise.all([
    supabase.from('trips').select('id', { count: 'exact', head: true }).eq('creator_id', userId),
    supabase.from('notifications').select('id', { count: 'exact', head: true }).eq('user_id', userId).eq('is_read', false)
  ]);

  const tripCountEl = document.getElementById('tripCount');
  const notifCountEl = document.getElementById('notifCount');

  if (tripCountEl) tripCountEl.textContent = tripsRes.count || 0;
  if (notifCountEl) notifCountEl.textContent = notifRes.count || 0;
}

// Logout handler
window.handleLogout = async function() {
  await window.raahi.signOut();
};

function setupSidebar() {
  const sidebar = document.querySelector('.sidebar');
  const overlay = document.querySelector('.sidebar-overlay');
  const toggleBtn = document.querySelector('.sidebar-toggle-btn');
  const closeBtn = document.querySelector('.sidebar-close');
  if (!sidebar) return;
  const open = () => { sidebar.classList.add('active'); if (overlay) overlay.classList.add('active'); document.body.style.overflow = 'hidden'; };
  const close = () => { sidebar.classList.remove('active'); if (overlay) overlay.classList.remove('active'); document.body.style.overflow = ''; };
  if (toggleBtn) toggleBtn.addEventListener('click', open);
  if (closeBtn) closeBtn.addEventListener('click', close);
  if (overlay) overlay.addEventListener('click', close);
}
