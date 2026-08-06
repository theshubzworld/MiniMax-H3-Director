# Code Conventions & Invariants

## Coding & Architectural Conventions

### 1. Dual-Theme & Design System Protocol
- **Semantic Color Tokens**: NEVER use hardcoded utility classes like `bg-slate-900` or `text-white` for cards or modals. Use semantic zinc dark mode tokens (`bg-zinc-900`, `bg-zinc-950`, `text-zinc-100`, `text-zinc-400`, `border-zinc-800`).
- **Accent Palette**: Amber-500 for Keyframes/Pass 1, Cyan-500 for AI Director/Pass 2, Emerald-500 for Renders/Success, Violet-500 for Deep Reasoning.

### 2. Prompt Engineering Governance
- **Double-Newline Block Separation**: `PromptCompiler.ts` MUST separate `integrated_multimodal_description:`, shot paragraphs (`[Shot 1]`, `[Shot 2]`), `dialogue:`, `overall_soundscape:`, and `non_diegetic_music:` with double newlines (`\n\n`).
- **Dedicated Spoken Dialogue Section**: When dialogue exists, output BOTH inline `<d>[Language] Text</d>` tags AND a dedicated `dialogue:` section with per-shot speaker IDs and delivery tones (`S1 (soft, reflective): "..."`).
- **Shot Prose Sanitizer**: `PromptCompiler.ts` MUST run `sanitizeShotProse()` to eliminate template fragment stuttering (`standing in Starting...`, `as depicted in <Picture 1>...`, duplicate camera zoom sentences).
- **Default Narrative Preset**: `AIDirectorPanel` MUST default to `Live-Action Realism` for human keyframe photos.

### 3. Vertex AI Model Governance
- **Global Endpoint Routing**: `gemini-3.5-*`, `gemini-3.1-*`, `gemini-3-pro` MUST hit `https://aiplatform.googleapis.com` (no regional prefix).
- **Regional Endpoint Routing**: `gemini-2.5-pro`, `gemini-2.5-flash` use regional failover loops (`us-central1`, etc.).
- **Zero Secret Leakage**: API keys resolve dynamically from `localStorage` or `import.meta.env`. Never commit keys to Git.
