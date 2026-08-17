# Changelog

All notable changes to the MiniMax H3 Prompt Studio codebase will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.4.2] - 2026-08-17

### Added
- **Unified Side-by-Side Reference Image Gallery & Large Preview**: Eliminated oversized separate top upload boxes in favor of a cohesive side-by-side grid with prominent 80x80px previews and inline right-side upload slot.
- **Hands-Free Smooth Auto-Scrolling**: Added automatic page scrolling to the Live GPU Token Stream terminal on generation start and continuous bottom-following token autoscroll.
- **Reference Card Decluttering**: Removed obsolete trait pills and streamlined cards with `<Picture 1>` cyan badge, subtitle timing, and one-click delete.

## [2.4.1] - 2026-08-17

### Fixed
- **Local LLM Dual-Mode Multimodal Payload & Fallback**: Resolved Ollama / LM Studio connection stalls by transmitting clean string content for text-only storyboards and dual-transmitting OpenAI `image_url` + native Ollama base64 lists for visual keyframes with auto-recovery.
- **Immediate Streaming Terminal Visibility**: Ensured the Live GPU streaming terminal opens instantly upon generation start with pulsing status indicator.
- **Model Selector Dropdown Typography & Alignment**: Cleaned dropdown options in `AISettingsPanel.tsx` with dynamic model labels, eliminating broken ellipsis strings.
- **Vite React Fast Refresh**: Scoped internal style dictionary exports in `AIDirectorPanel.tsx` to eliminate all HMR Fast Refresh warnings.

## [2.4.0] - 2026-08-17

### Added
- **Vector Aperture Logo & Modern Header Redesign**: Designed custom luxury 35mm optical aperture vector emblem (`DirectorLogo.tsx`), updated `favicon.svg`, and rebuilt `Header.tsx` with live project metrics chip, view switchers, and gradient actions.
- **Real-Time Token Streaming & Live GPU Terminal**: Integrated SSE token streaming (`stream: true`) in `LocalProvider.ts` with real-time reasoning and token display terminal in `AIDirectorPanel.tsx` with 1-click copy, minimize, and dismiss controls.
- **Recommended Vision Models & 1-Click Library**: Added 4-model curated library in `AISettingsPanel.tsx` with direct 1-click copy commands and verified links for Ollama and Hugging Face GGUF (`Qwen3-VL Heretic`, `Qwen2.5-VL 3B`, `Qwen2.5-VL 7B`, and `LLaVA 7B`).
- **Dynamic Provider Decoupling & Synchronization**: AI Director Studio dynamically adapts all previews, payloads, and buttons to active local models or cloud Gemini.
- **Sidebar Footer Studio Version Badge**: Added `v2.4.0` status pill and Buy Me a Coffee direct support card.

## [Unreleased]

### Fixed
- **[2026-08-17] Studio UI Decluttering & Workstation Architecture Reorganization**:
  - Eliminated trashcan icons ("dustbins") cluttering each individual storyboard shot duration chip in `AIDirectorPanel.tsx`; simplified into sleek, clean badges (`Shot 1 [ 2.5s ▾ ]`).
  - Replaced harsh red trashcan clear button with a subtle, modern `<RotateCcw>` Reset button on the Prompt Idea textarea.
  - Consolidated duplicate visual style selectors and replaced the overwhelming 33-button and 57-button clouds with curated top-pick chips and clean collapsible drawers (`🎭 Browse All Styles ▾`, `💡 Browse Story Seeds ▾`).
  - Compacted the top studio header and MiniMax mode switcher into a single elegant bar, eliminating redundant oversized spec cards.
