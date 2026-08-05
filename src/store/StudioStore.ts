import { create } from 'zustand';
import { StudioProject, MiniMaxMode, AspectRatio, VisualStyle, ReferenceImage } from '../types/project';
import { Shot } from '../types/shot';
import { AudioSettings } from '../types/audio';
import { DiagnosticsResult } from '../types/validation';
import { PromptCompiler } from '../engine/PromptCompiler';
import { PromptValidator } from '../engine/PromptValidator';
import { PromptOptimizer } from '../engine/PromptOptimizer';
import { TimelineEngine } from '../engine/TimelineEngine';

const DEFAULT_PROJECT: StudioProject = {
  id: 'proj-default-01',
  name: 'Cyberpunk Neon Standoff',
  description: 'High-octane anime cyberpunk action scene created with MiniMax H3',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  settings: {
    mode: 'T2VA',
    durationSeconds: 6,
    aspectRatio: '16:9',
    style: '2D Anime',
    fps: 24,
    resolution: '1080p',
  },
  references: [], // Clean empty array by default (no hardcoded reference keyframes)
  shots: [
    {
      id: 'shot-1',
      shotNumber: 1,
      startTimeSeconds: 0,
      durationSeconds: 6,
      transitionToNext: 'none',
      camera: {
        motionType: 'Push In',
        amplitude: 'small amplitude',
        speed: 'slow speed',
        targetSubject: 'her glowing cybernetic eyes',
      },
      character: {
        speakerId: 'S1',
        identity: 'The young female cyborg warrior with a short crimson bob',
        pose: 'low combat stance',
        expression: 'intense, unblinking glare',
        motion: 'slowly raises a glowing plasma katana blade',
      },
      environment: {
        location: 'rain-soaked neo-tokyo alley',
        lighting: 'pulsing cyan neon signs',
        weather: 'heavy steady rain',
        timeOfDay: 'midnight',
        atmosphere: 'gritty, high-voltage suspense',
      },
      dialogue: {
        hasDialogue: true,
        speakerId: 'S1',
        languageTag: 'English',
        dialogueText: 'System online. Objective locked.',
        isOffScreenVoiceover: false,
        lipsClosedDuringVoiceover: false,
        carriesAcrossCut: false,
      },
      rawActionDescription: 'Raindrops sizzle as they strike her energized katana edge.',
    },
  ],
  audio: {
    isSilent: false,
    soundscapeLayers: [
      { category: 'weather', description: 'Heavy rain drumming on metal walkways and buzzing neon hums.', enabled: true },
      { category: 'machinery', description: 'Electrical plasma crackling and servo motor whines.', enabled: true },
      { category: 'footsteps', description: 'Wet boots splashing quickly over puddle-covered pavement.', enabled: true },
    ],
    customSoundscape: '',
    music: {
      hasMusic: true,
      genreStyle: 'Dark Cyberpunk Synthwave',
      instrumentation: ['analog bass synth', 'arpeggiated lead keys', 'distorted industrial drums'],
      tempo: 'fast',
      dynamics: 'rapid crescendo reaching a peak at the cut',
      rhythmPattern: 'driving 140 BPM electronic rhythm',
      layeringDescription: 'Deep sub-bass pad pulsating underneath heavy drum hits.',
    },
  },
  compiledPrompt: '',
};

interface StudioState {
  project: StudioProject;
  currentStep: number;
  activeView: 'wizard' | 'studio' | 'storyboard' | 'diagnostics' | 'templates' | 'comfy';
  diagnostics: DiagnosticsResult;
  proposedPromptDiff: string | null;

