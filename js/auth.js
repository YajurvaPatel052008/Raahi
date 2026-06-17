/* ============================================
   RAAHI — Authentication JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  initPasswordToggle();
  initOTPInputs();
  if (document.getElementById('countdown')) {
    startTimer();
  }
});

/* ── Password Visibility Toggle ── */
function initPasswordToggle() {
  window.togglePasswordVisibility = function(inputId) {
    const input = document.getElementById(inputId);
    const icon = input.nextElementSibling;
    
    if (input.type === 'password') {
      input.type = 'text';
      icon.textContent = '🙈';
    } else {
      input.type = 'password';
      icon.textContent = '👁️';
    }
  };
}

/* ── Password Strength Indicator ── */
window.updatePasswordStrength = function(password) {
  const bars = [
    document.getElementById('strengthBar1'),
    document.getElementById('strengthBar2'),
    document.getElementById('strengthBar3')
  ];
  const text = document.getElementById('strengthText');
  
  if (!bars[0] || !text) return;

  // Reset classes
  bars.forEach(bar => bar.className = 'password-strength-bar');

  if (!password) {
    text.textContent = 'Password must be at least 8 characters.';
    text.style.color = 'var(--color-text-muted)';
    return;
  }

  let strength = 0;
  if (password.length >= 8) strength += 1;
  if (password.match(/[A-Z]/) && password.match(/[0-9]/)) strength += 1;
  if (password.match(/[^A-Za-z0-9]/)) strength += 1;

  if (strength === 1) {
    bars[0].classList.add('weak');
    text.textContent = 'Weak password';
    text.style.color = 'var(--color-error)';
  } else if (strength === 2) {
    bars[0].classList.add('medium');
    bars[1].classList.add('medium');
    text.textContent = 'Medium strength';
    text.style.color = 'var(--color-warning)';
  } else if (strength >= 3) {
    bars[0].classList.add('strong');
    bars[1].classList.add('strong');
    bars[2].classList.add('strong');
    text.textContent = 'Strong password';
    text.style.color = 'var(--color-success)';
  }
};

/* ── OTP Inputs Logic ── */
function initOTPInputs() {
  const inputs = document.querySelectorAll('.otp-input');
  if (!inputs.length) return;

  inputs.forEach((input, index) => {
    // Handle input
    input.addEventListener('input', (e) => {
      // Allow only numbers
      input.value = input.value.replace(/[^0-9]/g, '');
      
      if (input.value && index < inputs.length - 1) {
        inputs[index + 1].focus();
      }
    });

    // Handle backspace
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && !input.value && index > 0) {
        inputs[index - 1].focus();
      }
    });

    // Handle paste
    input.addEventListener('paste', (e) => {
      e.preventDefault();
      const pastedData = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 4);
      
      if (pastedData) {
        pastedData.split('').forEach((char, i) => {
          if (inputs[i]) {
            inputs[i].value = char;
            if (i < inputs.length - 1) inputs[i + 1].focus();
          }
        });
      }
    });
  });
}

/* ── OTP Resend Timer ── */
window.startTimer = function() {
  const timerText = document.getElementById('timerText');
  const resendLink = document.getElementById('resendLink');
  const countdownEl = document.getElementById('countdown');
  
  if (!timerText || !resendLink || !countdownEl) return;

  timerText.classList.remove('hidden');
  resendLink.classList.add('hidden');
  
  let timeLeft = 30;
  
  const timer = setInterval(() => {
    timeLeft--;
    const seconds = timeLeft < 10 ? `0${timeLeft}` : timeLeft;
    countdownEl.textContent = `00:${seconds}`;
    
    if (timeLeft <= 0) {
      clearInterval(timer);
      timerText.classList.add('hidden');
      resendLink.classList.remove('hidden');
      if (window.showToast) {
        window.showToast('Code expired', 'You can now request a new code.', 'info');
      }
    }
  }, 1000);
};

/* ── Simulate Auth Flow ── */
window.simulateAuth = function(redirectUrl) {
  const btn = document.getElementById('submitBtn');
  const originalText = btn.textContent;
  
  // Quick validation check
  const form = btn.closest('form');
  if (form && typeof validateForm === 'function' && !validateForm(form)) {
    return;
  }

  // Check OTP specifically
  if (form && form.id === 'verifyForm') {
    const inputs = form.querySelectorAll('.otp-input');
    const isComplete = Array.from(inputs).every(input => input.value.length === 1);
    
    if (!isComplete) {
      const errorMsg = document.getElementById('otpError');
      if (errorMsg) errorMsg.style.display = 'flex';
      return;
    }
  }

  // Simulate loading state
  btn.innerHTML = '<div class="spinner spinner-sm" style="border-top-color: white;"></div>';
  btn.disabled = true;

  // Fake network request
  setTimeout(() => {
    window.location.href = redirectUrl;
  }, 1500);
};

/* ── Simulate Password Reset ── */
window.simulatePasswordReset = function() {
  const form = document.getElementById('forgotForm');
  const emailInput = document.getElementById('email');
  const successDiv = document.getElementById('resetSuccess');
  const emailText = document.getElementById('resetEmailText');
  const btn = document.getElementById('submitBtn');
  
  if (typeof validateForm === 'function' && !validateForm(form)) {
    return;
  }

  const email = emailInput.value;
  
  btn.innerHTML = '<div class="spinner spinner-sm" style="border-top-color: white;"></div>';
  btn.disabled = true;

  setTimeout(() => {
    form.style.display = 'none';
    emailText.textContent = email;
    successDiv.classList.remove('hidden');
    
    // Add success toast
    if (window.showToast) {
      window.showToast('Email sent', 'Please check your inbox for the reset link.');
    }
  }, 1500);
};
