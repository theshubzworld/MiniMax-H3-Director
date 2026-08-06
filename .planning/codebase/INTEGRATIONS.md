# External Integrations & API Adapters

## Google Vertex AI Express (REST Integration)
- **Primary Endpoint**: `https://aiplatform.googleapis.com/v1/publishers/google/models/` (Global Endpoint)
- **Regional Endpoint**: `https://{location}-aiplatform.googleapis.com/v1/publishers/google/models/` (Regional Failover)
- **Auth**: Direct REST via Google Cloud API Key (`GOOGLE_CLOUD_API_KEY`, `GEMINI_API_KEY`, or `VITE_GEMINI_API_KEY`)
- **Models**:
  - `gemini-3.5-flash` (Global-Only Director Engine — ultra fast)
  - `gemini-2.5-pro` (Regional Director Engine — deep reasoning)
  - `gemini-3.1-flash-image` (Nano Banana 2 — 4K keyframe generator)
  - `gemini-3.1-flash-lite-image` (Nano Banana Lite)
  - `gemini-3-pro-image` (Nano Banana Pro)
  - `gemini-2.5-flash-image` (Nano Banana 2.5)

## Routing Invariants
- **Global-Only Models**: `gemini-3.5-*`, `gemini-3.1-*`, `gemini-3-pro` MUST hit the global endpoint (`aiplatform.googleapis.com`). Regional calls return HTTP 404.
- **Regional Models**: `gemini-2.5-pro`, `gemini-2.5-flash` use regional failover loops (`us-central1`, `us-east4`, `us-west1`, `europe-west1`, `europe-west4`).

## Storage & Export Integrations
- **Local Persistence**: Browser `localStorage` (`minimax_gemini_api_key`, `studio_project_state`, `scene_keyframes`)
- **Image Downloads**: Local browser PNG blob generator with high-precision optical canvas upscaling
- **TXT Export**: Export official MiniMax H3 prompt string (`.txt`)
