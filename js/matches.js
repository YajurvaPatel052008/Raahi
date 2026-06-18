/* ============================================
   RAAHI — Matches Logic (Supabase Connected)
   ============================================ */

let currentUser = null;

document.addEventListener('DOMContentLoaded', async () => {
  currentUser = await window.raahi.requireAuth();
  if (!currentUser) return;

  await loadMatches();
});

async function loadMatches() {
  const grid = document.getElementById('matchesGrid') || document.querySelector('.matches-grid');
  if (!grid) return;

  grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:48px;color:var(--color-text-muted);">
    <div class="spinner"></div><p style="margin-top:16px;">Finding compatible travelers...</p>
  </div>`;

  // Fetch current user's profile and preferences
  const { data: myProfile } = await window.raahi.getProfile(currentUser.id);
  const { data: myPrefs } = await window.raahi.supabase
    .from('travel_preferences')
    .select('*')
    .eq('user_id', currentUser.id)
    .single();

  // Fetch all open trips (excluding own) with host profiles
  const { data: trips } = await window.raahi.supabase
    .from('trips')
    .select('*, profiles!creator_id(id, full_name, avatar_url, college, trust_level, trust_score)')
    .eq('status', 'open')
    .neq('creator_id', currentUser.id)
    .order('created_at', { ascending: false });

  if (!trips || trips.length === 0) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column:1/-1;text-align:center;padding:64px;">
        <div style="font-size:48px;margin-bottom:16px;">🤝</div>
        <h3>No matches yet</h3>
        <p style="color:var(--color-text-muted);">Complete your profile with travel preferences to unlock matches.</p>
        <a href="profile.html" class="btn btn-primary" style="margin-top:16px;">Complete Profile</a>
      </div>`;
    return;
  }

  // Calculate compatibility scores client-side
  const scored = trips.map(trip => {
    let score = 0;
    // Budget match (30%)
    score += 30; // Default full if no pref set yet
    // Style match (30%)
    if (myPrefs?.travel_style && trip.travel_type) {
      score += myPrefs.travel_style.toLowerCase() === trip.travel_type.toLowerCase() ? 30 : 10;
    } else {
      score += 15;
    }
    // Interests (20%) — will be 10 default
    score += 10;
    // Destination preference (20%)
    if (myPrefs?.preferred_destinations?.some(d => trip.destination.toLowerCase().includes(d.toLowerCase()))) {
      score += 20;
    } else {
      score += 8;
    }
    return { trip, score: Math.min(score, 100) };
  }).sort((a, b) => b.score - a.score);

  const getScoreColor = (s) => s >= 80 ? '#22c55e' : s >= 60 ? '#f59e0b' : '#94a3b8';
  const getScoreLabel = (s) => s >= 80 ? 'Highly Compatible ✓' : s >= 60 ? 'Good Match' : 'Partial Match';

  grid.innerHTML = scored.map(({ trip, score }) => `
    <div class="card" style="position:relative;overflow:hidden;">
      <div style="text-align:center;margin-bottom:20px;">
        <div style="width:80px;height:80px;border-radius:50%;border:4px solid ${getScoreColor(score)};
          display:flex;align-items:center;justify-content:center;margin:0 auto 8px;
          font-size:22px;font-weight:800;color:${getScoreColor(score)};">
          ${score}%
        </div>
        <div style="font-size:13px;font-weight:600;color:${getScoreColor(score)};">${getScoreLabel(score)}</div>
      </div>
      <h3 style="font-weight:700;font-size:18px;text-align:center;margin-bottom:4px;">${trip.destination}</h3>
      <p style="font-size:13px;color:var(--color-text-muted);text-align:center;margin-bottom:16px;">
        📅 ${trip.start_date} → ${trip.end_date} · ₹${Number(trip.budget).toLocaleString('en-IN')}
      </p>
      <!-- Progress Bars -->
      <div style="border-top:1px solid var(--color-border-light);padding-top:16px;margin-bottom:16px;">
        ${[['💰 Budget', 30, 30], ['🏔️ Travel Style', trip.travel_type && myPrefs?.travel_style && myPrefs.travel_style.toLowerCase() === trip.travel_type.toLowerCase() ? 30 : 10, 30], ['🎯 Interests', 10, 20], ['📍 Destination', myPrefs?.preferred_destinations?.some(d => trip.destination.toLowerCase().includes(d.toLowerCase())) ? 20 : 8, 20]]
          .map(([label, val, max]) => `
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;font-size:13px;">
            <span style="width:100px;white-space:nowrap;">${label}</span>
            <div style="flex:1;height:4px;background:#e5e7eb;border-radius:2px;">
              <div style="height:100%;width:${(val/max)*100}%;background:${getScoreColor(score)};border-radius:2px;"></div>
            </div>
            <span style="font-weight:600;font-size:11px;width:32px;text-align:right;">${val}/${max}</span>
          </div>`).join('')}
      </div>
      <!-- Host -->
      <div style="display:flex;align-items:center;gap:10px;padding-top:12px;border-top:1px solid var(--color-border-light);margin-bottom:16px;">
        <div style="width:36px;height:36px;border-radius:50%;background:#DBEAFE;color:#2563EB;display:flex;align-items:center;justify-content:center;font-weight:700;">
          ${trip.profiles?.full_name?.[0] || '?'}
        </div>
        <div style="flex:1;">
          <div style="font-weight:600;font-size:14px;">${trip.profiles?.full_name || 'Unknown'}</div>
          <div style="font-size:12px;color:var(--color-text-muted);">${trip.profiles?.trust_level || 'Bronze'} · Trust: ${trip.profiles?.trust_score || 0}pts</div>
        </div>
      </div>
      <a href="trip-detail.html?id=${trip.id}" class="btn btn-primary w-full" style="text-align:center;display:block;">View Trip →</a>
    </div>`).join('');

  // Animate score circles
  initMatchScores();
}

function initMatchScores() {
  const scoreElements = document.querySelectorAll('.match-score-circle');
  if (!scoreElements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) { animateScore(entry.target); observer.unobserve(entry.target); }
    });
  }, { threshold: 0.5 });

  scoreElements.forEach(el => observer.observe(el));
}

function animateScore(container) {
  const targetScore = parseInt(container.getAttribute('data-score'), 10) || 0;
  const valueEl = container.querySelector('.match-score-value');
  const circle = container.querySelector('.match-score-fill');
  if (!valueEl || !circle) return;

  const circumference = 2 * Math.PI * 64;
  circle.style.strokeDasharray = circumference;

  let currentScore = 0;
  const duration = 1500;
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 4);
    currentScore = Math.floor(eased * targetScore);
    valueEl.textContent = `${currentScore}%`;
    circle.style.strokeDashoffset = circumference - (currentScore / 100) * circumference;
    if (progress < 1) requestAnimationFrame(update);
    else { valueEl.textContent = `${targetScore}%`; circle.style.strokeDashoffset = circumference - (targetScore / 100) * circumference; }
  }
  requestAnimationFrame(update);
}
