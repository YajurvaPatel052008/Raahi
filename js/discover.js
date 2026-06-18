/* ============================================
   RAAHI — Discover Logic (Supabase Connected)
   ============================================ */

let currentUser = null;
let allTrips = [];

document.addEventListener('DOMContentLoaded', async () => {
  currentUser = await window.raahi.requireAuth();
  if (!currentUser) return;

  const { data: profile } = await window.raahi.getProfile(currentUser.id);
  if (profile) {
    const firstName = profile.full_name?.split(' ')[0] || 'there';
    document.getElementById('userGreeting').textContent = firstName;
  }

  await loadAllTrips();
  initSearchAndFilters();
});

async function loadAllTrips(filters = {}) {
  const grid = document.getElementById('searchResultsGrid');
  const countEl = document.getElementById('resultsCount');
  if (!grid) return;

  grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:48px;color:var(--color-text-muted);">
    <div class="spinner"></div><p style="margin-top:16px;">Finding trips...</p>
  </div>`;

  const { data, error } = await window.raahi.getOpenTrips(filters);

  if (error) {
    grid.innerHTML = `<p style="color:var(--color-error);grid-column:1/-1;text-align:center;">Error loading trips: ${error.message}</p>`;
    return;
  }

  // Filter out current user's own trips
  allTrips = (data || []).filter(t => t.creator_id !== currentUser.id);

  if (countEl) countEl.textContent = `Showing ${allTrips.length} trip${allTrips.length !== 1 ? 's' : ''}`;

  if (allTrips.length === 0) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column:1/-1;text-align:center;padding:64px;">
        <div style="font-size:48px;margin-bottom:16px;">🗺️</div>
        <h3>No trips found</h3>
        <p style="color:var(--color-text-muted);">Try adjusting your filters or create a trip yourself!</p>
        <a href="trips.html" class="btn btn-primary" style="margin-top:16px;">Create a Trip</a>
      </div>`;
    return;
  }

  grid.innerHTML = allTrips.map(trip => `
    <div class="trip-card card">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
        <span class="badge badge-success">${trip.travel_type}</span>
        <span style="font-size:13px;color:var(--color-text-muted);">₹${Number(trip.budget).toLocaleString('en-IN')}</span>
      </div>
      <h3 style="font-weight:700;font-size:18px;margin-bottom:4px;">${trip.destination}</h3>
      <p style="font-size:13px;color:var(--color-text-muted);margin-bottom:12px;">📅 ${trip.start_date} → ${trip.end_date}</p>
      ${trip.description ? `<p style="font-size:14px;color:var(--color-text-secondary);margin-bottom:16px;line-height:1.5;">${trip.description.substring(0, 100)}${trip.description.length > 100 ? '…' : ''}</p>` : ''}
      <div style="display:flex;align-items:center;gap:10px;padding-top:12px;border-top:1px solid var(--color-border-light);margin-bottom:16px;">
        <div style="width:32px;height:32px;border-radius:50%;background:#DBEAFE;color:#2563EB;display:flex;align-items:center;justify-content:center;font-weight:700;">
          ${trip.profiles?.full_name?.[0] || '?'}
        </div>
        <div style="flex:1;">
          <div style="font-weight:500;font-size:14px;">${trip.profiles?.full_name || 'Unknown'}</div>
          <div style="font-size:12px;color:var(--color-text-muted);">${trip.profiles?.college || ''} · ${trip.profiles?.trust_level || 'Bronze'}</div>
        </div>
      </div>
      <div style="display:flex;gap:8px;">
        <a href="trip-detail.html?id=${trip.id}" class="btn btn-outline btn-sm" style="flex:1;text-align:center;">View Details</a>
        <button class="btn btn-primary btn-sm" onclick="handleJoinTrip('${trip.id}', this)">Request to Join</button>
      </div>
    </div>`).join('');
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

function initSearchAndFilters() {
  const searchInput = document.getElementById('searchInput');
  const typeFilter = document.getElementById('travelTypeFilter') || document.querySelector('.filter-select');
  const resetBtn = document.getElementById('resetFilters');

  const doSearch = () => {
    const filters = {};
    if (searchInput?.value) filters.destination = searchInput.value;
    if (typeFilter?.value) filters.travel_type = typeFilter.value;
    loadAllTrips(filters);
  };

  window.simulateSearch = doSearch;

  if (searchInput) {
    searchInput.addEventListener('keydown', e => { if (e.key === 'Enter') doSearch(); });
  }
  const searchBtn = document.getElementById('searchBtn');
  if (searchBtn) searchBtn.addEventListener('click', doSearch);

  document.querySelectorAll('.filter-select').forEach(s => s.addEventListener('change', doSearch));

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      document.querySelectorAll('.filter-select').forEach(s => s.value = '');
      loadAllTrips();
    });
  }
}
