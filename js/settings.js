/* ============================================
   RAAHI — Settings JavaScript
   ============================================ */

let currentUser = null;

document.addEventListener('DOMContentLoaded', async () => {
  currentUser = await window.raahi.requireAuth();
  if (!currentUser) return;

  initSidebar();
  await loadSettings();
});

async function loadSettings() {
  const { data: profile } = await window.raahi.getProfile(currentUser.id);
  if (!profile) return;

  document.getElementById('firstNameInput').value = profile.full_name?.split(' ')[0] || 'User';
  document.getElementById('lastNameInput').value = profile.full_name?.split(' ').slice(1).join(' ') || '';
  document.getElementById('bioInput').value = profile.bio || '';
  document.getElementById('phoneInput').value = profile.phone_number || '';
}

async function handleSaveAccountDetails() {
  const firstName = document.getElementById('firstNameInput').value.trim();
  const lastName = document.getElementById('lastNameInput').value.trim();
  const bio = document.getElementById('bioInput').value.trim();
  const phone = document.getElementById('phoneInput').value.trim();

  if (!firstName) {
    window.showToast('Error', 'First name is required', 'error');
    return;
  }

  const fullName = `${firstName}${lastName ? ' ' + lastName : ''}`;

  const { error } = await window.raahi.supabase
    .from('profiles')
    .update({
      full_name: fullName,
      bio: bio,
      phone_number: phone,
      updated_at: new Date().toISOString()
    })
    .eq('id', currentUser.id);

  if (error) {
    window.showToast('Error', 'Failed to save changes: ' + error.message, 'error');
  } else {
    window.showToast('Success', 'Your profile has been updated!', 'success');
    // Update profile page if open
    if (window.parent !== window) {
      window.parent.postMessage({ type: 'profileUpdated' }, '*');
    }
  }
}

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
