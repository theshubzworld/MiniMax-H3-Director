# MiniMax H3 Director Studio 🎬⚡

![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![React](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Gemini AI](https://img.shields.io/badge/Google_Gemini-3.5_Flash_|_2.5_Pro-8E75B2?style=for-the-badge&logo=google-gemini&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)

**MiniMax H3 Director Studio** is a high-performance, production-grade AI Video Director Workstation engineered for **MiniMax H3 (T2VA, I2VA, FL2VA, L2VA)** prompt compilation, multimodal visual DNA extraction, multi-shot storyboard orchestration, stereo soundscape synthesis, and ComfyUI API payload generation.

---

## 🌟 Key Features

- **🪄 Director Wizard**: Guided step-by-step assistant that builds 100% specification-compliant MiniMax H3 prompts in seconds.
- **🤖 Powered by Gemini AI**: Integrates Google Vertex AI Express & Gemini (`gemini-3.5-flash`, `gemini-2.5-flash`, `gemini-2.5-pro`) for Visual DNA extraction & 1-click multimodal storyboard generation from text ideas & image references.
- **🎥 3D Camera Direction Engine**: 18+ precision camera movement presets (*Push In, Pan Left, Tracking Shot, Arc Shot, Pedestal Up, etc.*), movement amplitude ranges, speed pacing controls, and 30+ focal target presets.
- **🔊 Audio & Music Orchestration**: Native support for overall stereo soundscapes (`overall_soundscape`) and non-diegetic background music pacing (`non_diegetic_music`).
- **💬 Dialogue Tag Parser**: Supports character spoken dialogue tags (`<d>[Language] Spoken Text</d>`) with off-screen voiceover lip-sync controls.
- **🔬 Diagnostics & Auto-Fix Engine**: Evaluates 50+ compliance rules across 15 diagnostic categories with a live health score (0–100%) and a **1-click Auto-Fix** button.
- **🎨 20+ Production Template Library**: Instant pre-fills for Cyberpunk Anime, Fashion, High-Octane Action, Commercial, Documentary, Sci-Fi, and Cinematic styles.
- **🔌 ComfyUI Payload Exporter**: Generates 1-click JSON payloads pre-formatted for `MINIMAX H3 3in1` nodes and API ingestion.
- **🌗 Universal Light & Dark Mode**: High-contrast workstation themes with instant switching and local storage persistence.

---

## 🎥 Understanding MiniMax H3 Modes

MiniMax H3 supports four primary generation modes:

| Mode | Name | Description | Reference Syntax |
| :--- | :--- | :--- | :--- |
| **`T2VA`** | Text-to-Video-and-Audio | Generates video & stereo audio purely from text prompt instructions. | *No reference header line.* |
| **`I2VA`** | Image-to-Video-and-Audio | Aligns an initial keyframe image at `0.00s` into the generated video. | `at 0.00 seconds... <Picture 1> (from [Shot 1]) is fully referenced.` |
| **`FL2VA`** | First & Last-Frame Video-and-Audio | References `<Picture 1>` at `0.00s` and `<Picture 2>` at the final duration mark. | `Picture 1 (from Shot 1) aligns at 0.00s; Picture 2 (from Shot N) aligns at N.00s` |
| **`L2VA`** | Last-Frame Video-and-Audio | Aligns `<Picture 1>` at the very end of the video duration. | `<Picture 1> (from [Shot N]) aligns with the N.00-second mark` |

---

## 🚀 Quick Start & Installation

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm** / **yarn** / **pnpm**

### 1. Clone the Repository
```bash
git clone https://github.com/theshubzworld/MiniMax-H3-Director.git
cd MiniMax-H3-Director
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Gemini API Key
Create a `.env` file in the root folder (or copy from `.env.example`):
```bash
cp .env.example .env
```

Add your Google Gemini API key to `.env`:
```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```
> 💡 *Get your free Gemini API key from [Google AI Studio](https://aistudio.google.com/). You can also enter or change your API key directly inside the studio UI's **AI Settings** panel.*

### 4. Run Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:3000`.

### 5. Build for Production
```bash
npm run build
```

### 6. Run Test Suite
```bash
npm test
```

---

## 🛠️ Tech Stack & Architecture

- **Frontend Core**: React 19, TypeScript, Vite 6
- **Styling**: Tailwind CSS v4, Lucide Icons, Custom Utility Layer
- **State Management**: Zustand v5
- **AI Integrations**: Google Vertex AI Express & Gemini REST API
- **Testing**: Vitest

```
MiniMax-H3-Director/
├── .env.example              # Environment variable setup guide
├── .gitignore                # Git exclusion rules
├── index.html                # Main web application entry point
├── package.json              # Dependencies and scripts
├── src/
│   ├── ai/                   # AI Director engine & Gemini API provider
│   ├── components/           # UI components (Wizard, Storyboard, Inspector, Builders)
│   ├── data/                 # Production template presets
│   ├── engine/               # Prompt compiler, validator, optimizer & formatters
│   ├── store/                # Zustand studio state & history store
│   ├── tests/                # Unit test suite
│   ├── types/                # TypeScript interface definitions
│   ├── index.css             # Tailwind CSS & universal light/dark theme rules
│   └── main.tsx              # React mounting entry point
└── workflow reference/       # ComfyUI workflow JSON reference files
```

---

## ☕ Support & Community

If you find **MiniMax H3 Director Studio** helpful in your AI video production workflow:

- ⭐ **Feel free to star the repo!** New updates, model optimizations, and features will keep coming.
- ☕ **Buy Me a Coffee**: Support ongoing open-source development at **[buymeacoffee.com/shubzworld](https://buymeacoffee.com/shubzworld)**

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.
