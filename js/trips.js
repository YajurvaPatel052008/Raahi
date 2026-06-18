/* ============================================
   RAAHI — Trips Logic (Supabase Connected)
   ============================================ */

let currentUser = null;

document.addEventListener('DOMContentLoaded', async () => {
  currentUser = await window.raahi.requireAuth();
  if (!currentUser) return;

  await loadTrips('my');
  initTripTabs();
  initCreateTripModal();
});

/* ── Load Trips ── */
async function loadTrips(type = 'my') {
  const grid = document.getElementById('tripsGrid');
  if (!grid) return;

  grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:48px;color:var(--color-text-muted);">
    <div class="spinner"></div><p style="margin-top:16px;">Loading trips...</p>
  </div>`;

  let trips = [];

  if (type === 'my') {
    const { data } = await window.raahi.getMyTrips(currentUser.id);
    trips = data || [];
  } else if (type === 'joined') {
    const { data } = await window.raahi.supabase
      .from('trip_members')
      .select('*, trip:trips(*)')
      .eq('user_id', currentUser.id)
      .eq('join_status', 'approved')
      .neq('trips.creator_id', currentUser.id);
    trips = (data || []).map(m => m.trip).filter(Boolean);
  } else if (type === 'past') {
    const { data } = await window.raahi.supabase
      .from('trips')
      .select('*')
      .eq('creator_id', currentUser.id)
      .eq('status', 'completed');
    trips = data || [];
  }

  renderTripsGrid(grid, trips);
}

function renderTripsGrid(grid, trips) {
  if (!trips || trips.length === 0) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column:1/-1;text-align:center;padding:64px;">
        <div style="font-size:48px;margin-bottom:16px;">✈️</div>
        <h3>No trips here yet</h3>
        <p style="color:var(--color-text-muted);margin-bottom:20px;">Create your first trip and start finding travel buddies!</p>
        <button class="btn btn-primary" onclick="openCreateTripModal()">+ Create a Trip</button>
      </div>`;
    return;
  }

  grid.innerHTML = trips.map(trip => `
    <div class="trip-card card" onclick="window.location='trip-detail.html?id=${trip.id}'">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
        <span class="badge badge-${trip.status === 'open' ? 'success' : 'neutral'}">${trip.status}</span>
        <span style="font-size:12px;color:var(--color-text-muted);">${trip.travel_type}</span>
      </div>
      <h3 style="font-weight:700;font-size:18px;margin-bottom:6px;">${trip.destination}</h3>
      <p style="font-size:13px;color:var(--color-text-muted);margin-bottom:16px;">
        📅 ${trip.start_date} → ${trip.end_date}<br>
        💰 ₹${Number(trip.budget).toLocaleString('en-IN')} per person
      </p>
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <span style="font-size:13px;">👥 ${trip.current_members}/${trip.max_members}</span>
        <a href="trip-detail.html?id=${trip.id}" class="btn btn-outline btn-sm">View Details</a>
      </div>
    </div>`).join('');
}

/* ── Tab Switching ── */
function initTripTabs() {
  const tabs = document.querySelectorAll('#tripTabs .tab');
  if (!tabs.length) return;

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const target = tab.getAttribute('data-target') || 'my';
      loadTrips(target);
    });
  });
}

/* ── Create Trip Modal ── */
function initCreateTripModal() {
  const form = document.getElementById('createTripForm');
  if (!form) {
    console.error('Form not found');
    return;
  }
  form.addEventListener('submit', handleCreateTrip);
}

window.openCreateTripModal = function() {
  const modal = document.getElementById('createTripModal');
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
};

window.closeCreateTripModal = function() {
  const modal = document.getElementById('createTripModal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
};

async function handleCreateTrip(e) {
  e.preventDefault();

  const form = e.target;
  const formData = new FormData(form);

  const tripTitle = formData.get('tripTitle') || document.getElementById('tripTitle')?.value?.trim();
  const destination = formData.get('destination') || document.getElementById('destination')?.value?.trim();
  const startDate = formData.get('startDate') || document.getElementById('startDate')?.value;
  const endDate = formData.get('endDate') || document.getElementById('endDate')?.value;
  const budget = formData.get('budget') || document.getElementById('budget')?.value?.trim();
  const groupSize = formData.get('groupSize') || document.getElementById('groupSize')?.value;
  const travelType = formData.get('travelType') || document.getElementById('travelType')?.value;
  const description = formData.get('description') || document.getElementById('description')?.value?.trim();

  if (!tripTitle || !destination || !startDate || !endDate || !budget) {
    if (window.showToast) {
      window.showToast('Error', 'Please fill in all required fields', 'error');
    }
    return;
  }

  const btn = document.getElementById('publishBtn');
  if (btn) {
    btn.innerHTML = '<div class="spinner spinner-sm" style="border-top-color:white;display:inline-block;"></div>';
    btn.disabled = true;
  }

  const tripData = {
    creator_id: currentUser.id,
    title: tripTitle,
    destination: destination,
    start_date: startDate,
    end_date: endDate,
    budget: parseFloat(budget),
    max_members: parseInt(groupSize || '4'),
    travel_type: travelType,
    description: description,
    status: 'open',
    current_members: 1
  };

  const { data, error } = await window.raahi.createTrip(tripData);

  if (btn) {
    btn.innerHTML = 'Publish Trip';
    btn.disabled = false;
  }

  if (error) {
    if (window.showToast) {
      window.showToast('Error', error.message, 'error');
    }
    return;
  }

  window.closeCreateTripModal();
  if (window.showToast) {
    window.showToast('Trip Published!', `${tripTitle} is now live!`);
  }
  form.reset();
  await loadTrips('my');
}
