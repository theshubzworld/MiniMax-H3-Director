# Testing & Quality Assurance Standard

## Testing Framework & Execution

- **Runner**: Vitest 2.1.9
- **Command**: `npx vitest run`
- **Type Checker Command**: `npx tsc --noEmit`
- **Production Build Verification**: `npm run build`

## Test Suites & Verification Rules
1. **Prompt Compiler Suite (`src/tests/compiler.test.ts`)**:
   - Verifies Part One reference header compilation across `T2VA`, `I2VA`, `FL2VA`, `L2VA` modes.
   - Verifies Part Two `integrated_multimodal_description:` block structure and double newline formatting.
   - Verifies audio silence suppression and `overall_soundscape` / `non_diegetic_music` output.

2. **Quality Gates**:
   - Before completing any task, run `npx tsc --noEmit` and `npm run build` to verify zero TypeScript compiler errors or bundler warnings.
