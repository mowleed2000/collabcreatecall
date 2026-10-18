// Mobile Navigation Toggle
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

if (hamburger && navLinks) {
  hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    hamburger.classList.toggle('active');
  });

  // Nested dropdowns on mobile
  navLinks.querySelectorAll('.has-dropdown > a').forEach((link) => {
    link.addEventListener('click', (e) => {
      if (window.innerWidth <= 1024) {
        e.preventDefault();
        link.parentElement.classList.toggle('open');
      }
    });
  });
}

// Scroll Reveals
const reveals = document.querySelectorAll('.reveal');

function revealOnScroll() {
  const windowHeight = window.innerHeight;
  reveals.forEach((reveal) => {
    const revealTop = reveal.getBoundingClientRect().top;
    const revealPoint = 150;
    if (revealTop < windowHeight - revealPoint) {
      reveal.classList.add('active');
    }
  });
}

window.addEventListener('scroll', revealOnScroll);
window.addEventListener('load', revealOnScroll);

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

/* ==========================================================================
   AI VOICE AGENT DEMO SIMULATOR & PROVIDER ADAPTER ARCHITECTURE
   ========================================================================== */

/**
 * Provider Adapter Interface for connecting real-time Voice AI SDKs (Vapi, Retell, ElevenLabs, etc.)
 * When real credentials and SDK are configured, set window.CCMVoiceDemoAdapter.isConnected = true
 * and supply the startCall / endCall hooks.
 */
window.CCMVoiceDemoAdapter = {
  isConnected: false,
  providerName: 'Custom WebRTC / Telephony Gateway',
  environment: 'development',
  config: {
    apiKey: null, // configured via server-side or secure proxy
    assistantId: null
  },
  init: function(options) {
    if (options && options.apiKey) {
      this.config.apiKey = options.apiKey;
      this.config.assistantId = options.assistantId || null;
      this.isConnected = true;
      console.log('[CCM Voice Adapter] Connected to live provider:', options.provider || this.providerName);
    }
  },
  startCall: function(scenarioId, onMessageCallback) {
    if (!this.isConnected) {
      console.info('[CCM Voice Adapter] Live provider not configured. Running verified interactive scenario.');
      return false;
    }
    // Live call initiation logic will run here when SDK script is loaded
    return true;
  }
};

