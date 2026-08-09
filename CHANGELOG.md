# Changelog

All notable changes to the MiniMax H3 Prompt Studio codebase will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed
- **[2026-08-09] Reference Image Corrupted Preview Fix**: Replaced temporary `URL.createObjectURL(file)` in `ReferenceImageDropzone.tsx` with persistent `FileReader.readAsDataURL(file)` Base64 conversion. Added `imageErrorMap` state and graceful fallback UI to prevent broken image icon overlays.
- **[2026-08-09] Strip 'None.' Prefix from [Shot 1] Header**: Updated `PromptCompiler.ts` to exclude `${style}.` after `[Shot 1]` when `style === 'None'` or `'Unstyled'`, and added regex sanitization in `sanitizeShotProse` to strip residual `[Shot 1] None.` fragments. Cleaned all saved prompts on disk.

### Added
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
