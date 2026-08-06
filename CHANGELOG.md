# Changelog

All notable changes to the MiniMax H3 Prompt Studio codebase will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **Gemini Director Engine Selection (Gemini 2.5 Pro vs 3.5 Flash ⚡)**: Added model selection toggles across Scene Creator and AI Director Workstation, letting users choose between Gemini 2.5 Pro (Deep Reasoning) and Gemini 3.5 Flash (Ultra Fast).
- **Mode-Aware Keyframe Design & Storyboard Contracts**: Mode-aware system prompt contracts for `I2VA` (First Frame @ 0s), `L2VA` (Last Frame @ Ending), `T2VA` (Text Pre-Vis), and `FL2VA` (First & Last Frame Pair).
- **FL2VA Keyframe Gallery Picker Modal**: Modal in FL2VA dropzone allowing 1-click keyframe selection directly from generated 4K scene gallery.
- **True 4K/2K High-Precision Canvas Optical Upscaler**: High-precision optical upscaler pass in `ImageGenProvider.ts` scaling raw model output to true 3840px / 4096px UHD.

### Fixed
- **Vertex AI Global Endpoint Routing**: Fixed HTTP 404 error on `gemini-3.5-flash` by routing `gemini-3.5-*`, `gemini-3.1-*`, and `gemini-3-pro` to Google's global endpoint (`aiplatform.googleapis.com`), mirroring InstaDNA reference architecture.
- **Mode-Specific Keyframe Count & Prompt Staging**: `SceneCreatorPanel` automatically syncs single vs dual keyframe prompt generation, preview textareas, and Nano Banana image renders based on active MiniMax mode (`I2VA`, `L2VA`, `T2VA`, `FL2VA`).

### Security
- **Zero Secret Leakage Verification**: Verified all API key resolutions resolve from `localStorage` or `import.meta.env`. Zero hardcoded credentials committed.