// Interactive Demo Scenarios
const DEMO_SCENARIOS = {
  booking: {
    title: 'After-Hours Appointment Booking',
    industry: 'Salons, Barbers & Clinics',
    audioActive: true,
    transcript: [
      { sender: 'agent', text: "Good evening, thank you for calling The Grooming Lounge. Our team has finished for the day, but I can help you book an appointment or answer questions. How can I help?" },
      { sender: 'caller', text: "Hi, do you have any availability for a haircut and beard trim tomorrow around 4pm?" },
      { sender: 'agent', text: "Let me check our schedule for tomorrow afternoon... We have 3:45pm or 4:30pm open with our senior stylist. Would 4:30pm work well for you?" },
      { sender: 'caller', text: "Yes, 4:30pm is perfect." },
      { sender: 'agent', text: "Great. May I have your full name and the best mobile number to send your instant confirmation text to?" },
      { sender: 'caller', text: "James Wright, 07700 900123." },
      { sender: 'agent', text: "Thank you James. You're pencilled in for a Haircut & Beard Trim tomorrow at 4:30pm. You'll receive an SMS confirmation in a moment with our address. Anything else I can assist with?" }
    ],
    extractedData: {
      "Caller Name": "James Wright",
      "Phone": "07700 900123",
      "Requested Service": "Haircut & Beard Trim",
      "Confirmed Slot": "Tomorrow @ 16:30",
      "Intent": "Appointment Booking",
      "Action Taken": "Reserved in Calendar + SMS Sent",
      "Handoff Required": "No (Handled autonomously)"
    }
  },
  emergency: {
    title: 'Out-of-Hours Service & Urgent Triage',
    industry: 'Home Services, Plumbing & Electrical',
    audioActive: true,
    transcript: [
      { sender: 'agent', text: "Hello, you've reached Premier Plumbing & Heating. If this is an active water leak or heating emergency, I can notify our on-call engineer immediately. What's happening?" },
      { sender: 'caller', text: "Hi, our boiler has just started leaking water from the bottom and the pressure dropped to zero." },
      { sender: 'agent', text: "Understood. Has the water spread near any electrical outlets or fuse boards?" },
      { sender: 'caller', text: "No, it's contained inside the kitchen cupboard for now." },
      { sender: 'agent', text: "Got it. What postcode are you calling from, and who am I speaking with?" },
      { sender: 'caller', text: "SW11 4NR, my name is Sarah Jenkins." },
      { sender: 'agent', text: "Thanks Sarah. I've logged an urgent priority ticket with your details. Our on-call technician Dave is in Battersea and will call this mobile number back within 15 minutes to confirm arrival time." }
    ],
    extractedData: {
      "Caller Name": "Sarah Jenkins",
      "Location Postcode": "SW11 4NR",
      "Issue Category": "Boiler Leak / Emergency",
      "Safety Check": "Contained, no electrical risk",
      "Urgency Level": "High (P1)",
      "Action Taken": "Logged in ServiceM8 + On-Call SMS Alert",
      "Handoff": "Dispatched to on-call engineer"
    }
  },
  pricing: {
    title: 'Routine Pricing & Qualification',
    industry: 'Automotive, MOT & Tyre Services',
    audioActive: true,
    transcript: [
      { sender: 'agent', text: "Thanks for calling Apex Auto Services. How can we help you today?" },
      { sender: 'caller', text: "Hi, how much do you charge for a full service and MOT for a 2021 Volkswagen Golf?" },
      { sender: 'agent', text: "Our combined Full Service & MOT package for that engine size is £189 including parts, synthetic oil, VAT and a complimentary safety inspection. Would you like to check available slots this week?" },
      { sender: 'caller', text: "Yeah, do you have anything on Thursday morning?" },
      { sender: 'agent', text: "We have an 8:30am drop-off slot this Thursday. You can collect the vehicle by 1:00pm. Would you like me to hold that slot?" },
      { sender: 'caller', text: "Yes please, that works great." },
      { sender: 'agent', text: "Perfect. Could I take your vehicle registration number and contact name?" }
    ],
    extractedData: {
      "Vehicle": "2021 VW Golf",
      "Enquiry Type": "MOT & Full Service Pricing",
      "Quoted Rate": "£189 inc. VAT",
      "Preferred Day": "Thursday 08:30 drop-off",
      "Qualification": "Qualified Lead",
      "Action Taken": "Slot Held + Booking Drafted",
      "Handoff Required": "No"
    }
  }
};

function initVoiceDemo() {
  const container = document.getElementById('voiceDemoConsole');
  if (!container) return;

  const pillButtons = container.querySelectorAll('.scenario-pill-btn');
  const transcriptBox = container.querySelector('.transcript-display');
  const dataBox = container.querySelector('.demo-data-extracted');
  const audioBars = container.querySelectorAll('.audio-bar');

  function renderScenario(key) {
    const scenario = DEMO_SCENARIOS[key];
    if (!scenario) return;

    // Render Transcript
    if (transcriptBox) {
      transcriptBox.innerHTML = '';
      scenario.transcript.forEach((msg, idx) => {
        const bubble = document.createElement('div');
        bubble.className = `transcript-message ${msg.sender}`;
        bubble.innerHTML = `
          <div class="transcript-sender">${msg.sender === 'agent' ? 'CCM AI Voice Agent' : 'Caller'}</div>
          <div>${msg.text}</div>
        `;
        bubble.style.opacity = '0';
        bubble.style.transform = 'translateY(8px)';
        bubble.style.transition = 'all 0.3s ease';
        transcriptBox.appendChild(bubble);

        setTimeout(() => {
          bubble.style.opacity = '1';
          bubble.style.transform = 'translateY(0)';
        }, idx * 120);
      });
    }

    // Render Extracted Data
    if (dataBox) {
      let html = `<h5><span>Captured Information</span> <span style="color:#10b981;font-size:0.75rem;">● Synced to CRM</span></h5>`;
      for (const [k, v] of Object.entries(scenario.extractedData)) {
        html += `
          <div class="data-field-row">
            <span class="data-field-label">${k}</span>
            <span class="data-field-value">${v}</span>
          </div>
        `;
      }
      dataBox.innerHTML = html;
    }
  }

  pillButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      pillButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const key = btn.getAttribute('data-scenario');
      renderScenario(key);
    });
  });

  // Initial render
  renderScenario('booking');
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
  initVoiceDemo();
  initOpportunityCalculator();
  initFormPrefills();
});

