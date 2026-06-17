/* ============================================
   RAAHI — Trips Logic
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  initTripTabs();
});

/* ── Trip Tabs ── */
function initTripTabs() {
  const tabs = document.querySelectorAll('#tripTabs .tab');
  const grid = document.getElementById('tripsGrid');
  
  if (!tabs.length || !grid) return;

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Update active state
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      // Simulate loading/filtering
      grid.style.opacity = '0';
      grid.style.transform = 'translateY(10px)';
      
      setTimeout(() => {
        const target = tab.getAttribute('data-target');
        
        if (target === 'past') {
          grid.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1;">
              <div class="empty-state-icon">✈️</div>
              <h3>No past trips yet</h3>
              <p>When you complete a trip, it will appear here.</p>
              <a href="discover.html" class="btn btn-primary">Find a Trip</a>
            </div>
          `;
        } else {
          // Just reload the page to get the original HTML back for demo
          location.reload();
        }
        
        grid.style.opacity = '1';
        grid.style.transform = 'translateY(0)';
      }, 300);
    });
  });
}

/* ── Create Trip Modal ── */
window.openCreateTripModal = function() {
  const modal = document.getElementById('createTripModal');
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
};

window.submitTrip = function() {
  const btn = document.getElementById('publishBtn');
  const originalText = btn.textContent;
  
  btn.innerHTML = '<div class="spinner spinner-sm" style="border-top-color: white;"></div>';
  btn.disabled = true;

  setTimeout(() => {
    const modal = document.getElementById('createTripModal');
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
    
    if (window.showToast) {
      window.showToast('Trip Published!', 'Your trip is now live and visible to matches.');
    }
    
    btn.innerHTML = originalText;
    btn.disabled = false;
    document.getElementById('createTripForm').reset();
  }, 1500);
};
