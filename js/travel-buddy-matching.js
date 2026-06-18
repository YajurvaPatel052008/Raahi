/* ============================================
   RAAHI — Travel Buddy Matching UI Logic
   Handles Travel DNA & AI Matches rendering
   ============================================ */

/**
 * Initialize Travel DNA section on dashboard
 */
async function initializeTravelDNA() {
  const container = document.getElementById('travelDNAContainer');
  if (!container) return;

  try {
    // Get current user
    const user = await window.raahi.getUser();
    if (!user) return;

    // Fetch Travel DNA
    const travelDNA = await window.aiService.getTravelDNA(user.id);

    // Render tags
    const tagsContainer = container.querySelector('.travel-dna-tags');
    if (tagsContainer) {
      tagsContainer.innerHTML = travelDNA.tags
        .map(tag => `<span class="travel-dna-tag">${tag}</span>`)
        .join('');
    }

    // Render summary
    const summaryContainer = container.querySelector('.travel-dna-summary');
    if (summaryContainer) {
      summaryContainer.innerHTML = `<p>${travelDNA.summary}</p>`;
    }

    container.style.display = 'block';
  } catch (error) {
    console.error('Error initializing Travel DNA:', error);
    const container = document.getElementById('travelDNAContainer');
    if (container) container.style.display = 'none';
  }
}

/**
 * Initialize AI Matches grid on dashboard
 */
