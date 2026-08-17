# Session Handoff & Context Backup

**Last Updated**: 2026-08-05T15:55:00+05:30  
**Project**: The InstaDNA & Dressé Studio  
**Repository**: `theshubzworld/The-InstaDNA`  

---

## 📌 Active Directives & Principles (Mandatory)

1. **Pre-Coding Proposal Rule**: NEVER start editing code or files immediately upon receiving a prompt. Always explain the proposed fix/changes first and obtain explicit user approval.
2. **Push Approval Rule**: NEVER execute `git push` autonomously. Always ask for explicit user permission and receive approval before pushing to GitHub.
3. **Active Code Priority Rule**: Always prioritize active running source code (`client/src/`, `server/src/`, `.env`) over static documentation files (`docs/*.md`).
4. **Mandatory Timestamped Changelogs**: Every `git commit` MUST update `CHANGELOG.md` under `[Unreleased]` with an explicit timestamp header (`#### 📅 Commit Entry — [YYYY-MM-DD HH:mm:ss]`).
5. **Dual-Theme & Design System Protocol**: Always use semantic design tokens (`bg-panel`, `bg-panel2`, `text-ink`, `text-mute`, `border-strokeSoft`, `border-strokeStrong`) from `client/src/styles.css`.
6. **Rolling Session Backup Rule**: At session wrap-up or upon user request, update `.agents/SESSION_HANDOFF_BACKUP.md`. Fresh sessions load this file to restore full context.

---

## 💳 Pricing & Model Branding Architecture

* **Official "Nano Banana" AI Engine Model Branding**:
  * **Free Trial ($0)**: `🍌 Nano Banana 2 Lite Engine` (`gemini-3.1-flash-lite-image`)
  * **Nano ($4.99)**: `🍌 Nano Banana & Nano Banana 2 Lite` (`gemini-3.1-flash-lite-image`, `gemini-2.5-flash-image`)
  * **Starter Pro ($9.99)**: `🍌 Nano Banana 2 Engine` (`gemini-3.1-flash-image`)
  * **Creator Pro ($19.99)**: `🍌 Nano Banana 2 (4K Master Engine)` (`gemini-3.1-flash-image`)
* **Pricing Cards Carousel Layout**:
  * Card 5 (Studio Enterprise) hidden via `hidden` CSS class; Card 4 (Creator Pro) peeks on the right edge.
  * Stacking context `#pricingCardsTrack` uses `relative z-10` so protruding side arrows stack cleanly under Card 1.
* **Stripe Controls**: Hidden on billing pages (saved for future global rollout).

---

## ⚖️ Legal & SaaS Policy Framework

* **Customer-Facing SaaS Terms & Platform Guidelines (`client/index.html` & `docs/FAQ_AND_HELP_GUIDE.md`)**:
  * Restructured `#termsModal` into a clean, scanable 8-section SaaS document:
    1. ⭐ Ethical AI Framework
    2. 🧬 AI Personas & Transparency
    3. 🛡️ Responsible Use (Likeness, Fraud, 18+ Adult rule)
    4. 💼 Ownership & IP (Your Content, Your Data — no public training)
    5. 💳 Billing & Credits (Monthly credit renewal, top-ups, completed generations definition)
    6. 🔄 Refund Policy (Non-refundable digital goods except where required by law, verified duplicate charge reviews, failed request automatic credit returns)
    7. 🔒 Privacy & Data Storage (Encrypted cloud storage, 7–30 day / permanent retention)
    8. ⚠️ Disclaimer & Enforcement (AI variation disclaimer, trial abuse prevention, legally bounded liability: *"To the maximum extent permitted by law..."*)
    9. Support Contact (`support@theinstadna.com`)
  * **Modal Layout Fix**: Removed stray extra closing `</div>` tag on line 3271, docking the "I Understand & Agree" button inside the modal dialog card with top border styling (`border-t border-gray-100`).

---

## 🏛️ System Agent Guidelines (`.agents/AGENTS.md`)

* **Comprehensive Quality Upgrade**:
  * **Decision Hierarchy**: *1. Security & Data Isolation → 2. Correctness → 3. Existing Architecture → 4. UX → 5. Performance → 6. Developer Convenience*.
  * **Simplicity First Core Principle**: Minimal abstraction & justified complexity.
  * **Reuse Before Building**: Check existing UI components before introducing new variants (`Button2.tsx`, `ModalNew.tsx`).
  * **Preserve Established User Workflows**: Avoid unnecessary UI redesigns or workflow alterations.
  * **Abstracted Infrastructure Names**: Generic provider phrasing ("managed object storage", "AI model provider", "active database path").
  * Enterprise rules added for Architecture Boundaries, Non-Breaking API Evolution, Backward-Compatible DB Migrations, Feature Flags, Re-render Prevention, Zero Secret Logging, and Centralized Prompt Governance.

---

## 🛠️ Git History & Commit Tracking (Pushed & Clean)

* **All commits pushed to `origin/main` (`d2175f4`)**:
  * `dd0ac14` — `feat(pricing): add official Nano Banana AI engine model feature bullets to pricing cards`
  * `328db6f` — `docs(terms): update legal subscription terms, refund policy, and AI output disclaimers`
  * `c5e054e` — `docs(terms): refine platform guidelines & terms modal with polished customer-facing SaaS structure`
  * `8152d41` — `fix(ui): dock I Understand & Agree button cleanly inside termsModal dialog card`
  * `02246ac` — `docs(agents): record learned rules for SaaS terms formatting and HTML modal tag balance inspection`
  * `848498f` — `docs(agents): upgrade AGENTS.md with decision hierarchy, architecture boundaries, and long-term durability rules`
  * `d2175f4` — `docs(agents): finalize AGENTS.md with Simplicity First principle, UX preservation, and component reuse rules`
* **Remote HEAD**: `d2175f4` (Fully synchronized with `origin/main`).

---

## 📋 Next Session Blueprint

1. **Razorpay v1 Subscription Management**:
   * Implement `POST /api/razorpay/cancel-subscription` in `server/src/routes/razorpay.js` to update local database state (`active` → `canceled` at period end).
   * Update the Billing UI (`client/src/ui/billing/BillingPage.tsx`) to show plan status, period end date, "Renew Now" button, and "Cancel Plan" button.
2. **Renewal Email / Reminder Triggers**:
   * Design lightweight expiration check / reminder sequence (7 days, 3 days, 1 day before expiration).
3. **Always load this handoff backup file upon restarting work.**