- **[2026-08-17] Git Configuration & Agent Guidelines Tracking**: Updated `.gitignore` to un-ignore `.agents/AGENTS.md` and `.agents/SESSION_HANDOFF_BACKUP.md` while keeping local agent cache folders ignored. Configured dev server port to 4000 in `vite.config.ts`.
- **[2026-08-09] Uncensored NSFW Audio & Spoken Dialogue Mandate**: Updated `uncensored_nsfw` mode system prompt contract and JSON schema template in `GeminiProvider.ts` to mandate spoken dialogue (`hasDialogue: true`), intimate whispers, and rich multi-layer atmospheric soundscapes (`ambience` and `foley`).
- **[2026-08-09] Per-Shot Duration Selectors & Mandatory Shot Count Contract**: Added interactive per-shot duration dropdown selectors (`0.5s` to `6.0s`) to `ShotCard.tsx` and `AIDirectorPanel.tsx`. Added `setShotsCount` dropdown selector (`1` to `9` shots) and enforced strict `MANDATORY SHOT COUNT CONTRACT` and array slicing in `GeminiProvider.ts` so generated storyboards always match requested shot count and preserve custom per-shot timings.
- **[2026-08-09] Prominent Reference Image Delete Controls & Reduced UI Text Density**: Added direct delete button overlays (`<Trash2>`) on reference image thumbnails and explicit "Remove" buttons on card headers in `ReferenceImageDropzone.tsx`. Truncated long hash filenames (`a3e89eb...`), simplified visual trait badges, and streamlined workstation headers in `AIDirectorPanel.tsx` to reduce cognitive text clutter.
- **[2026-08-09] Director Wizard UI State & Navigation Reset Fix**: Hydrated and persisted `narrativeStyle` in `localStorage` (`minimax_narrative_style`), synchronized with `project.settings.style`, and updated `handleAutoBuild` to retain generated cinematic titles (`project.name`) and story concepts (`project.description`) across tab switches and browser reloads.
- **[2026-08-09] Director Wizard & Gemini Prompt Pipeline Audit & Fix**: Unified system prompt construction via static `GeminiProvider.buildDirectorSystemPrompt`, resolving UI preview prompt drift. Corrected Nano Banana `responseModalities` payload spec (`['TEXT', 'IMAGE']`). Adjusted dialogue word limit formula to `shotDuration * 1.8` for natural unhurried voiceover speech (~1.8 words/sec). Added directional motion vector rules and multi-character dialogue speaker fallbacks (`S2` / `S3`).
- **[2026-08-09] Reference Image Corrupted Preview Fix**: Replaced temporary `URL.createObjectURL(file)` in `ReferenceImageDropzone.tsx` with persistent `FileReader.readAsDataURL(file)` Base64 conversion. Added `imageErrorMap` state and graceful fallback UI to prevent broken image icon overlays.
- **[2026-08-09] Strip 'None.' Prefix from [Shot 1] Header**: Updated `PromptCompiler.ts` to exclude `${style}.` after `[Shot 1]` when `style === 'None'` or `'Unstyled'`, and added regex sanitization in `sanitizeShotProse` to strip residual `[Shot 1] None.` fragments. Cleaned all saved prompts on disk.

