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

/* ==========================================================================
   GROK / xAI REALTIME VOICE DEMO
   Requires a token endpoint that returns { value: "..." } from
   POST https://api.x.ai/v1/realtime/client_secrets (never expose XAI_API_KEY).
   Configure with: window.CCM_XAI_TOKEN_URL = 'https://your-worker.example/session'
   ========================================================================== */

window.CCM_XAI_CONFIG = window.CCM_XAI_CONFIG || {
  model: 'grok-voice-latest',
  voice: 'eve',
  instructions:
    'You are the Collab Create Marketing (CCM) AI voice agent demo for UK businesses. ' +
    'Speak in clear, professional British English. Keep answers concise (2-4 sentences). ' +
    'Explain how managed AI voice agents answer missed calls, book appointments, triage emergencies, ' +
    'and sync details to CRM. If asked to book a consultation, invite them to use the Book Consultation form on this website. ' +
    'Never invent pricing; say CCM scopes pricing on a consultation. Be helpful, confident, and commercially focused.'
};

window.CCMVoiceDemoAdapter = Object.assign(window.CCMVoiceDemoAdapter, {
  providerName: 'xAI Grok Voice',
  provider: 'grok'
});

function floatTo16BitPCM(float32Array) {
  const buffer = new ArrayBuffer(float32Array.length * 2);
  const view = new DataView(buffer);
  for (let i = 0; i < float32Array.length; i++) {
    const s = Math.max(-1, Math.min(1, float32Array[i]));
    view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  return buffer;
}

function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

function base64ToArrayBuffer(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

async function fetchGrokEphemeralToken() {
  const tokenUrl =
    window.CCM_XAI_TOKEN_URL ||
    (window.CCM_XAI_CONFIG && window.CCM_XAI_CONFIG.tokenUrl) ||
    '';

  if (!tokenUrl) {
    const err = new Error('TOKEN_URL_MISSING');
    err.code = 'TOKEN_URL_MISSING';
    throw err;
  }

  const res = await fetch(tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ expires_after: { seconds: 300 } })
  });

  if (!res.ok) {
    throw new Error('Token endpoint returned ' + res.status);
  }

  const data = await res.json();
  const token = data.value || data.client_secret || data.token;
  if (!token) throw new Error('Token response missing value');
  return token;
}

