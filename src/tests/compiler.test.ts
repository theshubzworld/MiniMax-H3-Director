import { describe, it, expect } from 'vitest';
import { PromptCompiler } from '../engine/PromptCompiler';
import { PromptValidator } from '../engine/PromptValidator';
import { PromptOptimizer } from '../engine/PromptOptimizer';
import { PromptFormatter } from '../engine/PromptFormatter';
import { FrameMath } from '../engine/FrameMath';
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
        { category: 'footsteps', description: 'wet boot footsteps on metallic grating', enabled: true },
      ],
      music: {
        hasMusic: true,
        genreStyle: 'Dark Cyberpunk Synthwave',
        instrumentation: ['analog synth bass', 'distorted lead keys'],
        tempo: 'energetic',
        dynamics: 'rapid crescendo reaching peak at cut',
        rhythmPattern: 'driving pulse',
        layeringDescription: 'sub-bass layer underneath',
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

  it('should accurately calculate MiniMax H3 17n + 5 frame counts', () => {
    const calc5s = FrameMath.calculateH3Frames(5.0);
    expect(calc5s.frames).toBe(124);
    expect(calc5s.actualSeconds).toBe(5.17);
    expect(calc5s.formula).toBe('17 * 7 + 5 = 124 frames');

    const calc10s = FrameMath.calculateH3Frames(10.0);
    expect(calc10s.frames).toBe(243);
    expect(calc10s.actualSeconds).toBe(10.13);
  });

  it('should format payload for ComfyUI-Pixaroma workflow', () => {
    const pixaromaStr = PromptFormatter.toPixaromaPayload(sampleProject);
    const parsed = JSON.parse(pixaromaStr);
    expect(parsed.node_family).toBe('Pixaroma');
    expect(parsed.video_prompt_node.class_type).toBe('PixaromaVideoPrompt');
    expect(parsed.video_prompt_node.inputs.frame_formula).toBe('17n + 5');
    expect(parsed.audio_sync_node.class_type).toBe('PixaromaH3AudioSync');
  });

  it('should detect banned weak adverbs and auto-fix them', () => {
    const weakProject: StudioProject = {
      ...sampleProject,
      shots: [
        {
          ...sampleProject.shots[0],
          rawActionDescription: 'She gently pushes in and moves slightly toward the altar.',
        },
      ],
    };
    const compiled = PromptCompiler.compile(weakProject);
    const diag = PromptValidator.validate({ ...weakProject, compiledPrompt: compiled });
    const hasAdverbWarning = diag.issues.some((i) => i.ruleName === 'Banned Weak Adverb Detected');
    expect(hasAdverbWarning).toBe(true);

    const fixed = PromptOptimizer.autoFix(weakProject);
    expect(fixed.shots[0].rawActionDescription).not.toContain('gently');
    expect(fixed.shots[0].rawActionDescription).not.toContain('slightly');
    expect(fixed.shots[0].rawActionDescription).toContain('with small amplitude');
  });
});
