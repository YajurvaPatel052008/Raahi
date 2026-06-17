/* ============================================
   RAAHI — Matches Logic
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  initMatchScores();
});

function initMatchScores() {
  const scoreElements = document.querySelectorAll('.match-score-circle');
  if (!scoreElements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateScore(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  scoreElements.forEach(el => observer.observe(el));
}

function animateScore(container) {
  const targetScore = parseInt(container.getAttribute('data-score'), 10) || 0;
  const valueEl = container.querySelector('.match-score-value');
  const circle = container.querySelector('.match-score-fill');
  
  if (!valueEl || !circle) return;

  const circumference = 2 * Math.PI * 64; // r=64
  circle.style.strokeDasharray = circumference;
  
  // Set color based on score
  if (targetScore >= 90) {
    circle.style.stroke = 'url(#matchGradient)';
  } else if (targetScore >= 75) {
    circle.style.stroke = 'var(--color-success)';
  } else {
    circle.style.stroke = 'var(--color-warning)';
  }

  let currentScore = 0;
  const duration = 1500;
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Easing function (easeOutQuart)
    const eased = 1 - Math.pow(1 - progress, 4);
    
    currentScore = Math.floor(eased * targetScore);
    valueEl.textContent = `${currentScore}%`;
    
    const offset = circumference - (currentScore / 100) * circumference;
    circle.style.strokeDashoffset = offset;

    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      valueEl.textContent = `${targetScore}%`;
      circle.style.strokeDashoffset = circumference - (targetScore / 100) * circumference;
    }
  }

  requestAnimationFrame(update);
}