function initGrokVoiceDemo() {
  const roots = document.querySelectorAll('#grokVoiceDemo, #live-grok-demo, [data-grok-demo]');
  if (!roots.length) return;

  roots.forEach((root) => {
    const startBtn = root.querySelector('[data-grok-start]');
    const endBtn = root.querySelector('[data-grok-end]');
    const statusEl = root.querySelector('[data-grok-status]');
    const transcriptEl = root.querySelector('[data-grok-transcript]');
    const setupNote = root.querySelector('[data-grok-setup-note]');

    let ws = null;
    let mediaStream = null;
    let audioContext = null;
    let processor = null;
    const playbackQueue = [];
    let isPlaying = false;
    let sessionActive = false;

    function setStatus(state, label) {
      if (!statusEl) return;
      statusEl.dataset.state = state;
      statusEl.textContent = label;
    }

    function appendTranscript(role, text) {
      if (!transcriptEl || !text) return;
      if (transcriptEl.querySelector('p[data-placeholder]')) {
        transcriptEl.innerHTML = '';
      }
      const emptyHint = transcriptEl.querySelector('p');
      if (emptyHint && emptyHint.textContent.indexOf('will appear here') !== -1) {
        transcriptEl.innerHTML = '';
      }
      const row = document.createElement('div');
      row.className = 'transcript-message ' + (role === 'user' ? 'caller' : 'agent');
      row.innerHTML =
        '<div class="transcript-sender">' +
        (role === 'user' ? 'You' : 'Grok Voice Agent') +
        '</div><div></div>';
      row.querySelector('div:last-child').textContent = text;
      transcriptEl.appendChild(row);
      transcriptEl.scrollTop = transcriptEl.scrollHeight;
    }

    async function playPcmChunk(base64Audio) {
      if (!audioContext) return;
      const pcm = base64ToArrayBuffer(base64Audio);
      const int16 = new Int16Array(pcm);
      const float32 = new Float32Array(int16.length);
      for (let i = 0; i < int16.length; i++) float32[i] = int16[i] / 0x8000;
      const buffer = audioContext.createBuffer(1, float32.length, 24000);
      buffer.copyToChannel(float32, 0);
      playbackQueue.push(buffer);
      if (!isPlaying) drainPlaybackQueue();
    }

    function drainPlaybackQueue() {
      if (!audioContext || !playbackQueue.length) {
        isPlaying = false;
        if (sessionActive) setStatus('listening', 'Listening…');
        return;
      }
      isPlaying = true;
      setStatus('speaking', 'Agent speaking…');
      const buffer = playbackQueue.shift();
      const source = audioContext.createBufferSource();
      source.buffer = buffer;
      source.connect(audioContext.destination);
      source.onended = () => drainPlaybackQueue();
      source.start();
    }

    async function startSession() {
      try {
        setStatus('connecting', 'Connecting…');
        if (setupNote) setupNote.hidden = true;

        const token = await fetchGrokEphemeralToken();
        mediaStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            channelCount: 1
          }
        });

        audioContext = new (window.AudioContext || window.webkitAudioContext)({
          sampleRate: 24000
        });

        const model = (window.CCM_XAI_CONFIG && window.CCM_XAI_CONFIG.model) || 'grok-voice-latest';
        const wsUrl = 'wss://api.x.ai/v1/realtime?model=' + encodeURIComponent(model);
        ws = new WebSocket(wsUrl, ['xai-client-secret.' + token]);

        ws.binaryType = 'arraybuffer';

        ws.onopen = () => {
          sessionActive = true;
          window.CCMVoiceDemoAdapter.isConnected = true;
          window.CCMVoiceDemoAdapter.status = 'connected';
          setStatus('connected', 'Connected');
          if (startBtn) startBtn.hidden = true;
          if (endBtn) endBtn.hidden = false;

          const cfg = window.CCM_XAI_CONFIG || {};
          ws.send(
            JSON.stringify({
              type: 'session.update',
              session: {
                voice: cfg.voice || 'eve',
                instructions: cfg.instructions,
                turn_detection: { type: 'server_vad' },
                audio: {
                  input: { format: { type: 'audio/pcm', rate: 24000 } },
                  output: { format: { type: 'audio/pcm', rate: 24000 } }
                }
              }
            })
          );

          // Warm greeting so visitors hear the agent immediately
          ws.send(
            JSON.stringify({
              type: 'conversation.item.create',
              item: {
                type: 'message',
                role: 'user',
                content: [
                  {
                    type: 'input_text',
                    text: 'Hello — please briefly introduce yourself as the CCM managed AI voice agent demo and ask how you can help.'
                  }
                ]
              }
            })
          );
          ws.send(JSON.stringify({ type: 'response.create' }));

          const source = audioContext.createMediaStreamSource(mediaStream);
          processor = audioContext.createScriptProcessor(4096, 1, 1);
          // Keep the processor graph alive without echoing the mic to speakers
          const mute = audioContext.createGain();
          mute.gain.value = 0;
          processor.onaudioprocess = (e) => {
            if (!ws || ws.readyState !== WebSocket.OPEN) return;
            const input = e.inputBuffer.getChannelData(0);
            const pcm = floatTo16BitPCM(input);
            ws.send(
              JSON.stringify({
                type: 'input_audio_buffer.append',
                audio: arrayBufferToBase64(pcm)
              })
            );
          };
          source.connect(processor);
          processor.connect(mute);
          mute.connect(audioContext.destination);
          setStatus('listening', 'Listening…');
        };

        ws.onmessage = async (event) => {
          if (typeof event.data !== 'string') return;
          let msg;
          try {
            msg = JSON.parse(event.data);
          } catch (e) {
            return;
          }

          switch (msg.type) {
            case 'response.output_audio.delta':
            case 'response.audio.delta':
              if (msg.delta) await playPcmChunk(msg.delta);
              break;
            case 'response.output_audio_transcript.done':
            case 'response.audio_transcript.done':
              if (msg.transcript) appendTranscript('assistant', msg.transcript);
              break;
            case 'conversation.item.input_audio_transcription.completed':
              if (msg.transcript) appendTranscript('user', msg.transcript);
              break;
            case 'input_audio_buffer.speech_started':
              setStatus('listening', 'Hearing you…');
              break;
            case 'response.done':
              if (sessionActive) setStatus('listening', 'Listening…');
              break;
            case 'error':
              console.error('[Grok Voice]', msg);
              setStatus('error', 'Error');
              if (setupNote) {
                setupNote.hidden = false;
                setupNote.textContent =
                  (msg.error && msg.error.message) ||
                  'Voice session error. Check your xAI credits and token worker.';
              }
              break;
            default:
              break;
          }
        };

        ws.onerror = () => {
          setStatus('error', 'Connection error');
        };

        ws.onclose = () => {
          cleanupSession(false);
        };
      } catch (err) {
        console.error('[Grok Voice] start failed', err);
        if (err.code === 'TOKEN_URL_MISSING' || (err.message && err.message.indexOf('TOKEN_URL') !== -1)) {
          setStatus('error', 'Setup required');
          if (setupNote) setupNote.hidden = false;
        } else if (err.name === 'NotAllowedError') {
          setStatus('error', 'Mic blocked');
          if (setupNote) {
            setupNote.hidden = false;
            setupNote.textContent = 'Microphone permission is required for the live Grok voice demo.';
          }
        } else {
          setStatus('error', 'Unavailable');
          if (setupNote) {
            setupNote.hidden = false;
            setupNote.textContent =
              'Could not start the live demo (' +
              (err.message || 'unknown error') +
              '). Deploy the token worker with your xAI API key — see VOICE_AGENT_INTEGRATION.md.';
          }
        }
        cleanupSession(false);
      }
    }

    function cleanupSession(updateButtons) {
      sessionActive = false;
      window.CCMVoiceDemoAdapter.isConnected = false;
      window.CCMVoiceDemoAdapter.status = 'idle';

      if (processor) {
        try {
          processor.disconnect();
        } catch (e) {}
        processor = null;
      }
      if (mediaStream) {
        mediaStream.getTracks().forEach((t) => t.stop());
        mediaStream = null;
      }
      if (audioContext) {
        audioContext.close().catch(() => {});
        audioContext = null;
      }
      if (ws) {
        try {
          if (ws.readyState === WebSocket.OPEN) ws.close();
        } catch (e) {}
        ws = null;
      }
      playbackQueue.length = 0;
      isPlaying = false;

      if (updateButtons !== false) {
        if (startBtn) startBtn.hidden = false;
        if (endBtn) endBtn.hidden = true;
        setStatus('idle', 'Ready');
      } else {
        if (startBtn) startBtn.hidden = false;
        if (endBtn) endBtn.hidden = true;
        if (statusEl && statusEl.dataset.state !== 'error') {
          setStatus('idle', 'Ready');
        }
      }
    }

    function endSession() {
      cleanupSession(true);
    }

    if (startBtn) startBtn.addEventListener('click', startSession);
    if (endBtn) endBtn.addEventListener('click', endSession);

    // Only surface the technical setup note on the demo hub (operators configuring Grok).
    // Homepage visitors see it only after a failed Start attempt.
    const hasTokenUrl = !!(window.CCM_XAI_TOKEN_URL || (window.CCM_XAI_CONFIG && window.CCM_XAI_CONFIG.tokenUrl));
    const isDemoHub = !!root.closest('#live-grok-demo') || root.id === 'live-grok-demo';
    if (!hasTokenUrl && setupNote && isDemoHub) {
      setupNote.hidden = false;
    }
  });
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  initVoiceDemo();
  initOpportunityCalculator();
  initFormPrefills();
  initGrokVoiceDemo();
});

