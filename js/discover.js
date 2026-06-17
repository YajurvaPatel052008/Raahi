/* ============================================
   RAAHI — Discover Logic
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  initFilters();
});

/* ── Simulate Search & Filter ── */
window.simulateSearch = function() {
  const grid = document.getElementById('searchResultsGrid');
  const count = document.getElementById('resultsCount');
  const input = document.getElementById('searchInput');
  
  if (!grid || !count) return;

  // Show loading state
  grid.style.opacity = '0.5';
  
  setTimeout(() => {
    grid.style.opacity = '1';
    
    // Simulate finding 1 result if searched for something specific
    if (input && input.value.toLowerCase().includes('goa')) {
      // Hide all but first child
      Array.from(grid.children).forEach((child, index) => {
        child.style.display = index === 0 ? 'block' : 'none';
      });
      count.textContent = 'Showing 1 trip';
    } else {
      // Show all
      Array.from(grid.children).forEach(child => {
        child.style.display = 'block';
      });
      count.textContent = 'Showing 3 trips';
    }
  }, 600);
};

function initFilters() {
  const selects = document.querySelectorAll('.filter-select');
  const resetBtn = document.getElementById('resetFilters');

  selects.forEach(select => {
    select.addEventListener('change', window.simulateSearch);
  });

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      selects.forEach(select => select.value = '');
      const input = document.getElementById('searchInput');
      if (input) input.value = '';
      window.simulateSearch();
    });
  }
}
