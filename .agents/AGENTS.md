# Project Agent Guidelines: The InstaDNA

## ⚖️ Decision Hierarchy
When making implementation decisions or resolving engineering trade-offs, follow this strict priority:
1. **Security & Data Isolation**
2. **Correctness & Contract Integrity**
3. **Existing Architecture & Conventions**
4. **User Experience (UX) & Design Quality**
5. **Performance & Resource Efficiency**
6. **Developer Convenience**

---

## 💡 Core Engineering Principles

### 🎯 Simplicity First
- **Minimal Abstraction**: Prefer the simplest solution that satisfies the requirement.
- **Justified Complexity**: Avoid introducing unnecessary abstractions, third-party dependencies, or architectural complexity until there is a demonstrated need.

---

## 🛡️ Web App Safeguarding Rules (DOs & DONTs)

### 🔑 1. Security & Tenant Isolation
* **DOs**:
  * **Store Secrets in Env Only**: Keep all API keys, webhook secrets, and credentials strictly in environment variables (`.env`).
  * **Enforce Row-Level Isolation**: Ensure **every** database query on protected routes checks `WHERE userId = ?` using authenticated session tokens.
  * **Validate Incoming Payloads**: Use Zod validation schemas on every POST/PUT route before executing database queries or external API calls.
* **DONTs**:
  * ❌ **NEVER** commit `.env` files, raw OAuth secret JSONs, or temporary token files to Git.
  * ❌ **NEVER** expose administrative endpoints or raw database inspection routes without authentication checks.

### 🗄️ 2. Data & Asset Management
* **DOs**:
  * **Store Assets on Managed Object Storage**: Process user uploads and AI generations through image optimization pipelines (e.g. `sharp` to `.webp`) before uploading to cloud object storage.
  * **Maintain Subfolder Boundaries**: Keep object storage key spaces isolated by mode (`personas/{storageKey}/insta-dna/` vs `personas/{storageKey}/dresse/` vs `personas/{storageKey}/video/`).
  * **Use Active DB Path**: Direct all local database connections strictly to the active database file location defined in configuration.
* **DONTs**:
  * ❌ **NEVER** store raw high-resolution Base64 image strings directly inside database table columns.
  * ❌ **NEVER** execute destructive database queries (`DROP TABLE`, `DELETE FROM`) without prior user confirmation and database backups.
  * ❌ **NEVER** leave stale test database files sitting in root directories.

### 🏗️ 3. Code Quality & Architecture Boundaries
* **DOs**:
  * **Modular Component Design**: Break down large features into smaller, single-responsibility React components and custom hooks.
  * **Separate Concerns**: Keep business logic in services, hooks, or backend modules; components should primarily render UI and orchestrate interactions.
  * **Isolate Gateway Adapters**: Keep payment gateway, authentication, and AI provider integrations isolated behind service adapters.
  * **Maintain Codebase Maps**: Keep tech stack, architecture, and structural documentation accurate in `.planning/codebase/`.
  * **Keep CHANGELOG Updated**: Update `CHANGELOG.md` under `[Unreleased]` for every session modification before committing.
* **DONTs**:
  * ❌ **NEVER** allow excessively large source files. Prefer extracting reusable components, hooks, services, or utilities before files become difficult to understand or maintain.
  * ❌ **NEVER** mix networking, raw database queries, and complex rendering logic in a single file.
  * ❌ **NEVER** duplicate static assets (favicons, logos) or preset dictionaries across root, server, and client folders.
  * ❌ **NEVER** auto-push (`git push`) to GitHub without explicit user approval.

### 🧪 4. Testing & Verification
* **DOs**:
  * **Verify Builds**: Run `npm run build` inside `client/` after structural UI changes to guarantee zero TypeScript or bundler errors.
  * **Standardized Error Formatting**: Use standardized error helper functions on backend route failures to maintain clean API responses.
* **DONTs**:
  * ❌ **NEVER** declare a task completed without verified runtime execution or clean build logs.
  * ❌ **NEVER** suppress API errors silently or return fallback empty buffers without logging the upstream failure.

---

## 🏛️ System Architecture & Engineering Standards

### 🔄 1. API Compatibility & Evolution
* **Non-Breaking API Changes**: Never modify existing API request or response schemas without verifying all consuming frontend modules.
* **Additive Enhancements**: Prefer additive parameter changes over destructive replacements. Keep existing fields functional when extending endpoints.

### 🗄️ 2. Database Migration Safety
* **Backward Compatibility**: Database schema updates must be backward-compatible whenever possible.
* **Additive Migrations**: Prefer additive `ALTER TABLE` operations over destructive schema drops. Never remove production columns without an explicit migration plan.

