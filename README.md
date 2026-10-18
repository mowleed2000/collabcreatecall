# Collab Create Marketing (CCM)

> Premium B2B sales platform for **Managed AI Voice Agents**, high-converting digital platforms, and commercial business solutions across the UK.

- **Live Website:** [https://collabcreatemarketing.com](https://collabcreatemarketing.com)
- **Deployment Platform:** GitHub Pages (custom domain via `CNAME`)
- **Key Focus:** Conversational voice AI systems that eliminate missed calls, qualify inbound leads, and sync directly with operational CRMs.

---

## Site Structure & URL Routing

The website uses GitHub Pages clean folder-based URLs with root-level `.html` redirect shims to prevent 404 errors on direct navigation.

### Primary Voice Agent Architecture
- `/` (`index.html`): Main landing page with Voice Opportunity Calculator, 5-pillar capability model, interactive demo simulator, real portfolio proof, and Mo's founder story.
- `/solutions/ai-voice-agents/`: Dedicated sales page detailing agent capabilities, telephony architectures, fail-safe human handoff, outbound campaign rules, and pricing model.
- `/how-it-works/` (`how-it-works.html` shim): The 7-Stage Customer Lifecycle (Discover, Design, Configure, Test, Deploy, Manage, Optimise) and single-accountable-partner comparison.
- `/industries/` (`industries.html` shim): Sector-specific blueprints for Trades, Automotive, Salons/Barbers, Private Healthcare, Hospitality, and Professional Services with JSON data schemas.
- `/demo/voice-agent/` (`demo/index.html` and `demo.html` shims): Interactive voice simulator showroom, sub-600ms latency benchmarks, adapter architecture, and custom prototype request form.
- `/consultation/` (`consultation.html` shim): Dedicated high-converting strategy booking page with `/consultation/success/` confirmation page.

### Wider Commercial Portfolio
- `/solutions/websites-digital/`: High-conversion websites, booking pipelines, and review systems.
- `/free-demo/`: Free custom website prototype request.
- `/premium-website/`: Bespoke digital build service.
- `/business-solutions/`: Comprehensive commercial services (Business Energy, Broadband, Card Payments, Funding, Branded Supplies).
- `/about/`: CCM origin story, Mo's commercial philosophy, and operating principles.
- `/sales-partners/` & `/careers/`: UK sales representative recruitment and partner network.
- `/contact/`: Dual-tabbed inbound pipeline for voice consultations and commercial enquiries.

---

## Technical Stack

- **Architecture:** Pure semantic HTML5, modern CSS3 (custom CSS variables, responsive grid/flexbox, animations), vanilla JavaScript (ES6+).
- **Form Infrastructure:** [Web3Forms](https://web3forms.com) with client-side regex validation, automated hidden inputs, and redirect handling.
- **Interactive Simulator:** Dynamic JS-powered conversational scenario engine (`script.js`) with structured data extraction display and audio visualization.
- **Provider Adapter:** Standardized `window.CCMVoiceDemoAdapter` interface ready for WebRTC/SIP integration (Retell, Vapi, ElevenLabs).

---

## Integration Guide

For full technical details on telephony routing, carrier forwarding codes, CRM webhook payloads, and compliance protocols, see [VOICE_AGENT_INTEGRATION.md](./VOICE_AGENT_INTEGRATION.md).

---

© 2026 Collab Create Marketing. All rights reserved.
