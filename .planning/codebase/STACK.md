# Tech Stack Specification

## Core Framework & Runtime
- **Framework**: React 18.3.1 (Vite 6.4.3 bundler)
- **Language**: TypeScript 5.5.3 (strict mode)
- **State Management**: Zustand 4.5.2 (persisted studio state)
- **Icons**: Lucide React 0.344.0

## Styling & Design System
- **CSS**: Vanilla CSS (`src/index.css`) + Tailwind utility classes
- **Theme**: Sleek Dark Mode (Zinc-900 / Amber-500 / Cyan-500 / Emerald-500)
- **Animations**: CSS keyframes & micro-animations

## Build & Test Tooling
- **Build Engine**: Vite 6.4.3
- **Type Checker**: TypeScript `tsc --noEmit`
- **Unit Testing**: Vitest 2.1.9

## Key Dependencies
- `react`, `react-dom`: UI rendering engine
- `zustand`: Global state management (`StudioStore.ts`)
- `lucide-react`: Saas UI iconography
