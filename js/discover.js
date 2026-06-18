/* ============================================
   RAAHI — Discover Logic (Supabase Connected)
   ============================================ */

let currentUser = null;
let allTrips = [];

document.addEventListener('DOMContentLoaded', async () => {
  setupSidebar();
  setupHeaderDropdowns();

  currentUser = await window.raahi.requireAuth();
  if (!currentUser) return;

  const { data: profile } = await window.raahi.getProfile(currentUser.id);
  if (profile) {
    const firstName = profile.full_name?.split(' ')[0] || 'Traveller';
    document.getElementById('userGreeting').textContent = firstName;

    const sidebarUserName = document.getElementById('sidebarUserName');
    const sidebarUserEmail = document.getElementById('sidebarUserEmail');
    const sidebarAvatar = document.getElementById('sidebarAvatar');

    if (sidebarUserName) sidebarUserName.textContent = profile.full_name || currentUser.email;
    if (sidebarUserEmail) sidebarUserEmail.textContent = currentUser.email;
    if (sidebarAvatar) {
      if (profile.avatar_url) {
        sidebarAvatar.innerHTML = `<img src="${profile.avatar_url}" alt="avatar" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">`;
      } else {
        const initials = profile.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
        sidebarAvatar.textContent = initials;
      }
    }
  }

  await loadAllTrips();
  initSearchAndFilters();
});

function setupSidebar() {
  const sidebar = document.querySelector('.sidebar');
  const overlay = document.querySelector('.sidebar-overlay');
  const toggleBtn = document.querySelector('.sidebar-toggle-btn');
  const closeBtn = document.querySelector('.sidebar-close');

  if (!sidebar) return;

  const openSidebar = () => {
    sidebar.classList.add('active');
    if (overlay) overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  const closeSidebar = () => {
    sidebar.classList.remove('active');
    if (overlay) overlay.classList.remove('active');
    document.body.style.overflow = '';
  };

  if (toggleBtn) toggleBtn.addEventListener('click', openSidebar);
  if (closeBtn) closeBtn.addEventListener('click', closeSidebar);
  if (overlay) overlay.addEventListener('click', closeSidebar);

  document.querySelectorAll('.sidebar-link').forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth < 1024) closeSidebar();
    });
  });
}

function setupHeaderDropdowns() {
  const notificationBtn = document.querySelector('.notification-btn');
  const notificationDropdown = document.querySelector('.notification-dropdown');

  if (notificationBtn && notificationDropdown) {
    notificationBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      notificationDropdown.classList.toggle('active');
    });
  }

  document.addEventListener('click', () => {
    document.querySelectorAll('.notification-dropdown').forEach(d => d.classList.remove('active'));
  });
}

async function loadAllTrips(filters = {}) {
  const grid = document.getElementById('searchResultsGrid');
  const emptyState = document.getElementById('emptyState');
  const countEl = document.getElementById('resultsCount');

  if (!grid) return;

  grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:48px;color:var(--color-text-muted);">
    <div style="font-size:24px;margin-bottom:16px;">⏳</div><p>Finding amazing trips...</p>
  </div>`;

  const { data, error } = await window.raahi.getOpenTrips(filters);

  if (error) {
    grid.innerHTML = `<p style="color:var(--color-error);grid-column:1/-1;text-align:center;">Error loading trips</p>`;
    if (emptyState) emptyState.style.display = 'flex';
    return;
  }

  allTrips = (data || []).filter(t => t.creator_id !== currentUser.id);

  if (countEl) countEl.textContent = `Showing ${allTrips.length} trip${allTrips.length !== 1 ? 's' : ''}`;

  if (allTrips.length === 0) {
    grid.innerHTML = '';
    if (emptyState) emptyState.style.display = 'flex';
    return;
  }

  if (emptyState) emptyState.style.display = 'none';

  const destinationImages = {
    'Goa': 'https://images.unsplash.com/photo-1512453395892-4729f35ae76d?w=400&h=300&fit=crop',
    'Manali': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
    'Kasol': 'https://images.unsplash.com/photo-1533350335684-a048cffe9e98?w=400&h=300&fit=crop',
    'Jaipur': 'https://images.unsplash.com/photo-1487546511543-c1ee14ce1f44?w=400&h=300&fit=crop',
    'Udaipur': 'https://images.unsplash.com/photo-1548013146-72f7ee2dfa40?w=400&h=300&fit=crop',
    'Rishikesh': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop'
  };

  grid.innerHTML = allTrips.map(trip => {
    const destImage = destinationImages[trip.destination] || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400&h=300&fit=crop';
    const isFeatures = Math.random() > 0.7;
    const isFastFilling = trip.current_members > (trip.max_members || 5) * 0.7;

    return `
      <a href="trip-detail.html?id=${trip.id}" class="trip-card-modern">
        <div class="trip-card-image-container">
          <img src="${destImage}" alt="${trip.destination}" loading="lazy" class="trip-card-image">
          ${isFeatures ? '<span class="trip-card-badge">Featured</span>' : ''}
          ${isFastFilling ? '<span class="trip-card-badge badge-warning">Fast Filling</span>' : ''}
        </div>
        <div class="trip-card-modern-content">
          <div class="trip-card-header-row">
            <h3 class="trip-card-title">${trip.destination} ${trip.travel_type ? '- ' + trip.travel_type : ''}</h3>
            <span class="trip-card-price">₹${Number(trip.budget).toLocaleString('en-IN')}</span>
          </div>
          <p class="trip-card-subtitle">${trip.travel_type || 'Travel'} • ${trip.start_date && trip.end_date ? 'Flexible' : 'Soon'}</p>
          <p class="trip-card-description">${trip.description ? trip.description.substring(0, 100) + (trip.description.length > 100 ? '...' : '') : 'Amazing adventure awaits!'}</p>
          <div class="trip-card-footer">
            <div class="trip-card-dates">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M3 10h18"/>
              </svg>
              ${trip.start_date || 'TBD'}
            </div>
            <div class="trip-card-spots">${Math.max(0, (trip.max_members || 5) - (trip.current_members || 1))} spots left</div>
          </div>
        </div>
      </a>`;
  }).join('');
}

async function handleJoinTrip(tripId, btn) {
  btn.disabled = true;
  btn.textContent = '...';
  const { error } = await window.raahi.joinTrip(tripId, currentUser.id);
  if (error) {
    btn.disabled = false;
    btn.textContent = 'Request to Join';
    if (window.showToast) window.showToast('Error', error.message.includes('duplicate') ? 'You already requested to join this trip.' : error.message, 'error');
  } else {
    btn.textContent = '✓ Requested';
    btn.style.background = 'var(--color-success)';
    if (window.showToast) window.showToast('Request Sent!', 'The trip host will review your request.');
  }
}


window.toggleUserMenu = function(e) {
  e.stopPropagation();
  const dropdown = e.target.closest('.sidebar-user').querySelector('.sidebar-user-dropdown');
  dropdown.classList.toggle('active');
};
