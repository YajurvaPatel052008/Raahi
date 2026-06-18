/* ============================================
   RAAHI — Authentication JavaScript (Supabase)
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  initPasswordToggle();
  initAuthForms();
});

/* ── Init all auth form listeners ── */
function initAuthForms() {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const forgotForm = document.getElementById('forgotForm');

  if (loginForm) {
    // Remove old onsubmit
    loginForm.removeAttribute('onsubmit');
    loginForm.addEventListener('submit', handleLogin);
  }

  if (registerForm) {
    registerForm.removeAttribute('onsubmit');
    registerForm.addEventListener('submit', handleRegister);
  }

  if (forgotForm) {
    forgotForm.removeAttribute('onsubmit');
    forgotForm.addEventListener('submit', handleForgotPassword);
  }
}

/* ── Show/Hide error on page ── */
function showFormError(message) {
  let el = document.getElementById('authError');
  if (!el) {
    el = document.createElement('div');
    el.id = 'authError';
    el.style.cssText = 'background:#fee2e2;color:#b91c1c;padding:12px 16px;border-radius:8px;font-size:14px;margin-bottom:16px;border:1px solid #fca5a5;';
    const form = document.querySelector('.auth-form');
    if (form) form.prepend(el);
  }
  el.textContent = '⚠️ ' + message;
  el.style.display = 'block';
}

function hideFormError() {
  const el = document.getElementById('authError');
  if (el) el.style.display = 'none';
}

function setButtonLoading(loading) {
  const btn = document.getElementById('submitBtn');
  if (!btn) return;
  if (loading) {
    btn._originalText = btn.innerHTML;
    btn.innerHTML = '<div class="spinner spinner-sm" style="border-top-color: white; display:inline-block;"></div>';
    btn.disabled = true;
  } else {
    btn.innerHTML = btn._originalText || btn.innerHTML;
    btn.disabled = false;
  }
}

/* ══════════════════════════════════════════
   LOGIN
══════════════════════════════════════════ */
async function handleLogin(e) {
  e.preventDefault();
  hideFormError();
  setButtonLoading(true);

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  const { data, error } = await window.raahi.signIn({ email, password });

  if (error) {
    setButtonLoading(false);
    showFormError(error.message === 'Invalid login credentials'
      ? 'Incorrect email or password. Please try again.'
      : error.message);
    return;
  }

  // Successful login — redirect to dashboard
  window.location.href = 'dashboard.html';
}

/* ══════════════════════════════════════════
   REGISTER
══════════════════════════════════════════ */
async function handleRegister(e) {
  e.preventDefault();
  hideFormError();

  const firstName = document.getElementById('firstName').value.trim();
  const lastName = document.getElementById('lastName').value.trim();
  const email = document.getElementById('email').value.trim();
  const college = document.getElementById('college').value;
  const year = document.getElementById('year').value;
  const password = document.getElementById('password').value;

  // Domain validation
  if (!window.raahi.isAllowedDomain(email)) {
    showFormError('Only @aitr.ac.in and @acropolis.in emails are allowed to register.');
    return;
  }

  if (password.length < 8) {
    showFormError('Password must be at least 8 characters long.');
    return;
  }

  setButtonLoading(true);

  const { data, error } = await window.raahi.signUp({
    email,
    password,
    fullName: `${firstName} ${lastName}`,
    college,
    year
  });

  if (error) {
    setButtonLoading(false);
    showFormError(error.message);
    return;
  }

  // Redirect to verify page
  window.location.href = 'verify-email.html';
}

/* ══════════════════════════════════════════
   FORGOT PASSWORD
══════════════════════════════════════════ */
async function handleForgotPassword(e) {
  e.preventDefault();
  hideFormError();

  const email = document.getElementById('email').value.trim();
  setButtonLoading(true);

  const { error } = await window.raahi.resetPassword(email);

  setButtonLoading(false);

  if (error) {
    showFormError(error.message);
    return;
  }

  // Show success state
  const form = document.getElementById('forgotForm');
  const successDiv = document.getElementById('resetSuccess');
  const emailText = document.getElementById('resetEmailText');

  if (form) form.style.display = 'none';
  if (emailText) emailText.textContent = email;
  if (successDiv) successDiv.classList.remove('hidden');
}

/* ══════════════════════════════════════════
   UI HELPERS (unchanged)
══════════════════════════════════════════ */

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

window.updatePasswordStrength = function(password) {
  const bars = [
    document.getElementById('strengthBar1'),
    document.getElementById('strengthBar2'),
    document.getElementById('strengthBar3')
  ];
  const text = document.getElementById('strengthText');

  if (!bars[0] || !text) return;
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
    text.textContent = 'Strong password ✓';
    text.style.color = 'var(--color-success)';
  }
};

