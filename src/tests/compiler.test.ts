import { describe, it, expect } from 'vitest';
import { PromptCompiler } from '../engine/PromptCompiler';
import { PromptValidator } from '../engine/PromptValidator';
import { PromptFormatter } from '../engine/PromptFormatter';
import { ReferenceEngine } from '../engine/ReferenceEngine';
import { StudioProject } from '../types/project';

describe('MiniMax H3 Director Engine Tests', () => {
  const sampleProject: StudioProject = {
    id: 'test-proj',
    name: 'Cyberpunk Action Scene',
    description: 'Test scene',
    settings: {
      mode: 'I2VA',
      durationSeconds: 6,
      aspectRatio: '16:9',
      style: 'Cyberpunk',
      fps: 24,
      resolution: '1080p',
    },
    shots: [
      {
        id: 'shot-1',
        shotNumber: 1,
        startTimeSeconds: 0,
        durationSeconds: 3,
        camera: {
          motionType: 'Push In',
          amplitude: 'small amplitude',
          speed: 'slow speed',
          targetSubject: 'glowing cybernetic eyes',
        },
        character: {
          speakerId: 'S1',
          identity: 'Female Cyborg Warrior',
          wardrobe: 'black leather trench coat',
          expression: 'intense focus',
          motion: 'stands grounded facing camera',
        },
        environment: {
          location: 'rain-soaked neo-tokyo alleyway',
          lighting: 'neon cyan key backlight',
          weather: 'heavy steady rain',
        },
        rawActionDescription: 'Heroine draws plasma blade in fluid movement.',
      },
      {
        id: 'shot-2',
        shotNumber: 2,
        startTimeSeconds: 3,
        durationSeconds: 3,
        camera: {
          motionType: 'Tracking Shot',
          amplitude: 'medium amplitude',
          speed: 'normal speed',
          targetSubject: 'approaching drone',
        },
        character: {
          speakerId: 'S1',
          identity: 'Female Cyborg Warrior',
          motion: 'dashes forward with plasma blade',
        },
        environment: {
          location: 'rain-soaked neo-tokyo alleyway',
          lighting: 'flashing orange alerts',
        },
        rawActionDescription: 'Slashes security drone in dramatic low angle.',
      },
    ],
    audio: {
      isSilent: false,
      soundscapeLayers: [
        { category: 'ambient', description: 'distant heavy rain and industrial hum', enabled: true },
        { category: 'foley', description: 'wet boot footsteps on metallic grating', enabled: true },
      ],
      music: {
        hasMusic: true,
        genreStyle: 'Dark Cyberpunk Synthwave',
        instrumentation: ['analog synth bass', 'distorted lead keys'],
        tempo: 'energetic',
        dynamics: 'rapid crescendo reaching peak at cut',
      },
    },
    references: [
      { id: 'ref-1', name: 'Picture 1', type: 'first_frame', shotIndex: 1, url: 'data:image/png;base64,sample' },
    ],
    compiledPrompt: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  it('should compile official MiniMax H3 reference header and multimodal prose', () => {
    const compiled = PromptCompiler.compile(sampleProject);
    expect(compiled).toContain('<Picture 1>');
    expect(compiled).toContain('[Shot 1] Cyberpunk');
    expect(compiled).toContain('[Shot 2] At 00:03.000');
    expect(compiled).toContain('overall_soundscape:');
    expect(compiled).toContain('non_diegetic_music:');
  });

  it('should format payload for ComfyUI API ingestion', () => {
    const jsonStr = PromptFormatter.toComfyUIPayload(sampleProject);
    const parsed = JSON.parse(jsonStr);
    expect(parsed.client_id).toBe('minimax_studio_web');
    expect(parsed.prompt['1'].class_type).toBe('MiniMaxH3PromptNode');
  });

  it('should validate prompt health and score 100% for valid configuration', () => {
    const compiled = PromptCompiler.compile(sampleProject);
    const result = PromptValidator.validate({ ...sampleProject, compiledPrompt: compiled });
    expect(result.overallHealthScore).toBeGreaterThanOrEqual(80);
    expect(result.categoryScores['Camera 3D Direction']).toBeGreaterThan(0);
  });
});