async function initializeAIMatches() {
  const grid = document.getElementById('aiMatchesGrid');
  if (!grid) return;

  // Show loading state
  grid.innerHTML = `
    <div style="grid-column: 1/-1; text-align: center; padding: 48px; color: var(--color-text-muted);">
      <div class="spinner" style="display: inline-block; width: 40px; height: 40px; border: 4px solid var(--color-border); border-top-color: var(--color-primary); border-radius: 50%; animation: spin 0.8s linear infinite;"></div>
      <p style="margin-top: 16px;">Finding your perfect travel buddies...</p>
    </div>
  `;

  try {
    const user = await window.raahi.getUser();
    if (!user) return;

    // Fetch AI matches
    const matches = await window.aiService.getAIMatches(user.id, 6);

    // Render match cards
    if (matches.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 48px;">
          <p style="color: var(--color-text-muted);">No matches found yet. Complete your profile to unlock matches!</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = matches
      .map(match => renderMatchCard(match))
      .join('');

    // Add event listeners to match cards
    grid.querySelectorAll('.ai-match-card').forEach((card, index) => {
      const viewDetailsBtn = card.querySelector('[data-action="view-details"]');
      const sayHelloBtn = card.querySelector('[data-action="say-hello"]');
      const viewProfileBtn = card.querySelector('[data-action="view-profile"]');

      if (viewDetailsBtn) {
        viewDetailsBtn.addEventListener('click', () => openMatchModal(matches[index]));
      }
      if (sayHelloBtn) {
        sayHelloBtn.addEventListener('click', () => {
          window.location.href = `chat.html?partnerId=${matches[index].userId}`;
        });
      }
      if (viewProfileBtn) {
        viewProfileBtn.addEventListener('click', () => {
          window.location.href = `profile.html?userId=${matches[index].userId}`;
        });
      }
    });
  } catch (error) {
    console.error('Error initializing AI Matches:', error);
    grid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 48px;">
        <p style="color: var(--color-text-muted);">Unable to load matches. Please try again later.</p>
      </div>
    `;
  }
}

/**
 * Render a single match card
 */
function renderMatchCard(match) {
  const scoreColor = match.matchScore >= 80 ? '#22c55e' : match.matchScore >= 60 ? '#f59e0b' : '#94a3b8';
  const scoreLabel = match.matchScore >= 80 ? 'Highly Compatible ✓' : match.matchScore >= 60 ? 'Good Match' : 'Partial Match';

  return `
    <div class="ai-match-card" data-match-id="${match.userId}">
      <!-- Avatar & Basic Info -->
      <div class="match-card-header">
        <img src="${match.avatar}" alt="${match.name}" class="match-card-avatar">
        <div class="match-card-info">
          <h4 class="match-card-name">${match.name}</h4>
          <p class="match-card-meta">${match.college} • ${match.year}</p>
          <div class="match-card-score" style="color: ${scoreColor}; font-weight: 600; font-size: 14px; margin-top: 4px;">
            ${match.matchScore}% Compatible
          </div>
        </div>
      </div>

      <!-- Travel DNA Tags -->
      <div class="match-card-tags">
        ${match.travelDNA.slice(0, 2).map(tag => `<span class="match-tag">${tag}</span>`).join('')}
      </div>

      <!-- Explanation -->
      <div class="match-card-explanation">
        <p class="explanation-text">"${match.explanation}"</p>
      </div>

      <!-- Trust Score -->
      <div class="match-card-trust">
        <span class="trust-icon">🏆</span>
        <span class="trust-text">Trust: ${match.trustScore}/5</span>
      </div>

      <!-- Action Buttons -->
      <div class="match-card-actions">
        <button class="btn btn-primary btn-sm" data-action="say-hello" style="flex: 1;">
          Say Hello
        </button>
        <button class="btn btn-outline btn-sm" data-action="view-details" style="flex: 1;">
          Details
        </button>
      </div>
    </div>
  `;
}

/**
 * Open match details modal
 */
async function openMatchModal(match) {
  const modal = document.getElementById('matchDetailsModal');
  if (!modal) {
    console.error('Match details modal not found');
    return;
  }

  try {
    // Fetch detailed match info
    const details = await window.aiService.getMatchDetails(match.userId);
    if (!details) return;

    // Update modal content
    const content = modal.querySelector('.modal-content');
    if (content) {
      content.innerHTML = renderMatchDetailsModal(details);

      // Add event listeners
      const closeBtn = modal.querySelector('.modal-close');
      if (closeBtn) {
        closeBtn.addEventListener('click', closeMatchModal);
      }

      const sayHelloBtn = modal.querySelector('[data-action="say-hello"]');
      if (sayHelloBtn) {
        sayHelloBtn.addEventListener('click', () => {
          window.location.href = `chat.html?partnerId=${details.userId}`;
        });
      }

      const viewProfileBtn = modal.querySelector('[data-action="view-profile"]');
      if (viewProfileBtn) {
        viewProfileBtn.addEventListener('click', () => {
          window.location.href = `profile.html?userId=${details.userId}`;
        });
      }
    }

    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  } catch (error) {
    console.error('Error opening match modal:', error);
  }
}

/**
 * Close match details modal
 */
function closeMatchModal() {
  const modal = document.getElementById('matchDetailsModal');
  if (modal) {
    modal.style.display = 'none';
    document.body.style.overflow = '';
  }
}

/**
 * Render match details modal content
 */
function renderMatchDetailsModal(details) {
  const cb = details.compatibilityBreakdown;

  return `
    <div class="modal-header">
      <h3>Match Details</h3>
      <button class="modal-close" style="background: none; border: none; font-size: 24px; cursor: pointer; color: var(--color-text-muted);">✕</button>
    </div>

    <div class="modal-body">
      <!-- Profile Header -->
      <div class="modal-profile-header">
        <img src="${details.avatar}" alt="${details.name}" class="modal-profile-avatar">
        <div class="modal-profile-info">
          <h4 style="font-size: 18px; font-weight: 600; margin-bottom: 4px;">${details.name}</h4>
          <p style="color: var(--color-text-muted); font-size: 14px; margin-bottom: 8px;">${details.college} • ${details.year}</p>
          <div style="display: flex; gap: 8px; align-items: center;">
            <span style="font-size: 14px;">🏆</span>
            <span style="font-size: 14px; font-weight: 600;">Trust Score: ${details.trustScore}/5</span>
          </div>
        </div>
      </div>

      <!-- Overall Match Score -->
      <div class="modal-score-card" style="background: linear-gradient(135deg, #2563EB 0%, #0ea5e9 100%); padding: 20px; border-radius: 8px; color: white; margin-bottom: 20px;">
        <div style="text-align: center;">
          <div style="font-size: 36px; font-weight: 700; margin-bottom: 4px;">${details.matchScore}%</div>
          <div style="font-size: 14px; opacity: 0.9;">Overall Compatibility</div>
        </div>
      </div>

      <!-- Compatibility Breakdown -->
      <div class="modal-breakdown">
        <h4 style="font-size: 16px; font-weight: 600; margin-bottom: 12px;">Compatibility Breakdown</h4>

        <div class="breakdown-item">
          <div class="breakdown-label">Travel Style Match</div>
          <div class="breakdown-bar">
            <div class="breakdown-fill" style="width: ${cb.travelStyleMatch}%;"></div>
          </div>
          <span class="breakdown-percent">${cb.travelStyleMatch}%</span>
        </div>

        <div class="breakdown-item">
          <div class="breakdown-label">Budget Match</div>
          <div class="breakdown-bar">
            <div class="breakdown-fill" style="width: ${cb.budgetMatch}%;"></div>
          </div>
          <span class="breakdown-percent">${cb.budgetMatch}%</span>
        </div>

        <div class="breakdown-item">
          <div class="breakdown-label">Interest Match</div>
          <div class="breakdown-bar">
            <div class="breakdown-fill" style="width: ${cb.interestMatch}%;"></div>
          </div>
          <span class="breakdown-percent">${cb.interestMatch}%</span>
        </div>

        <div class="breakdown-item">
          <div class="breakdown-label">Personality Match</div>
          <div class="breakdown-bar">
            <div class="breakdown-fill" style="width: ${cb.personalityMatch}%;"></div>
          </div>
          <span class="breakdown-percent">${cb.personalityMatch}%</span>
        </div>
      </div>

      <!-- Travel DNA -->
      <div style="margin-bottom: 20px;">
        <h4 style="font-size: 16px; font-weight: 600; margin-bottom: 12px;">Travel DNA</h4>
        <div style="display: flex; flex-wrap: wrap; gap: 8px;">
          ${details.travelDNA.map(tag => `<span class="travel-dna-tag">${tag}</span>`).join('')}
        </div>
      </div>

      <!-- AI Summary -->
      <div style="background: var(--color-bg-secondary); padding: 16px; border-radius: 8px; margin-bottom: 20px;">
        <h4 style="font-size: 14px; font-weight: 600; margin-bottom: 8px;">AI Summary</h4>
        <p style="font-size: 13px; line-height: 1.5; color: var(--color-text);">${details.aiSummary}</p>
      </div>

      <!-- Action Buttons -->
      <div style="display: flex; gap: 12px;">
        <button class="btn btn-primary" data-action="say-hello" style="flex: 1;">
          Say Hello
        </button>
        <button class="btn btn-outline" data-action="view-profile" style="flex: 1;">
          View Profile
        </button>
      </div>
    </div>
  `;
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('travelDNAContainer')) {
    initializeTravelDNA();
  }
  if (document.getElementById('aiMatchesGrid')) {
    initializeAIMatches();
  }

  // Close modal when clicking overlay
  const modal = document.getElementById('matchDetailsModal');
  if (modal) {
    const overlay = modal.querySelector('.modal-overlay');
    if (overlay) {
      overlay.addEventListener('click', closeMatchModal);
    }
  }
});

// Export for external use
window.travelBuddyMatching = {
  initializeTravelDNA,
  initializeAIMatches,
  openMatchModal,
  closeMatchModal
};