  // Actions
  setProject: (project: StudioProject) => void;
  updateSettings: (settings: Partial<StudioProject['settings']>) => void;
  setMode: (mode: MiniMaxMode) => void;
  setShotsCount: (count: number) => void;
  addShot: (shot?: Partial<Shot>) => void;
  updateShot: (index: number, updatedShot: Partial<Shot>) => void;
  removeShot: (index: number) => void;
  reorderShots: (fromIndex: number, toIndex: number) => void;
  addReference: (ref: ReferenceImage) => void;
  removeReference: (id: string) => void;
  clearAllReferences: () => void;
  updateAudio: (audio: Partial<AudioSettings>) => void;
  setCurrentStep: (step: number) => void;
  setActiveView: (view: StudioState['activeView']) => void;
  recompileAndValidate: () => void;
  autoFixProject: () => void;
  setProposedPromptDiff: (diff: string | null) => void;
}

export const useStudioStore = create<StudioState>((set, get) => {
  // Initial compilation
  const initialCompiled = PromptCompiler.compile(DEFAULT_PROJECT);
  const initialProject = { ...DEFAULT_PROJECT, compiledPrompt: initialCompiled };
  const initialDiag = PromptValidator.validate(initialProject);

  return {
    project: initialProject,
    currentStep: 1,
    activeView: 'wizard',
    diagnostics: initialDiag,
    proposedPromptDiff: null,

    setProject: (project) => {
      const dividedShots = TimelineEngine.divideShotsEvenly(project.shots, project.settings.durationSeconds);
      set({ project: { ...project, shots: dividedShots } });
      get().recompileAndValidate();
    },

    updateSettings: (newSettings) => {
      const { project } = get();
      const updatedSettings = { ...project.settings, ...newSettings };
      const dividedShots = TimelineEngine.divideShotsEvenly(project.shots, updatedSettings.durationSeconds);

      // If switching to T2VA, automatically clear reference keyframes
      let updatedRefs = project.references;
      if (newSettings.mode === 'T2VA') {
        updatedRefs = [];
      }

      const updatedProject = {
        ...project,
        settings: updatedSettings,
        references: updatedRefs,
        shots: dividedShots,
        updatedAt: new Date().toISOString(),
      };
      set({ project: updatedProject });
      get().recompileAndValidate();
    },

    setMode: (mode) => {
      const { project } = get();
      const updatedRefs = mode === 'T2VA' ? [] : project.references;

      const updatedProject = {
        ...project,
        settings: { ...project.settings, mode },
        references: updatedRefs,
        updatedAt: new Date().toISOString(),
      };
      set({ project: updatedProject });
      get().recompileAndValidate();
    },

    setShotsCount: (count) => {
      const { project, recompileAndValidate } = get();
      const currentShots = [...project.shots];
      const targetCount = Math.max(1, Math.min(6, count));

      if (currentShots.length === targetCount) return;

      let newShots: Shot[];
      if (currentShots.length > targetCount) {
        newShots = currentShots.slice(0, targetCount);
      } else {
        newShots = [...currentShots];
        while (newShots.length < targetCount) {
          const idx = newShots.length;
          newShots.push({
            id: `shot-${Date.now()}-${idx + 1}`,
            shotNumber: idx + 1,
            startTimeSeconds: 0,
            durationSeconds: 1,
            transitionToNext: 'cut',
            camera: {
              motionType: idx % 2 === 0 ? 'Push In' : 'Arc Shot',
              amplitude: 'medium amplitude',
              speed: 'slow speed',
              targetSubject: 'the primary character',
            },
            character: {
              speakerId: 'S1',
              identity: 'The primary protagonist',
              pose: 'heroic stance',
              expression: 'focused gaze',
              motion: 'moves dynamically',
            },
            environment: {
              location: project.shots[0]?.environment?.location || 'cinematic setting',
              lighting: 'atmospheric lighting',
              weather: 'clear',
            },
            rawActionDescription: `Shot ${idx + 1} action description.`,
          });
        }
      }

      const dividedShots = TimelineEngine.divideShotsEvenly(newShots, project.settings.durationSeconds);
      set({ project: { ...project, shots: dividedShots } });
      recompileAndValidate();
    },

    addShot: (customShot) => {
      const { project } = get();
      if (project.shots.length >= 6) return; // Cap at 6 shots max
      const nextNum = project.shots.length + 1;
      const lastShot = project.shots[project.shots.length - 1];

      const newShot: Shot = {
        id: `shot-${Date.now()}`,
        shotNumber: nextNum,
        startTimeSeconds: 0,
        durationSeconds: 1,
        transitionToNext: 'cut',
        camera: {
          motionType: 'Tracking Shot',
          amplitude: 'medium amplitude',
          speed: 'normal speed',
          targetSubject: 'the subject',
        },
        character: {
          speakerId: 'S1',
          identity: lastShot?.character?.identity || 'The character',
          pose: 'standing pose',
          expression: 'neutral expression',
          motion: 'moves naturally',
        },
        environment: {
          location: lastShot?.environment?.location || 'the scene',
          lighting: 'natural light',
          weather: 'clear',
        },
        rawActionDescription: `Shot ${nextNum} action description...`,
        ...customShot,
      };

      const updatedShots = [...project.shots, newShot];
      const dividedShots = TimelineEngine.divideShotsEvenly(updatedShots, project.settings.durationSeconds);
      set({ project: { ...project, shots: dividedShots } });
      get().recompileAndValidate();
    },

    updateShot: (index, updatedShot) => {
      const { project } = get();
      const newShots = [...project.shots];
      if (index >= 0 && index < newShots.length) {
        newShots[index] = { ...newShots[index], ...updatedShot };
        const dividedShots = TimelineEngine.recalculateShotTimings(newShots);
        set({ project: { ...project, shots: dividedShots } });
        get().recompileAndValidate();
      }
    },

    removeShot: (index) => {
      const { project } = get();
      if (project.shots.length <= 1) return; // Keep at least 1 shot
      const newShots = project.shots.filter((_, idx) => idx !== index);
      const dividedShots = TimelineEngine.divideShotsEvenly(newShots, project.settings.durationSeconds);
      set({ project: { ...project, shots: dividedShots } });
      get().recompileAndValidate();
    },

    reorderShots: (fromIndex, toIndex) => {
      const { project } = get();
      const newShots = [...project.shots];
      const [moved] = newShots.splice(fromIndex, 1);
      newShots.splice(toIndex, 0, moved);
      const dividedShots = TimelineEngine.divideShotsEvenly(newShots, project.settings.durationSeconds);
      set({ project: { ...project, shots: dividedShots } });
      get().recompileAndValidate();
    },

    addReference: (ref) => {
      const { project } = get();
      const updatedRefs = [...project.references, ref];
      set({ project: { ...project, references: updatedRefs } });
      get().recompileAndValidate();
    },

    removeReference: (id) => {
      const { project } = get();
      const updatedRefs = project.references.filter((r) => r.id !== id);
      set({ project: { ...project, references: updatedRefs } });
      get().recompileAndValidate();
    },

    clearAllReferences: () => {
      const { project } = get();
      set({ project: { ...project, references: [] } });
      get().recompileAndValidate();
    },

    updateAudio: (audio) => {
      const { project } = get();
      set({ project: { ...project, audio: { ...project.audio, ...audio } } });
      get().recompileAndValidate();
    },

    setCurrentStep: (currentStep) => set({ currentStep }),
    setActiveView: (activeView) => set({ activeView }),

    recompileAndValidate: () => {
      const { project } = get();
      const compiled = PromptCompiler.compile(project);
      const updatedProject = { ...project, compiledPrompt: compiled };
      const diag = PromptValidator.validate(updatedProject);
      set({ project: updatedProject, diagnostics: diag });
    },

    autoFixProject: () => {
      const { project } = get();
      const fixedProject = PromptOptimizer.autoFix(project);
      set({ project: fixedProject });
      get().recompileAndValidate();
    },

    setProposedPromptDiff: (diff) => set({ proposedPromptDiff: diff }),
  };
});
