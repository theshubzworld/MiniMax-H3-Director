# Codebase Concerns & Known Risks

## Identified Concerns & Technical Debt

### 1. Vertex AI Model Endpoint Routing Sensitivity
- **Risk**: Calling global-only models (`gemini-3.5-flash`, `gemini-3.1-flash-image`, `gemini-3-pro`) on regional endpoints (`us-central1-aiplatform.googleapis.com`) results in immediate HTTP 404 errors across all locations.
- **Mitigation**: `callVertexExpress` in `GeminiProvider.ts` uses regex `/gemini-3\.5-|gemini-3\.1-|gemini-3-pro/` to automatically force the global endpoint (`https://aiplatform.googleapis.com`).

### 2. Large LocalStorage Payload Limits
- **Risk**: Storing raw base64 data URLs for generated high-resolution 4K keyframe images inside `localStorage` (`scene_keyframes`) can exceed browser storage quotas (5MB - 10MB limit).
- **Mitigation**: `KeyframeStorageService.ts` caps stored keyframes and converts remote/blob images efficiently.

### 3. Hot Module Replacement (HMR) State Flashes
- **Risk**: Direct file modifications during active `npm run dev` session can trigger transient Vite HMR 500 reloads.
- **Mitigation**: Vite handles recovery upon hard reload or server restart; build process is verified with `npm run build`.
