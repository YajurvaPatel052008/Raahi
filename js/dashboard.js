/* ============================================
   RAAHI — Dashboard Logic (Modern Redesign)
   Supabase Connected - Backend Preserved
   ============================================ */

document.addEventListener('DOMContentLoaded', async () => {
  setupSidebar();
  setupHeaderDropdowns();
  initializeInspiration();

  const user = await window.raahi.requireAuth();
  if (!user) return;

  await Promise.all([
    loadProfile(user),
    loadMyTrips(user.id),
    loadStats(user.id)
  ]);
});

async function loadProfile(user) {
  const { data: profile } = await window.raahi.getProfile(user.id);
  if (!profile) return;

  const firstNameEl = document.getElementById('userFirstName');
  if (firstNameEl) {
    firstNameEl.textContent = profile.full_name?.split(' ')[0] || 'Traveller';
  }

  const sidebarUserName = document.getElementById('sidebarUserName');
  const sidebarUserEmail = document.getElementById('sidebarUserEmail');
  const sidebarAvatar = document.getElementById('sidebarAvatar');

  if (sidebarUserName) {
    sidebarUserName.textContent = profile.full_name || user.email;
  }
  if (sidebarUserEmail) {
    sidebarUserEmail.textContent = user.email;
  }
  if (sidebarAvatar) {
    if (profile.avatar_url) {
      sidebarAvatar.innerHTML = `<img src="${profile.avatar_url}" alt="avatar" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">`;
    } else {
      const initials = profile.full_name
        ?.split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase() || 'U';
      sidebarAvatar.textContent = initials;
      sidebarAvatar.style.background = 'linear-gradient(135deg, #2563EB, #06B6D4)';
    }
  }
}

async function loadMyTrips(userId) {
  const { data: trips } = await window.raahi.getMyTrips(userId);

  if (!trips || trips.length === 0) {
    console.log('No trips found');
    return;
  }

  const upcomingTrip = trips.find(t => t.status === 'open') || trips[0];
  if (upcomingTrip) {
    displayTripPreview(upcomingTrip);
  }
}

function displayTripPreview(trip) {
  const tripPreviewTitle = document.querySelector('.trip-preview-title');
  const tripPreviewDates = document.querySelector('.trip-preview-dates');
  const tripPreviewMembers = document.querySelector('.trip-preview-members');
  const tripPreviewMeta = document.querySelector('.trip-preview-meta');
  const tripPreviewImage = document.querySelector('.trip-preview-image');

  if (tripPreviewTitle) {
    tripPreviewTitle.textContent = trip.title || trip.destination;
  }

  if (tripPreviewDates) {
    const svg = tripPreviewDates.querySelector('svg');
    tripPreviewDates.innerHTML = svg ? svg.outerHTML : '📅';
    tripPreviewDates.appendChild(
      document.createTextNode(
        ` ${trip.start_date} - ${trip.end_date}`
      )
    );
  }

  if (tripPreviewMembers) {
    tripPreviewMembers.innerHTML = `
      <div class="avatar-group-inline">
        <div class="avatar avatar-xs" style="background: #2563EB; color: white;">Y</div>
      </div>
      <span class="trip-preview-count">${trip.current_members || 1} member${trip.current_members !== 1 ? 's' : ''} confirmed</span>
    `;
  }

  if (tripPreviewMeta) {
    tripPreviewMeta.innerHTML = `
      <div class="meta-item">
        <span class="meta-label">Budget</span>
        <span class="meta-value">₹${Number(trip.budget).toLocaleString('en-IN')}</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">Status</span>
        <span class="badge badge-${trip.status === 'open' ? 'success' : 'neutral'}">${trip.status}</span>
      </div>
    `;
  }

  if (tripPreviewImage) {
    tripPreviewImage.style.background = 'linear-gradient(135deg, #667eea, #764ba2)';
  }
}

async function loadStats(userId) {
  const supabase = window.raahi.supabase;

  const [tripsRes, matchesRes, reviewsRes] = await Promise.all([
    supabase
      .from('trips')
      .select('id', { count: 'exact', head: true })
      .eq('creator_id', userId),
    supabase
      .from('trip_members')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('join_status', 'approved'),
    supabase
      .from('reviews')
      .select('id', { count: 'exact', head: true })
      .eq('reviewed_user_id', userId)
  ]);

  const tripCountEl = document.getElementById('tripCount');
  if (tripCountEl) {
    tripCountEl.textContent = tripsRes.count || 0;
    animateCounter(tripCountEl, 0, tripsRes.count || 0);
  }
}

function animateCounter(element, start, end) {
  const duration = 1000;
  const increment = (end - start) / (duration / 16);
  let current = start;

  const timer = setInterval(() => {
    current += increment;
    if (current >= end) {
      current = end;
      clearInterval(timer);
    }
    element.textContent = Math.floor(current);
  }, 16);
}

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
      if (window.innerWidth < 1024) {
        closeSidebar();
      }
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
    document.querySelectorAll('.notification-dropdown, .sidebar-user-dropdown').forEach(
      dropdown => dropdown.classList.remove('active')
    );
  });
}

function initializeInspiration() {
  const inspirationCards = document.querySelectorAll('.inspiration-card');

  inspirationCards.forEach((card, index) => {
    card.addEventListener('mouseenter', () => {
      card.style.transform = 'translateY(-6px)';
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'translateY(0)';
    });

    const img = card.querySelector('.inspiration-card-image');
    if (img) {
      img.addEventListener('error', () => {
        card.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
      });
    }

    const destinationLinks = card.querySelectorAll('a');
    destinationLinks.forEach(link => {
      if (!link.href || link.href === '#') {
        link.href = 'discover.html';
      }
    });
  });

  const destinationCards = document.querySelectorAll('.destination-card');
  destinationCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
      card.style.transform = 'translateY(-4px)';
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'translateY(0)';
    });

    const img = card.querySelector('.destination-image');
    if (img) {
      img.addEventListener('error', () => {
        img.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        img.style.backgroundSize = 'cover';
      });

      img.addEventListener('load', () => {
        img.style.animation = 'fadeInImage 0.6s ease-out';
      });
    }
  });

  const tripPreviewImg = document.querySelector('.trip-preview-image');
  if (tripPreviewImg) {
    tripPreviewImg.addEventListener('error', () => {
      tripPreviewImg.style.background = 'linear-gradient(135deg, #2563EB, #06B6D4)';
    });
  }
}

window.handleLogout = async function() {
  await window.raahi.signOut();
};

window.toggleUserMenu = function(e) {
  e.stopPropagation();
  const dropdown = e.target.closest('.sidebar-user').querySelector('.sidebar-user-dropdown');
  dropdown.classList.toggle('active');
};
