# Directory Structure & File Map

## Codebase Map
```
d:/AI GENRATION/MY WEB APPS/WEBSITES CODE/Minimax H3 Prompt/
├── .agents/                    # Project rules and SESSION_HANDOFF_BACKUP
├── .planning/                  # Project roadmap, state, and codebase map
│   └── codebase/               # Codebase documentation maps
├── public/                     # Static public assets (favicon.svg)
├── src/
│   ├── ai/                     # AI Providers and Interfaces
│   │   ├── interfaces/
│   │   │   └── AIProvider.ts   # Core AIProvider and StoryboardParams contracts
│   │   ├── providers/
│   │   │   ├── GeminiProvider.ts   # Vertex AI REST client with global-only routing
│   │   │   ├── ImageGenProvider.ts # Nano Banana keyframe prompt & render engine
│   │   │   └── OpenAIProvider.ts   # OpenAI adapter stub
│   │   └── AIEngine.ts         # Provider factory
│   ├── components/             # React Component Library
│   │   ├── ai/                 # AIDirectorPanel, AISettingsPanel
│   │   ├── builders/           # AudioBuilder, CameraBuilder, MusicBuilder
│   │   ├── gallery/            # SceneGalleryView
│   │   ├── inspector/          # PromptInspector
│   │   ├── layout/             # Header, Sidebar
│   │   ├── modals/             # GalleryPickerModal
│   │   ├── reference/          # ReferenceImageDropzone
│   │   ├── scene/              # SceneCreatorPanel
│   │   ├── storyboard/         # ShotCard, HorizontalTimeline
│   │   └── wizard/             # Wizard
│   ├── data/                   # Preset dictionaries & matrices
│   ├── engine/                 # Pure compilation & validation engines
│   │   ├── AudioEngine.ts
│   │   ├── CameraEngine.ts
│   │   ├── PromptCompiler.ts   # Main MiniMax H3 prompt compiler
│   │   ├── PromptFormatter.ts
│   │   ├── PromptValidator.ts
│   │   ├── ReferenceEngine.ts  # Part One reference header compiler
│   │   └── TimelineEngine.ts   # Duration & cut calculation
│   ├── store/
│   │   └── StudioStore.ts      # Global Zustand store
│   ├── tests/
│   │   └── compiler.test.ts    # Vitest prompt compiler unit tests
│   ├── types/                  # TypeScript interfaces (project, shot, audio, visualDna)
│   ├── utils/                  # Helper utilities (KeyframeStorageService)
│   ├── App.tsx                 # Root application component & view switcher
│   ├── main.tsx                # Application entry point
│   └── index.css               # Design system tokens & global styling
├── CHANGELOG.md                # Timestamped release changelog
├── package.json                # Dependencies and build scripts
└── vite.config.ts              # Vite configuration
```
