/* ============================================
   RAAHI — Profile Logic (Supabase Connected)
   ============================================ */

let currentUser = null;

document.addEventListener('DOMContentLoaded', async () => {
  currentUser = await window.raahi.requireAuth();
  if (!currentUser) return;

  initSidebar();
  await loadProfileData();
  initProfileForms();
  initAvatarUpload();
});

function initSidebar() {
  const sidebar = document.querySelector('.sidebar');
  const overlay = document.querySelector('.sidebar-overlay');
  const toggleBtn = document.querySelector('.sidebar-toggle-btn');
  const closeBtn = document.querySelector('.sidebar-close');

  if (!sidebar) return;

  function openSidebar() {
    sidebar.classList.add('active');
    if (overlay) overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeSidebar() {
    sidebar.classList.remove('active');
    if (overlay) overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (toggleBtn) toggleBtn.addEventListener('click', openSidebar);
  if (closeBtn) closeBtn.addEventListener('click', closeSidebar);
  if (overlay) overlay.addEventListener('click', closeSidebar);
}

async function loadProfileData() {
  const { data: profile } = await window.raahi.getProfile(currentUser.id);
  if (!profile) return;

  // Update profile header display
  const nameEl = document.getElementById('profileDisplayName');
  const collegeEl = document.getElementById('profileDisplayCollege');
  const bioEl = document.getElementById('profileDisplayBio');
  const avatarEl = document.getElementById('profileDisplayAvatar');
  const verifiedEl = document.getElementById('profileVerifiedBadge');

  if (nameEl) nameEl.textContent = profile.full_name || 'User';
  if (collegeEl) collegeEl.innerHTML = `🎓 ${profile.college || 'Not specified'} · ${profile.year || 'Year'} · ${profile.department || 'Department'}`;
  if (bioEl) bioEl.textContent = profile.bio || 'No bio added';

  if (avatarEl) {
    const initials = (profile.full_name || 'U').split(' ').map(n => n[0]).join('').toUpperCase();
    if (profile.avatar_url) {
      avatarEl.style.backgroundImage = `url(${profile.avatar_url})`;
      avatarEl.style.backgroundSize = 'cover';
      avatarEl.style.backgroundPosition = 'center';
      avatarEl.textContent = '';
    } else {
      avatarEl.textContent = initials;
    }
  }

  if (verifiedEl) {
    verifiedEl.textContent = profile.is_verified ? '✓' : '⚠';
  }

  // Update page title
  document.title = `${profile.full_name || 'Profile'} — Raahi`;

  // Fill basic info fields (for forms)
  const fields = {
    'profileName': profile.full_name,
    'profileBio': profile.bio,
    'profileDepartment': profile.department,
    'profileYear': profile.year,
    'profileCity': profile.city,
    'profileGender': profile.gender,
    'profileCollege': profile.college,
  };

  Object.entries(fields).forEach(([id, val]) => {
    const el = document.getElementById(id);
    if (el && val) el.value = val;
  });

  // Trust Score
  const trustEl = document.getElementById('profileTrustScore');
  const trustLevelEl = document.getElementById('profileTrustLevel');
  const trustBarEl = document.getElementById('profileTrustBar');
  if (trustEl) trustEl.textContent = profile.trust_score || 0;
  if (trustLevelEl) trustLevelEl.textContent = profile.trust_level || 'Bronze';
  if (trustBarEl) trustBarEl.style.width = `${Math.min((profile.trust_score || 0), 100)}%`;

  // Email (read only)
  const emailEl = document.getElementById('profileEmail');
  if (emailEl) emailEl.value = profile.email || currentUser.email;

  // Verification badge
  const verBadge = document.getElementById('verificationBadge');
  if (verBadge) {
    verBadge.textContent = profile.is_verified ? '✓ Verified Student' : '⚠ Pending Verification';
    verBadge.style.background = profile.is_verified ? '#dcfce7' : '#fef9c3';
    verBadge.style.color = profile.is_verified ? '#166534' : '#854d0e';
  }

  // Load preferences
  const { data: prefs } = await window.raahi.supabase
    .from('travel_preferences')
    .select('*')
    .eq('user_id', currentUser.id)
    .single();

  if (prefs) {
    const styleEl = document.getElementById('travelStyle');
    const budgetEl = document.getElementById('budgetRange');
    const interestsEl = document.getElementById('profileInterests');
    const destEl = document.getElementById('preferredDestinations');

    if (styleEl && prefs.travel_style) styleEl.value = prefs.travel_style;
    if (budgetEl && prefs.budget_range) budgetEl.value = prefs.budget_range;
    if (interestsEl && prefs.interests) interestsEl.value = prefs.interests.join(', ');
    if (destEl && prefs.preferred_destinations) destEl.value = prefs.preferred_destinations.join(', ');
  }
}

function initProfileForms() {
  const basicForm = document.getElementById('profileBasicForm') || document.getElementById('profileForm');
  if (basicForm) basicForm.addEventListener('submit', handleSaveProfile);

  const prefsForm = document.getElementById('profilePrefsForm') || document.getElementById('preferencesForm');
  if (prefsForm) prefsForm.addEventListener('submit', handleSavePreferences);
}

async function handleSaveProfile(e) {
  e.preventDefault();
  const btn = e.target.querySelector('[type=submit]');
  if (btn) { btn.disabled = true; btn.textContent = 'Saving...'; }

  const updates = {
    full_name: document.getElementById('profileName')?.value?.trim(),
    bio: document.getElementById('profileBio')?.value?.trim(),
    department: document.getElementById('profileDepartment')?.value?.trim(),
    year: document.getElementById('profileYear')?.value,
    city: document.getElementById('profileCity')?.value?.trim(),
    gender: document.getElementById('profileGender')?.value,
    updated_at: new Date().toISOString()
  };

  const { error } = await window.raahi.supabase
    .from('profiles')
    .update(updates)
    .eq('id', currentUser.id);

  if (btn) { btn.disabled = false; btn.textContent = 'Save Changes'; }

  if (error) {
    if (window.showToast) window.showToast('Error', error.message, 'error');
  } else {
    if (window.showToast) window.showToast('Profile Updated!', 'Your changes have been saved.');
  }
}

async function handleSavePreferences(e) {
  e.preventDefault();
  const btn = e.target.querySelector('[type=submit]');
  if (btn) { btn.disabled = true; btn.textContent = 'Saving...'; }

  const interestsRaw = document.getElementById('profileInterests')?.value || '';
  const destRaw = document.getElementById('preferredDestinations')?.value || '';

  const prefs = {
    user_id: currentUser.id,
    travel_style: document.getElementById('travelStyle')?.value,
    budget_range: document.getElementById('budgetRange')?.value,
    interests: interestsRaw.split(',').map(s => s.trim()).filter(Boolean),
    preferred_destinations: destRaw.split(',').map(s => s.trim()).filter(Boolean)
  };

  const { error } = await window.raahi.supabase
    .from('travel_preferences')
    .upsert(prefs, { onConflict: 'user_id' });

  if (btn) { btn.disabled = false; btn.textContent = 'Save Preferences'; }

  if (error) {
    if (window.showToast) window.showToast('Error', error.message, 'error');
  } else {
    if (window.showToast) window.showToast('Preferences Saved!', 'Your travel preferences have been updated.');
  }
}

function initAvatarUpload() {
  const uploadInput = document.getElementById('avatarUpload') || document.getElementById('avatarInput');
  if (!uploadInput) return;

  uploadInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const btn = document.getElementById('uploadAvatarBtn');
    if (btn) { btn.disabled = true; btn.textContent = 'Uploading...'; }

    const fileExt = file.name.split('.').pop();
    const filePath = `${currentUser.id}/avatar.${fileExt}`;

    const { error: uploadErr } = await window.raahi.supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true });

    if (uploadErr) {
      if (window.showToast) window.showToast('Upload Failed', uploadErr.message, 'error');
      if (btn) { btn.disabled = false; btn.textContent = 'Upload Photo'; }
      return;
    }

    const { data: urlData } = window.raahi.supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    await window.raahi.supabase
      .from('profiles')
      .update({ avatar_url: urlData.publicUrl })
      .eq('id', currentUser.id);

    // Update UI
    const avatarEl = document.getElementById('profileAvatar') || document.querySelector('.avatar-lg');
    if (avatarEl) {
      if (avatarEl.tagName === 'IMG') avatarEl.src = urlData.publicUrl;
      else { avatarEl.style.backgroundImage = `url(${urlData.publicUrl})`; avatarEl.textContent = ''; }
    }

    if (btn) { btn.disabled = false; btn.textContent = 'Upload Photo'; }
    if (window.showToast) window.showToast('Photo Updated!', 'Your profile picture has been updated.');
  });
}

// Logout
window.handleLogout = async function() {
  await window.raahi.signOut();
};