### 🚩 3. Feature Flags & Experimental Paths
* **Scoped Execution**: Hide experimental or unreleased features behind feature flags.
* **Preserve Production Code**: Do not remove existing production code paths until new feature replacements are fully verified.

### ⚡ 4. Performance & Resource Efficiency
* **Re-render Prevention**: Avoid unnecessary React re-renders; memoize expensive derived computations.
* **Lazy Loading**: Lazy-load heavy modal dialogs, admin modules, and rich media assets.
* **Single-Source Data Fetching**: Prevent duplicate API calls (e.g. duplicate stats fetching) across sibling components.

### 🔒 5. Operational Logging & Security
* **Operational Visibility**: Log meaningful server events and diagnostic tracebacks.
* **Zero Secret Leakage**: NEVER log raw secrets, access tokens, passwords, API keys, or PII. Keep user-facing errors concise while logging full technical details server-side.

### 🤖 6. Prompt Engineering Governance
* **Centralized Prompt Templates**: Store reusable prompt building blocks centrally rather than scattering string literals across routes.
* **Structured Prompts**: Clearly demarcate system instructions, user context, and dynamic inputs.
* **Gold-Standard Double-Newline Section Layout**: Compiled MiniMax H3 prompts MUST use clean double-newline (`\n\n`) block separation between `integrated_multimodal_description:`, shot paragraphs (`[Shot 1]`, `[Shot 2]`), `dialogue:`, `overall_soundscape:`, and `non_diegetic_music:`. NEVER concatenate shot blocks onto a single continuous line.
* **Dedicated Spoken Dialogue Section**: Whenever spoken dialogue is present, `PromptCompiler.ts` MUST compile BOTH inline `<d>[Language] Text</d>` tags inside the shot paragraph AND a dedicated `dialogue:` section with per-shot speaker IDs and delivery tones (`S1 (soft, reflective): "..."`).
* **Zero Template Stuttering & Live-Action Default**: `PromptCompiler.ts` MUST run `sanitizeShotProse()` to eliminate template fragment stuttering (`standing in Starting...`, `as depicted in <Picture 1>...`, duplicate camera zoom sentences). `AIDirectorPanel` MUST default to `Live-Action Realism` for human keyframe reference photos.

### 🍌 7. Vertex AI & Nano Banana Model Governance
* **Primary High-Speed Models**: For Vertex AI Express calls, prioritize `gemini-3.5-flash` and `gemini-2.5-flash` over `gemini-2.5-pro` to prevent 429 rate limits.
* **Instant 429 Escalation**: Upon encountering an HTTP 429 response, immediately break location retry loops to escalate to the next high-capacity model tier.
* **Nano Banana Family**: Recognize `gemini-3.1-flash-image` (Nano Banana 2) as the default workhorse image generation model for keyframes.
* **Image Payload Spec**: For Gemini image generation via `:generateContent`, use `generationConfig: { responseModalities: ["TEXT", "IMAGE"] }`. Do NOT pass `responseMimeType: "image/png"`.
* **Multimodal Image Pipeline**: When a reference image is present, pass `inlineData` to Gemini 3.5 Flash / 2.5 Pro first to extract visual identity features into an expanded 4K prompt before sending to Nano Banana.
* **Strict Model Family Scope**: Adhere strictly to the requested model family (Nano Banana models: `gemini-3.1-flash-image`, `gemini-3.1-flash-lite-image`, `gemini-3-pro-image`, `gemini-2.5-flash-image`) without introducing external providers.
* **Zero Secret Leakage**: NEVER hardcode API keys (e.g. `AQ.Ab8RN6...`) into source code. Always resolve from `localStorage` or `import.meta.env`.
* **Equal Duration Division**: When shot count $N$ or total video duration $T$ changes, automatically divide shot durations equally: `shotDuration = T / N`.
* **Vertex Express Global-Only Model Routing**: Models matching `gemini-3.5-*`, `gemini-3.1-*`, or `gemini-3-pro` ONLY respond at the **global endpoint** (`https://aiplatform.googleapis.com`). NEVER send these to regional endpoints (`us-central1-aiplatform.googleapis.com`, etc.) — they will return HTTP 404 on every region. All other models (e.g. `gemini-2.5-pro`, `gemini-2.5-flash`) use regional failover endpoints. Routing detection regex: `/gemini-3\.5-|gemini-3\.1-|gemini-3-pro/.test(model)`.
* **InstaDNA as Vertex Routing Source of Truth**: When Vertex AI model routing behavior is ambiguous, ALWAYS check `D:\AI GENRATION\MY WEB APPS\WEBSITES CODE\The InstaDNA\server\src\gemini.js` → `callVertexExpress()` as the canonical reference for endpoint selection logic before making assumptions. This file contains battle-tested global vs. regional routing that all Minimax H3 Prompt `GeminiProvider` changes must mirror.

