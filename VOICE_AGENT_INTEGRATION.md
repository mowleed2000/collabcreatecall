# Collab Create Marketing — AI Voice Agent Technical & Integration Architecture

This guide details the technical implementation, telephony routing, CRM webhook integrations, and provider adapter specification for Collab Create Marketing (CCM) Managed AI Voice Agents.

---

## 1. System Overview

CCM provides an end-to-end managed service for commercial voice automation. The architecture is split into three decoupled tiers:

```
[Inbound PSTN / Mobile Call]
            │
            ▼
[Telephony Tier (Twilio / Retell / SIP Trunk)]
            │
            ▼
[Conversational Intelligence Tier]
  ├── Streaming Speech-to-Text (<150ms Deepgram Nova-2)
  ├── Guardrailed LLM Decision Engine (Claude 3.5 Sonnet / GPT-4o)
  └── Ultra-Low-Latency TTS (<120ms Cartesia Sonic / ElevenLabs)
            │
            ▼
[Business Integration Tier (Webhooks)]
  ├── Calendar & Booking Sync (Google, Fresha, Timely)
  ├── CRM Job Dispatch (ServiceM8, Jobber, Cliniko, HubSpot)
  └── Priority Alert Notifications (Instant SMS / WhatsApp)
```

---

## 2. Telephony Routing & Number Setup

Clients do not need to replace their existing business phone number. CCM supports three standard telephony deployment models:

### A. Conditional Call Forwarding (Recommended)
The business keeps its current number. Forwarding rules are configured on the carrier:
- **Busy Forwarding:** If all team lines are engaged, forward to CCM agent.
- **No-Answer Forwarding:** If not answered within 3 rings (15 seconds), forward to CCM agent.
- **After-Hours Forwarding:** Diverts automatically between 18:00 and 08:30 GMT and weekends.

**Carrier Forwarding Codes (UK):**
- Divert if unanswered: `*61*<CCM_FORWARDING_NUMBER>#`
- Divert if busy: `*67*<CCM_FORWARDING_NUMBER>#`
- Cancel all diverts: `##002#`

### B. Dedicated Inbound Number
CCM provisions a dedicated UK local (020, 0161, 0121, etc.) or national (0330 / 0800) number routed directly to the voice engine. Used for targeted PPC campaigns, direct response ads, and out-of-hours emergencies.

### C. Direct SIP Trunking
For businesses with existing PBX systems (3CX, RingCentral, 8x8, Asterisk), CCM establishes a secure SIP trunk with TLS/SRTP encryption.

---

## 3. WebRTC Provider Adapter Specification

The frontend demo showroom (`demo/voice-agent/`) implements a standardized interface: `window.CCMVoiceDemoAdapter`.

To attach a live voice provider (e.g. Vapi, Retell, ElevenLabs) to the web interface without altering page layout:

```javascript
window.CCMVoiceDemoAdapter = {
  provider: 'retell', // 'retell' | 'vapi' | 'elevenlabs' | 'bland'
  status: 'idle', // 'idle' | 'connecting' | 'connected' | 'error'

  /**
   * Initialize microphone and start real-time session
   * @param {string} agentId - Pre-configured agent identifier
   * @param {object} options - Audio constraints and user context
   */
  startCall: async (agentId, options = {}) => {
    try {
      this.status = 'connecting';
      // 1. Obtain ephemeral WebRTC token from secure backend
      const res = await fetch('/api/voice/session-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId, context: options.context })
      });
      const { accessToken } = await res.json();

      // 2. Initialize provider SDK
      // Example for Retell Web Client:
      // const client = new RetellWebClient();
      // await client.startCall({ accessToken });

      this.status = 'connected';
      return { success: true };
    } catch (err) {
      this.status = 'error';
      console.error('Call initialization failed', err);
      throw err;
    }
  },

  /**
   * Terminate active call and trigger post-call analysis
   */
  endCall: async () => {
    this.status = 'idle';
    // client.stopCall();
  }
};
```

---

## 4. CRM & Calendar Webhook Schemas

At the conclusion of each call, the conversational intelligence engine emits a structured JSON webhook payload to the configured CRM endpoint.

### Standard CRM Dispatch Payload
```json
{
  "event": "call.completed",
  "call_id": "call_uk_9041283109",
  "timestamp": "2026-10-18T14:32:00Z",
  "caller": {
    "phone": "+447911234567",
    "name": "Sarah Jenkins",
    "postcode": "SW11 4NR"
  },
  "qualification": {
    "industry": "trades",
    "urgency": "EMERGENCY_P1",
    "service_category": "Boiler Leak / Heating Outage",
    "property_status": "Owner-Occupied",
    "notes": "Water leaking from boiler base. Stopcock isolated. No electrical hazard."
  },
  "actions_taken": [
    {
      "type": "booking_drafted",
      "target_system": "ServiceM8",
      "slot": "2026-10-18T16:00:00Z"
    },
    {
      "type": "sms_dispatch",
      "recipient": "On-Call Engineer Dave (+447700900999)",
      "status": "SENT"
    }
  ],
  "audio_recording_url": "https://secure-vault.collabcreatemarketing.com/recordings/call_uk_9041283109.mp3",
  "transcript": [
    {"speaker": "agent", "text": "Hello, Premier Plumbing & Heating..."},
    {"speaker": "caller", "text": "Hi, our boiler has just started leaking..."}
  ]
}
```

---

## 5. Web3Forms Lead Capture Configuration

All website forms on `collabcreatemarketing.com` utilize Web3Forms with native postbacks and client-side validation:

| Form ID / Location | Web3Forms Access Key | Subject | Redirect Target |
|---|---|---|---|
| **Form 1: Homepage & Contact** | `5bba1f84-9bcb-4985-857f-299ad8315b75` | `New AI Voice Consultation Booking — CCM` | `/contact/success/` |
| **Form 2: Demo Hub (`demo/voice-agent/`)** | `5bba1f84-9bcb-4985-857f-299ad8315b75` | `New CCM Custom Voice Prototype Request` | `/contact/success/` |
| **Dedicated Consultation (`/consultation/`)** | `5bba1f84-9bcb-4985-857f-299ad8315b75` | `Dedicated AI Voice Strategy Booking — CCM` | `/consultation/success/` |
| **General Enquiries (`/contact/` Tab 2)** | `5bba1f84-9bcb-4985-857f-299ad8315b75` | `New Commercial Solution Enquiry — CCM` | `/contact/success/` |

---

## 6. Compliance, GDPR & Quality Assurance

1. **Explicit Identification:** By default, every agent greets callers with a clear operational disclaimer: *"Hello, you've reached [Business Name]'s automated booking assistant..."*
2. **PCI-DSS Compliance:** Voice agents are strictly restricted from transcribing 16-digit credit card PANs over audio. If a payment is required (e.g. salon deposit or call-out fee), the agent triggers an automated, secure Stripe/SumUp SMS payment link to the caller's mobile.
3. **Weekly Auditing Lifecycle:** CCM engineers review a sampled cohort of weekly call transcripts to refine vocabulary, update seasonal pricing, and calibrate emergency triage rules.