### Added
- **[2026-08-17] Local GPU Vision-LLM Provider (Qwen3-VL / Ollama / LM Studio / ComfyUI)**:
  - Added dedicated `LocalProvider.ts` implementing `AIProvider` to support running local Vision-LLMs (such as Pixaroma's `Qwen3-VL 8B Heretic`, `Qwen2.5-VL 8B`, and any OpenAI-compatible local server) 100% offline and free with zero API key costs.
  - Added full configuration in `AISettingsPanel.tsx` supporting customizable endpoints (`http://localhost:11434/v1` for Ollama, `http://localhost:1234/v1` for LM Studio, `http://localhost:8000/v1` for vLLM), model names, and a live connection test button with latency feedback.
  - Added **`💻 Local Qwen3-VL`** intelligence profile in `AIDirectorPanel.tsx` alongside *🎬 Cinematic*, *🔥 Uncensored*, and *🧠 Deep Reasoning*.
- **[2026-08-17] Pixaroma Integration & Gold-Standard H3 Directorial Enhancements**:
  - **Exact 17n + 5 Frame Snapping Engine (`FrameMath.ts`)**: Built dedicated math engine that computes exact MiniMax H3 frame steps ($17n + 5$ at 24 fps) and displays runtime synchronization badges across the Inspector, ComfyUI exporter, and Markdown exports.
  - **👑 ComfyUI-Pixaroma Export Preset**: Added dedicated 1-click export tab in `ComfyUIModal.tsx` formatted specifically for `PixaromaVideoPrompt`, `PixaromaH3AudioSync`, and `PixaromaDuration` nodes with target frames, seconds, and mode detection.
  - **🚫 Strict Ban on Weak Motion Adverbs**: Added diagnostic rule and 1-click Auto-Fix in `PromptValidator.ts` and `PromptOptimizer.ts` that flags and replaces ambiguous adverbs (`slightly`, `subtly`, `gently`, `a little`, `gradually`) with explicit amplitude and speed keywords (`with small amplitude`, `at slow speed`).
  - **🎯 Strict Sentence-Ending Full Stop Punctuation**: Integrated strict non-comma-chaining rules into Gemini Director system prompt to guarantee clean, punchy physical action sentences.
  - **👄 Physical Lip-Movement Anchor Phrases**: Added physical mouth movement and closing actions in dialogue generation to ensure flawless MiniMax AV lip-sync rendering.
- **[2026-08-17] Comprehensive Gemini & Vertex AI API Key Setup Guide**: Added detailed step-by-step documentation in `README.md` explaining how to acquire and configure an API key via both Google AI Studio (free & instant) and Google Cloud Console (Vertex AI Express Mode with service restrictions and model tiers).
- **[2026-08-09] Gemini Setup Simplification & Unified Director Profiles**: Consolidated 14 separate technical Gemini settings into 3 unified Director Profiles (`🎬 Cinematic Director`, `🔥 Uncensored Real Motion`, `🧠 Deep Reasoning Director`). Synchronized visual style state between `project.settings.style` and `narrativeStyle` to eliminate dual-style prompt drift, and added an expandable `⚙️ Custom Technical Overrides` drawer for power users needing raw temperature or reasoning token control.
- **[2026-08-09] Standalone Gemini Director Studio View**: Created a dedicated `gemini-director` standalone studio view accessible directly from the left navigation sidebar (`Sidebar.tsx`) and top header toggle (`Header.tsx`). Renders a single-page AI prompt workstation with MiniMax H3 mode spec cards, keyframe anchor dropzone, full `AIDirectorPanel` controls, and live prompt export directly to the right-side `Prompt Inspector` sidebar — completely bypassing the multi-step 4-stage wizard progress bar.
- **[2026-08-09] Git Restore of Proven Director Workstation**: Restored `AIDirectorPanel.tsx` directly from Git HEAD (`67d3015`) to revert all layout experiments and bring back the original 100% complete, fully expanded UI.
- **[2026-08-09] 7 Production Directorial State Machines**: Added `src/data/cinematic_state_machines.ts` containing 7 production state machines (`Product Proof State Machine`, `Fixed Composition Medium Ladder`, `Dimensional Carrier Loop`, `Person-Anchored Goal Journey`, `Cross-Medium Contact Reaction`, `Clarity Over Quantity Reversal`, `Proof Object Reaction Handoff`). Integrated a state machine selection dropdown into `AIDirectorPanel.tsx`.
- **[2026-08-09] Priority Precedence Locking Engine**: Added non-negotiable priority rules (`User Intent & Observable Media Facts > Core Directorial Rules > Narrative Presets > State Machines`) in `GeminiProvider.ts` to eliminate AI prompt drift and prevent template overrides.
- **[2026-08-09] <scenetrans> & Off-Screen Lip-Lock Dialogue Rules**: Updated `PromptCompiler.ts` and `GeminiProvider.ts` to automatically inject `<scenetrans>` for speech spanning visual cuts and enforce explicit lip-closed rules for off-screen voiceovers.
- **[2026-08-09] Uncensored Real-Life Scene Planner Prompt**: Configured **🔥 Uncensored NSFW Mode** in `GeminiProvider.ts` and `AIDirectorPanel.tsx` with the 10 Core Scene Rules (Continuous Action, Realistic Human Movement, Natural Camera, Visual Description, Character/Environment Consistency, Action Continuity, intimate movements, plain English).
- **[2026-08-09] Restored Standard Director Mode Prompt**: Restored **🎬 Standard Director Mode** to the formal cinematic AI Video Director prompt (35mm optical lens physics, cinematic depth of field, and lighting falloff rules).
- **[2026-08-09] 3 Uncensored NSFW Simple Real-Motion Story Seeds**: Added `📱 Uncensored Mobile Video Call`, `🕯️ Uncensored Bedside Caress`, and `💦 Uncensored Steamy Vanity` to `STORY_SEED_PRESETS` in `AIDirectorPanel.tsx`.
- **[2026-08-09] System Prompt Preset Selector (Uncensored NSFW Simple Real Motion)**: Created a dual System Prompt Architecture engine (`systemPromptPreset`) across `AIDirectorPanel.tsx`, `StudioStore.ts`, `AIProvider.ts`, and `GeminiProvider.ts`. Allows users to switch between **Standard Director Mode** (cinematic framing & optical physics) and **Uncensored NSFW Mode** (simple, natural English focusing on continuous real physical human motion and bedroom actions without director jargon or artificial camera cuts).
- **[2026-08-08] None (Unstyled) Preset Option**: Added `'None'` option to Narrative & Motion Style presets across `AIDirectorPanel.tsx`, `AIProvider.ts`, `GeminiProvider.ts`, and `project.ts`. Allows AI Director to infer camera motion, lighting, and soundscape 100% from raw story ideas without imposing pre-packaged visual style directives.
- **[2026-08-08] Raw Home Amateur Mobile Preset**: Created dedicated `Raw Home Amateur Mobile` visual style preset across `AIDirectorPanel.tsx`, `AIProvider.ts`, `GeminiProvider.ts`, and `project.ts`. Tailored specifically for amateur home videos, seamlessly switching between handheld selfie angles and propped-up 3rd-person phone placement with unpolished indoor lighting and natural mobile sensor noise.
- **[2026-08-08] Prompt Recognition Headings & Pure Prompt Text Copying**: Added `TitleGenerator.ts` to parse raw prompts into clean 3-5 word recognition headings for UI cards and Prompt Library. Enforced mandatory heading rules in `GeminiProvider.ts` system prompt. Added 1-click inline title editing (pencil icon) in `PromptLibraryPanel.tsx` with instant auto-sync to local disk storage. Excluded heading prefix when copying or exporting prompt text so copied prompts remain 100% pure official MiniMax H3 format. Auto-cleaned all 64+ library prompts on disk.
- **[2026-08-08] Automatic Real-Time Local Disk Persistence**: Implemented custom Vite server middleware (`savePromptsPlugin`) listening on `/api/save-prompts`. Every prompt generated, compiled, or saved in the application is automatically posted and written to `src/data/user_saved_prompts.json` and root `user_saved_prompts.json` on disk in real time.
- **Permanent Prompt Storage & Codebase Sync System**: Built `src/data/user_saved_prompts.json` permanent static prompt storage engine. Hydrates, merges, and deduplicates prompts across both git repository file assets and browser local storage. Added **Export JSON**, **Import JSON**, and **Save to Codebase** buttons with interactive modal sync to `PromptLibraryPanel.tsx`. Restored and locked 14 user browser prompts directly into codebase storage.
- **140 Production Templates across 14 Categories (10 Templates per Category)**: Expanded and modularized the Template Library (`src/data/templates/`) so that EVERY single category (`Raw & Amateur`, `Sultry & Romance`, `Boudoir`, `Social Media`, `Cinematic Film`, `Fashion`, `Luxury`, `Action`, `Sci-Fi`, `Cars`, `Food`, `Travel`, `Sports`, `Music Video`) contains **EXACTLY 10 production-ready templates** equipped with camera motion physics, spoken dialogue tags (`<d>[Language] Text</d>`), and structured soundscapes.
- **Saved Prompt Library System (`PromptLibraryPanel.tsx`)**: Created a dedicated Prompt Library view and local storage persistence engine (`savedPrompts`). Includes instant search/filtering, category tabs (`All`, `Favorites ⭐`, `I2VA`, `T2VA`, `FL2VA`, `L2VA`), 1-click prompt copying, single-click scene rehydrating into the studio editor, and 💾 **Save to Library** buttons across `PromptInspector` and `AIDirectorPanel`.
- **Couple Romance Story Seed Presets**: Added 6 dedicated romantic couple story seeds in `AIDirectorPanel.tsx` covering bedroom linen sunbeams, candlelit marble bath spa, sun-drenched kitchen morning coffee, sunset beach stroll, rainy window blanket snuggle, and wildflower meadow picnic.
- **30+ Audio-Equipped Story Seed Presets**: Expanded `STORY_SEED_PRESETS` in `AIDirectorPanel.tsx` to 30+ rich cinematic presets containing explicit spoken dialogue/narration, foley soundscape cues, and musical scoring instructions across diverse genres.
- **Spoken Dialogue Pacing & Speech Rate Safeguard**: Implemented speech rate duration safeguards across `GeminiProvider.ts`, `PromptValidator.ts`, and `PromptOptimizer.ts`. Spoken dialogue is strictly scaled to shot duration ($\le \lfloor \text{durationSeconds} \times 2.5 \rfloor$ words) to prevent fast-forwarded/chipmunk audio artifacts.
- **Expanded Storyboard Shot Limit (Up to 9 Shots)**: Expanded maximum storyboard shot capacity from 6 to 9 shots across `StudioStore.ts`, `AIDirectorPanel.tsx`, and `HorizontalTimeline.tsx`.
- **Live-Action Realism Primary Motion Preset**: Added `Live-Action Realism` as the primary #1 default narrative style preset in `AIDirectorPanel.tsx` for 100% natural real-life human motion, 35mm practical lighting, and authentic physical foley.
- **Dedicated Spoken Dialogue Section**: `PromptCompiler.ts` now auto-compiles a structured `dialogue:` block with per-shot speaker IDs, dialogue text, and emotional delivery cues (e.g. `S1 (soft, reflective): "..."`).

### Fixed
- **Simplified Natural System Prompt Instructions**: Refactored `GeminiProvider.ts` to use simple, clean, positive instructions without negative keyword overload ("CRITICAL", "MUST", "NEVER"). This allows Gemini 2.5 Pro and 3.5 Flash to generate 100% original dialogue and natural visual prose without getting over-constrained.
- **Camera Target Possessive Noun Phrase Regex Fix**: Fixed `CameraEngine.ts` regex replacement bug where possessive target phrases (e.g. `the subject from <Picture 1>'s energy blade` and `the subject from <Picture 1>'s full body`) were incorrectly truncating noun modifiers, producing glitched output like `"toward the energy of the subject from <Picture 1> blade"`.
- **Preset Quote & Fallback String Sanitization**: Removed hardcoded quotes `("...")` from `STORY_SEED_PRESETS` in `AIDirectorPanel.tsx` and updated `DEFAULT_PROJECT` in `StudioStore.ts` to prevent Gemini from copying system preset strings.
- **Gemini 3.5 Flash & 2.5 Pro Multi-Shot Dialogue Flexibility**: Removed artificial 1-2 shot dialogue restrictions in `GeminiProvider.ts` and added anti-copy directives (`<ORIGINAL_UNIQUE_STORY_NARRATION>`). Gemini now composes 100% original, unique 2-4 word voiceover lines tailored to the user's specific story across all requested shots.
- **Multi-Panel Reference Grid Support**: Instructed Gemini Director to inspect multi-panel composite grids (e.g. 3x3 Wonder Woman panels) to maintain armor, weapon, and pose identity across sequential shots.
- **Direct 1-Step Gemini Director Storyboard Generation**: Removed redundant `analyzeVisualDNA` text extraction pass in `AIDirectorPanel.tsx`. Gemini now directly inspects multimodal reference images in 1 fast step to create storyboards without extra visual DNA text extraction overhead.
- **Eliminated Hardcoded "Same Room" Contradiction**: Fixed `PromptCompiler.ts` line 95 which was hardcoding `"preserving the same room"` for shots > 1. Replaced with `"preserving the subject appearance and wardrobe from <Picture 1>"`, allowing multi-location airport/cinematic scenes to flow naturally without contradictions.
- **Sanitized N/A Environment & Camera Strings**: Filtered out `n/A (indoors)`, `N/A`, and `with N/A at N/A` from camera motion sentences and environment location descriptors.
- **Gemini Director Engine Selection (Gemini 2.5 Pro vs 3.5 Flash ⚡)**: Added model selection toggles across Scene Creator and AI Director Workstation, letting users choose between Gemini 2.5 Pro (Deep Reasoning) and Gemini 3.5 Flash (Ultra Fast).
- **Mode-Aware Keyframe Design & Storyboard Contracts**: Mode-aware system prompt contracts for `I2VA` (First Frame @ 0s), `L2VA` (Last Frame @ Ending), `T2VA` (Text Pre-Vis), and `FL2VA` (First & Last Frame Pair).
- **FL2VA Keyframe Gallery Picker Modal**: Modal in FL2VA dropzone allowing 1-click keyframe selection directly from generated 4K scene gallery.
- **True 4K/2K High-Precision Canvas Optical Upscaler**: High-precision optical upscaler pass in `ImageGenProvider.ts` scaling raw model output to true 3840px / 4096px UHD.

### Fixed
- **Gold-Standard Multimodal Prompt Formatting**: Rewrote `PromptCompiler.ts` to output clean double-newline (`\n\n`) shot paragraph layout matching Hollywood screenplay standards.
- **Shot Prose Sanitizer**: Built `sanitizeShotProse()` in `PromptCompiler.ts` to automatically strip template stuttering (`standing in Starting...`, `as depicted in <Picture 1>...`, duplicate camera zoom sentences).
- **Vertex AI Global Endpoint Routing**: Fixed HTTP 404 error on `gemini-3.5-flash` by routing `gemini-3.5-*`, `gemini-3.1-*`, and `gemini-3-pro` to Google's global endpoint (`aiplatform.googleapis.com`), mirroring InstaDNA reference architecture.
- **Mode-Specific Keyframe Count & Prompt Staging**: `SceneCreatorPanel` automatically syncs single vs dual keyframe prompt generation, preview textareas, and Nano Banana image renders based on active MiniMax mode (`I2VA`, `L2VA`, `T2VA`, `FL2VA`).

### Security
- **Zero Secret Leakage Verification**: Verified all API key resolutions resolve from `localStorage` or `import.meta.env`. Zero hardcoded credentials committed.

### Governance
- **Persisted 3 Prompt Engineering Rules**: Added double-newline section layout, dedicated dialogue section, and zero template stuttering rules to `.agents/AGENTS.md`.
