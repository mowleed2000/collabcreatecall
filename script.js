// Mobile Navigation Toggle
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

if (hamburger && navLinks) {
  const setMenu = (open) => {
    navLinks.classList.toggle('active', open);
    hamburger.classList.toggle('active', open);
    hamburger.setAttribute('aria-expanded', String(open));
    hamburger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  };
  hamburger.addEventListener('click', () => setMenu(hamburger.getAttribute('aria-expanded') !== 'true'));
  navLinks.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') setMenu(false); });
}

// Show the mobile demo CTA after the visitor has passed the hero.
const mobileCta = document.querySelector('.sticky-mobile-cta-bar');
if (mobileCta) {
  const updateMobileCta = () => mobileCta.classList.toggle('is-visible', window.scrollY > window.innerHeight);
  updateMobileCta();
  window.addEventListener('scroll', updateMobileCta, { passive: true });
}

// Navbar state on scroll
const navbar = document.querySelector('.navbar');
if (navbar) {
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });
}

// Shared form helpers — validate client-side, then native POST to Web3Forms
// (native navigation avoids CORS issues that affect fetch() on some origins)
function setFieldError(input, message) {
  input.classList.add('error');
  const err = input.parentElement.querySelector('.field-error');
  if (err) {
    err.textContent = message;
    err.classList.add('show');
  }
}

function clearFieldError(input) {
  input.classList.remove('error');
  const err = input.parentElement.querySelector('.field-error');
  if (err) {
    err.textContent = '';
    err.classList.remove('show');
  }
}

function validateEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function validatePhone(value) {
  return /^[\d\s+\-()]{7,}$/.test(value.trim());
}

function ensureAbsoluteRedirect(form) {
  const relative = form.getAttribute('data-redirect');
  if (!relative) return;
  let redirectInput = form.querySelector('input[name="redirect"]');
  if (!redirectInput) {
    redirectInput = document.createElement('input');
    redirectInput.type = 'hidden';
    redirectInput.name = 'redirect';
    form.appendChild(redirectInput);
  }
  try {
    redirectInput.value = new URL(relative, window.location.href).href;
  } catch (e) {
    redirectInput.value = relative;
  }
}

document.querySelectorAll('form[data-ccm-form]').forEach((form) => {
  // Ensure Web3Forms action is set for native submit
  form.setAttribute('action', 'https://api.web3forms.com/submit');
  form.setAttribute('method', 'POST');
  form.setAttribute('novalidate', '');

  const statusEl = form.querySelector('.form-status');
  const submitBtn = form.querySelector('[type="submit"]');

  form.querySelectorAll('input, select, textarea').forEach((field) => {
    field.addEventListener('input', () => clearFieldError(field));
    field.addEventListener('change', () => clearFieldError(field));
  });

  form.addEventListener('submit', (e) => {
    if (statusEl) {
      statusEl.className = 'form-status';
      statusEl.textContent = '';
    }

    let valid = true;
    const requiredFields = form.querySelectorAll('[required]');
    requiredFields.forEach((field) => {
      clearFieldError(field);
      if (field.type === 'checkbox') {
        if (!field.checked) {
          valid = false;
          field.classList.add('error');
          const group = field.closest('.checkbox-group');
          if (group) {
            let err = group.nextElementSibling;
            if (!err || !err.classList.contains('field-error')) {
              err = document.createElement('div');
              err.className = 'field-error checkbox-error';
              group.insertAdjacentElement('afterend', err);
            }
            err.textContent = 'This confirmation is required.';
            err.classList.add('show');
          }
        }
        return;
      }
      if (!String(field.value || '').trim()) {
        valid = false;
        setFieldError(field, 'This field is required.');
        return;
      }
      if (field.type === 'email' && !validateEmail(field.value.trim())) {
        valid = false;
        setFieldError(field, 'Enter a valid email address.');
      }
      if ((field.type === 'tel' || field.name === 'phone' || field.name === 'telephone') && !validatePhone(field.value)) {
        valid = false;
        setFieldError(field, 'Enter a valid telephone number.');
      }
    });

    if (!valid) {
      e.preventDefault();
      if (statusEl) {
        statusEl.className = 'form-status error';
        statusEl.textContent = 'Please correct the highlighted fields and try again.';
        statusEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      const firstError = form.querySelector('.error');
      if (firstError) firstError.focus({ preventScroll: true });
      return;
    }

    // Valid — prepare absolute redirect and allow native POST to Web3Forms
    ensureAbsoluteRedirect(form);
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Submitting…';
    }
  });
});

