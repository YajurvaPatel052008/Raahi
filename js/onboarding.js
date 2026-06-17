/* ============================================
   RAAHI — Onboarding Quiz Logic
   ============================================ */

const quizQuestions = [
  {
    id: 'destination',
    emoji: '🌍',
    question: 'What is your ideal getaway?',
    subtitle: 'This helps us match you with similar travelers.',
    options: [
      { id: 'mountains', icon: '🏔️', label: 'Mountains', desc: 'Trekking, cold weather, nature' },
      { id: 'beaches', icon: '🏖️', label: 'Beaches', desc: 'Sun, sand, and relaxation' }
    ]
  },
  {
    id: 'style',
    emoji: '🎒',
    question: 'How do you like to travel?',
    subtitle: 'Pick your preferred travel pace.',
    options: [
      { id: 'adventure', icon: '⛺', label: 'Adventure', desc: 'Action-packed, exploring, active' },
      { id: 'relax', icon: '☕', label: 'Relaxation', desc: 'Chilling, cafes, slow pace' }
    ]
  },
  {
    id: 'budget',
    emoji: '💰',
    question: 'What is your usual travel budget?',
    subtitle: 'We use this to suggest realistic trips.',
    options: [
      { id: 'budget', icon: '🚂', label: 'Budget', desc: 'Hostels, trains, street food' },
      { id: 'premium', icon: '✈️', label: 'Premium', desc: 'Hotels, flights, comfortable' }
    ]
  },
  {
    id: 'group',
    emoji: '👥',
    question: 'Who do you prefer to travel with?',
    subtitle: 'Your preferred group size.',
    options: [
      { id: 'solo', icon: '🚶', label: 'Solo / Duo', desc: '1-2 people maximum' },
      { id: 'group', icon: '👨‍👩‍👧‍👦', label: 'Group', desc: '3-6 people, lively vibe' }
    ]
  },
  {
    id: 'duration',
    emoji: '📅',
    question: 'How long do you usually travel?',
    subtitle: 'Last question!',
    options: [
      { id: 'weekend', icon: '🎒', label: 'Weekend Trips', desc: '2-3 days, quick escapes' },
      { id: 'long', icon: '🧳', label: 'Long Trips', desc: '1-2 weeks, deep exploration' }
    ]
  }
];

let currentStep = 0;
const answers = {};

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('quizContainer')) {
    renderQuestion(0);
  }
});

function renderQuestion(index) {
  const container = document.getElementById('quizContainer');
  const progressBar = document.getElementById('progressBar');
  const stepLabel = document.getElementById('stepLabel');
  
  if (!container || !quizQuestions[index]) return;

  const q = quizQuestions[index];
  
  // Update progress
  const progress = ((index + 1) / quizQuestions.length) * 100;
  progressBar.style.width = `${progress}%`;
  stepLabel.textContent = `Question ${index + 1} of ${quizQuestions.length}`;

  // Build HTML
  let optionsHtml = '';
  q.options.forEach(opt => {
    const isSelected = answers[q.id] === opt.id ? 'selected' : '';
    optionsHtml += `
      <div class="quiz-option ${isSelected}" onclick="selectOption('${q.id}', '${opt.id}')">
        <div class="quiz-option-icon">${opt.icon}</div>
        <div class="quiz-option-label">${opt.label}</div>
        <div class="quiz-option-desc">${opt.desc}</div>
      </div>
    `;
  });

  const html = `
    <div class="quiz-card" id="questionCard">
      <div class="quiz-emoji">${q.emoji}</div>
      <h2 class="quiz-question">${q.question}</h2>
      <p class="quiz-subtitle">${q.subtitle}</p>
      
      <div class="quiz-options">
        ${optionsHtml}
      </div>

      <div class="quiz-actions">
        ${index > 0 ? `<button class="btn btn-ghost" onclick="prevQuestion()">← Back</button>` : '<div></div>'}
        <button class="btn btn-primary" onclick="nextQuestion()" ${!answers[q.id] ? 'disabled' : ''} id="nextBtn">
          ${index === quizQuestions.length - 1 ? 'See Profile →' : 'Next →'}
        </button>
      </div>
    </div>
  `;

  // Animate transition
  const card = document.getElementById('questionCard');
  if (card) {
    card.style.opacity = '0';
    card.style.transform = 'translateY(-20px)';
    setTimeout(() => {
      container.innerHTML = html;
    }, 200);
  } else {
    container.innerHTML = html;
  }
}

window.selectOption = function(questionId, optionId) {
  answers[questionId] = optionId;
  
  // Update UI immediately
  const options = document.querySelectorAll('.quiz-option');
  options.forEach(opt => opt.classList.remove('selected'));
  event.currentTarget.classList.add('selected');
  
  // Enable next button
  document.getElementById('nextBtn').disabled = false;
  
  // Auto advance after short delay
  setTimeout(() => {
    nextQuestion();
  }, 400);
};

window.nextQuestion = function() {
  if (currentStep < quizQuestions.length - 1) {
    currentStep++;
    renderQuestion(currentStep);
  } else {
    showResult();
  }
};

window.prevQuestion = function() {
  if (currentStep > 0) {
    currentStep--;
    renderQuestion(currentStep);
  }
};

function showResult() {
  const container = document.getElementById('quizContainer');
  const resultContainer = document.getElementById('resultContainer');
  const progressBar = document.getElementById('progressBar');
  const stepLabel = document.getElementById('stepLabel');
  
  container.style.display = 'none';
  resultContainer.classList.remove('hidden');
  
  progressBar.style.width = '100%';
  stepLabel.textContent = 'Profile Complete';
  stepLabel.nextElementSibling.style.display = 'none'; // hide "Travel Style" text
  
  // Here we would normally calculate the persona based on 'answers'
  // For demo, we just show the hardcoded one in HTML
}