---

### 🎬 8. AI Cinematic Storyboard & Seedance 2.0 Workflow Governance
* **6-Step Mandatory Workflow Order**: Always follow the strict cinematic pipeline:
  1. *Ask for Script* (Never generate images before script ingestion).
  2. *Director Analysis* (Analyze emotional tone, pacing, progression, environment, lighting, camera language, and continuity).
  3. *Generate Storyboard* (16:9 widescreen 9-frame grid layout `[1][2][3] / [4][5][6] / [7][8][9]` preserving character, lighting, and directional continuity).
  4. *User Approval Loop* (Ask: "Are you satisfied with this storyboard?").
  5. *Frame Upscaling Workflow* (Ask: "Which frames would you like to upscale?").
  6. *Final Seedance 2.0 Prompt Generation* (Generate detailed cinematic video-generation prompt containing atmosphere, camera movement, lighting, lens feel, and motion descriptions).
* **Cinematic Storytelling Priority**: Prioritize film-quality storytelling over random aesthetics. Never produce disconnected, random frames, or generic AI-looking compositions.
* **Strict Visual Continuity**: Preserve character appearance, clothing, environment, lighting, directional vectors, and emotional progression across all sequential frames.

---

## 🎨 Dual-Theme & Design System Protocol

* **Strict Theme Token Usage**: Inspect `client/src/styles.css` for active design tokens. NEVER use hardcoded color utility classes (e.g. `bg-slate-900`, `text-white`) for component cards or modals. Use semantic classes (`bg-panel`, `bg-panel2`, `text-ink`, `text-mute`, `border-strokeSoft`).
* **Reuse Before Building**: Inspect the existing component library for an appropriate reusable solution before creating a new component, modal, or design variant.
* **Design Pattern Consistency**: Never introduce a new button, card, modal, or badge style when an existing design pattern or component already satisfies the requirement.
* **Mandatory Portal Pattern for Floating UI**: ALWAYS use React Portal for floating popovers or modals inside scrolling containers to prevent clipping.
* **HTML Modal & Dialog Tag Balance Inspection**: When modifying HTML/JSX modal overlays or dialog cards, ALWAYS verify exact closing tag balance (`<div>...</div>`) around modal body wrappers. Ensure modal action footers are strictly nested *inside* the main dialog card container.
* **Strict Anti-Pattern**: NEVER inject global `!important` CSS overrides or multi-class attribute substring matchers in `index.html` style blocks.

---

## 📋 Operational Protocols

### 🔎 Analysis & Inspection
* **Strict Active Source Code Priority**: ALWAYS inspect active, executable source code (`client/src/`, `server/src/`, active `.env`). Never pull specs or model lists from static documentation files.
* **Mandatory Git History & Regression Audit**: When a working feature breaks, run `git log -n 10 --oneline <filepath>` and `git show <commit_hash> <filepath>` to restore proven architecture before rewriting.

### ✍️ User-Facing Content & UX Preservation
* **Preserve Established User Workflows**: When implementing new functionality, preserve established user workflows whenever possible. Avoid unnecessary UI redesigns or interaction changes unless explicitly requested or solving a documented usability problem.
* **Realistic SaaS Copy**: Write short, direct, realistic SaaS copy without jargon or marketing overhype.
* **Customer-Facing SaaS Terms & Policy Formatting**: Structure policies into standard SaaS categories (*Ethical AI*, *Transparency*, *Responsible Use*, *Ownership*, *Billing & Credits*, *Refund Policy*, *Privacy*, *Disclaimers*, *Support Contact*).

### 🛠️ Execution & Version Control
* **Propose Fix Before Coding**: ALWAYS explain root cause analysis and proposed changes to the user before writing code. Explicit user approval is required.
* **Always Maintain Timestamped Changelog**: Update `CHANGELOG.md` under `[Unreleased]` with timestamped entries before committing (`git add CHANGELOG.md`).
* **Never Auto-Push**: NEVER execute `git push` without explicit user permission.
* **Maintain Rolling Handoff Backup (`.agents/SESSION_HANDOFF_BACKUP.md`)**: Update context handoff when concluding sessions or upon user request.
