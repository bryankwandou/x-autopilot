# X-Autopilot: The Autonomous Attention Engine

> *"In the modern era, attention is the only currency that matters. To capture it requires speed, precision, and relentless iteration. This system delivers exactly that."* 

X-Autopilot is a fully autonomous, production-ready, zero-human-in-the-loop AI system engineered to operate a high-growth X (Twitter) account. Built upon rigorous logic, real-time market signals, and robust self-healing architectures, it is designed to maximize engagement, follower conversion, and narrative impact.

---

## Abstract

We are transitioning from the Information Age to the Attention Age. On platforms like X, timing and insight are significantly more valuable than generic volume or polished marketing. 

This project solves the problem of human latency and emotional fatigue in social media growth. By continuously monitoring the zeitgeist (specifically within the AI and technology sectors), scoring events mathematically, generating synthesized insights, and executing tactical strikes within 90-second windows, X-Autopilot achieves what a human team cannot: persistent, scalable, and mathematically optimal engagement.

## System Architecture

The core philosophy of X-Autopilot is modularity, strict typing, and deterministic execution. There are no stochastic guesses in the control flow; even the LLM outputs are rigorously constrained and validated.

### 1. The Hype Detection Module
The system continuously monitors X trends, search queries, and competitor streams using a headless Chromium instance (via Playwright). Every detected narrative is normalized into an `Event` object, capturing baseline metrics such as organic velocity (interactions per minute), estimated lifespan, and emotional charge.

### 2. The Deterministic Scoring Engine
Not all news matters. The Scoring Engine evaluates every event against a strict formula:
`SCORE = (0.5 * Velocity) + (0.2 * Emotional_Charge) + (0.2 * Controversy) + (0.1 * Source_Credibility)`
Only the top 5% of events (scoring 70 or above) survive this filter. 

### 3. The Angle Generation Engine
Instead of merely summarizing news, the Angle Generator uses advanced Language Models (like GPT-4o) to synthesize three distinct vectors for any given event:
- **Provocative:** A contrarian take challenging conventional wisdom.
- **Insightful:** A deep, second-order analysis of the event.
- **Controversial (Safe):** A polarizing perspective designed to draw engagement without violating platform policies.
The system mathematically predicts the engagement index of each angle and forwards the highest-scoring vector.

### 4. The Content Factory & Visual Logic
Payload payloads are crafted under severe constraints: maximum 280 characters, zero generic hashtags, no corporate jargon, and an immediate hook. Furthermore, if a topic breaches the 90-point hype threshold, the system autonomously triggers the Image API to generate high-contrast, minimalist, cyberpunk-aesthetic visual artifacts to accompany the text.

### 5. Reply Swarm Engine
The primary vector for growth on X is high-velocity replies. The Reply Swarm targets high-potential posts and executes a sub-90-second response. To evade pattern detection and algorithmic suppression, the engine rotates between distinct behavioral strategies (adding value, respectful disagreement, or future prediction) and enforces a strict 12-hour cooldown per target user.

### 6. The Execution Controller
To prevent automated shadowbans, the system does not use standard REST APIs that flag accounts as bots. Instead, it utilizes an auth-injected Playwright browser. It simulates organic human behavior: unpredictable wait times, randomized scrolling, mouse wheel movements, and keystroke emulation with a modeled 2% typo-and-backspace variance. It sleeps during target-timezone nights.

### 7. Risk Mitigation & Self-Improvement
X-Autopilot is designed to survive in a hostile algorithmic environment.
- **Levenshtein Distance Checking:** It calculates string similarity against its own recent outputs to absolutely prevent repetitive spam bans.
- **Circuit Breakers:** If impressions drop below a minimum threshold consistently, the system diagnoses a potential shadowban and falls back to a 24-hour "Safe Mode," restricting all outbound posts and engaging purely in organic scrolling simulation.
- **Evolutionary Thresholds:** Every night, the Performance Analyzer parses real-time metrics. Winning hooks are amplified; dead formats are appended to a persistent denylist. The system dynamically adjusts its internal `min_hype_score` to demand higher quality signals if overall engagement falls.

---

## Deployment & Operation

The system is configured via decoupled JSON/YAML environments and is structurally designed for Node.js using TypeScript. 

### Prerequisites
- Node.js (v18+)
- Playwright Chromium base
- Valid X Auth Cookies (`auth_token` and `ct0`)
- OpenAI API Key

### Initialization
```bash
npm install
npm run build
npm start
```

*The system will initialize its Chromium context, load the configuration state, and enter the infinite autonomous loop.*

---

## Ethical and Operational Statement

X-Autopilot is a raw engine of momentum. It operates flawlessly according to the parameters set by the deployer. It is deeply committed to programmatic safety, implementing rigorous string sanitization and logic-based circuit breakers to prevent policy violations. 

Build the future. Automate the present.
