/* ============================================
   RAAHI — Landing Page JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  initCounters();
});

/* ── Animated Counters for Stats ── */
function initCounters() {
  const statElements = document.querySelectorAll('.hero-stat-value[data-count]');
  if (!statElements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = parseInt(entry.target.getAttribute('data-count'), 10);
        animateCounter(entry.target, target, 2000);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  statElements.forEach(el => observer.observe(el));
}