// Lightbox (homepage portfolio)
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
if (lightbox && lightboxImg) {
  document.querySelectorAll('.lightbox-trigger').forEach((trigger) => {
    trigger.addEventListener('click', () => {
      lightboxImg.src = trigger.getAttribute('data-full');
      lightbox.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  });
  lightbox.addEventListener('click', () => {
    lightbox.classList.remove('active');
    document.body.style.overflow = 'auto';
  });
}

// Missed Opportunity Calculator Logic
function initOpportunityCalculator() {
  const calc = document.getElementById('missedOppCalc');
  if (!calc) return;

  const callsSlider = calc.querySelector('#calcCalls');
  const missedSlider = calc.querySelector('#calcMissedRate');
  const oppSlider = calc.querySelector('#calcOppRate');
  const valueSlider = calc.querySelector('#calcValue');

  const callsDisp = calc.querySelector('#callsValDisplay');
  const missedDisp = calc.querySelector('#missedValDisplay');
  const oppDisp = calc.querySelector('#oppValDisplay');
  const valueDisp = calc.querySelector('#valueValDisplay');

  const resultMonthly = calc.querySelector('#calcResultMonthly');
  const resultAnnual = calc.querySelector('#calcResultAnnual');

  function calculate() {
    const dailyCalls = parseFloat(callsSlider ? callsSlider.value : 25);
    const missedPct = parseFloat(missedSlider ? missedSlider.value : 20) / 100;
    const oppPct = parseFloat(oppSlider ? oppSlider.value : 30) / 100;
    const avgValue = parseFloat(valueSlider ? valueSlider.value : 150);

    if (callsDisp) callsDisp.textContent = dailyCalls + ' calls/day';
    if (missedDisp) missedDisp.textContent = (missedPct * 100).toFixed(0) + '%';
    if (oppDisp) oppDisp.textContent = (oppPct * 100).toFixed(0) + '%';
    if (valueDisp) valueDisp.textContent = '£' + avgValue.toFixed(0);

    // 22 working business days per month
    const missedCallsPerDay = dailyCalls * missedPct;
    const lostDealsPerDay = missedCallsPerDay * oppPct;
    const monthlyLost = Math.round(lostDealsPerDay * avgValue * 22);
    const annualLost = Math.round(monthlyLost * 12);

    if (resultMonthly) {
      resultMonthly.textContent = '£' + monthlyLost.toLocaleString('en-GB');
    }
    if (resultAnnual) {
      resultAnnual.textContent = '£' + annualLost.toLocaleString('en-GB');
    }
  }

  [callsSlider, missedSlider, oppSlider, valueSlider].forEach(slider => {
    if (slider) {
      slider.addEventListener('input', calculate);
    }
  });

  calculate();
}

// Pre-populate forms based on URL query parameters or industry triggers
function initFormPrefills() {
  const params = new URLSearchParams(window.location.search);
  const industryParam = params.get('industry');
  const reqParam = params.get('requirement') || params.get('interest');

  if (industryParam) {
    const industrySelect = document.querySelector('select[name="industry"]');
    if (industrySelect) {
      industrySelect.value = industryParam;
    }
  }

  if (reqParam) {
    const reqSelect = document.querySelector('select[name="requirement"]') || document.querySelector('select[name="enquiry_category"]');
    if (reqSelect) {
      reqSelect.value = reqParam;
    }
  }

  // Pre-fill on click of industry action buttons
  document.querySelectorAll('[data-set-industry]').forEach(el => {
    el.addEventListener('click', (e) => {
      const ind = el.getAttribute('data-set-industry');
      const targetSelect = document.querySelector('select[name="industry"]');
      if (targetSelect && ind) {
        targetSelect.value = ind;
      }
    });
  });
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  initOpportunityCalculator();
  initFormPrefills();
});

