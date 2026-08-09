import { create } from 'zustand';
import { StudioProject, MiniMaxMode, AspectRatio, VisualStyle, ReferenceImage, SavedPrompt } from '../types/project';
import { Shot } from '../types/shot';
import { AudioSettings } from '../types/audio';
import { DiagnosticsResult } from '../types/validation';
import { PromptCompiler } from '../engine/PromptCompiler';
import { PromptValidator } from '../engine/PromptValidator';
import { PromptOptimizer } from '../engine/PromptOptimizer';
import { TimelineEngine } from '../engine/TimelineEngine';
import { GeneratedKeyframe } from '../ai/providers/ImageGenProvider';
import { KeyframeStorageService } from '../utils/KeyframeStorageService';
import { TitleGenerator } from '../engine/TitleGenerator';

import userSavedPromptsData from '../data/user_saved_prompts.json';

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
    style: 'Ultra Realistic Photorealism',
    fps: 24,
    resolution: '1080p',
    referenceMode: 'strict',
  },
  references: [],
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
        dialogueText: 'Objective in sight.',
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

export interface DirectorPlanDraft {
  sharedVisualDNA?: any;
  sharedSceneDNA?: any;
  event?: any;
  frame1: string;
  frame2: string;
  gridPrompt?: string;
  idea: string;
  mode: 'pair' | 'single';
}

interface StudioState {
  project: StudioProject;
  currentStep: number;
  activeView: 'wizard' | 'studio' | 'storyboard' | 'diagnostics' | 'templates' | 'comfy' | 'scene-creator' | 'scene-gallery' | 'prompt-library';
  diagnostics: DiagnosticsResult;
  proposedPromptDiff: string | null;
  theme: 'dark' | 'light';
  sceneKeyframes: GeneratedKeyframe[];
  savedPrompts: SavedPrompt[];
  isGeneratingKeyframes: boolean;
  isEnhancingPrompt: boolean;
  generationStatusMessage: string | null;
  directorPlanDraft: DirectorPlanDraft | null;
  activeSceneStep: 1 | 2 | 3;
  directorModel: 'gemini-2.5-pro' | 'gemini-3.5-flash' | 'gemini-2.5-flash';
  directorThinkingBudget: number;
  directorMode: 'strict' | 'balanced' | 'creative';
  systemPromptPreset: 'standard' | 'uncensored_nsfw';
  isInspectorOpen: boolean;
  isInspectorExpanded: boolean;
  inspectorWidth: number;

  // Actions
  toggleInspectorOpen: () => void;
  toggleInspectorExpanded: () => void;
  setInspectorWidth: (width: number) => void;
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
  toggleTheme: () => void;
  setTheme: (theme: 'dark' | 'light') => void;
  addSceneKeyframe: (keyframe: GeneratedKeyframe) => void;
  removeSceneKeyframe: (id: string) => void;
  assignKeyframeToAnchor: (keyframe: GeneratedKeyframe, target: 'first_frame' | 'last_frame' | 'character') => void;
  setGenerationStatus: (status: { isGenerating?: boolean; isEnhancing?: boolean; message?: string | null }) => void;
  setDirectorPlanDraft: (draft: DirectorPlanDraft | null) => void;
  setActiveSceneStep: (step: 1 | 2 | 3) => void;
  setDirectorModel: (model: 'gemini-2.5-pro' | 'gemini-3.5-flash' | 'gemini-2.5-flash') => void;
  setDirectorThinkingBudget: (budget: number) => void;
  setDirectorMode: (mode: 'strict' | 'balanced' | 'creative') => void;
  setSystemPromptPreset: (preset: 'standard' | 'uncensored_nsfw') => void;
  
  // Prompt Library Actions
  savePromptToLibrary: (customPrompt?: Partial<SavedPrompt>) => void;
  deleteSavedPrompt: (id: string) => void;
  toggleFavoritePrompt: (id: string) => void;
  updateSavedPromptTitle: (id: string, newTitle: string) => void;
  loadSavedPromptIntoStudio: (savedPrompt: SavedPrompt) => void;
  importPromptsFromJSON: (jsonString: string) => boolean;
}

// LocalStorage Persistence Helpers
const saveProjectStateToLocalStorage = (
  project: StudioProject,
  directorPlanDraft?: DirectorPlanDraft | null,
  activeView?: string,
  activeSceneStep?: number,
  currentStep?: number
) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('minimax_studio_project', JSON.stringify(project));
    if (directorPlanDraft !== undefined) {
      if (directorPlanDraft) {
        localStorage.setItem('minimax_director_draft', JSON.stringify(directorPlanDraft));
      } else {
        localStorage.removeItem('minimax_director_draft');
      }
    }
    if (activeView) {
      localStorage.setItem('minimax_active_view', activeView);
    }
    if (activeSceneStep) {
      localStorage.setItem('minimax_active_scene_step', String(activeSceneStep));
    }
    if (currentStep) {
      localStorage.setItem('minimax_current_step', String(currentStep));
    }
  } catch (e) {
    console.warn('[StudioStore] Failed to save state to localStorage', e);
  }
};

const loadHydratedProject = (): StudioProject => {
  if (typeof window === 'undefined') {
    const compiled = PromptCompiler.compile(DEFAULT_PROJECT);
    return { ...DEFAULT_PROJECT, compiledPrompt: compiled };
  }
  try {
    const raw = localStorage.getItem('minimax_studio_project');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.settings && parsed.shots) {
        const merged: StudioProject = {
          ...DEFAULT_PROJECT,
          ...parsed,
          settings: { ...DEFAULT_PROJECT.settings, ...parsed.settings },
        };
        const compiled = PromptCompiler.compile(merged);
        return { ...merged, compiledPrompt: compiled };
      }
    }
  } catch (e) {
    console.warn('[StudioStore] Failed to load project state from localStorage', e);
  }
  const compiled = PromptCompiler.compile(DEFAULT_PROJECT);
  return { ...DEFAULT_PROJECT, compiledPrompt: compiled };
};

const loadHydratedDraft = (): DirectorPlanDraft | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('minimax_director_draft');
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return null;
};

const loadHydratedSavedPrompts = (): SavedPrompt[] => {
  let localPrompts: SavedPrompt[] = [];
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem('minimax_saved_prompts');
      if (raw) localPrompts = JSON.parse(raw);
    } catch (e) {}
  }
  const staticPrompts = (userSavedPromptsData as SavedPrompt[]) || [];

  const map = new Map<string, SavedPrompt>();
  [...staticPrompts, ...localPrompts].forEach((p) => {
    if (p && p.compiledPrompt) {
      const key = p.id || p.compiledPrompt.trim();
      if (!map.has(key)) {
        map.set(key, p);
      }
    }
  });

  return Array.from(map.values());
};

const syncSavedPromptsToFile = (prompts: SavedPrompt[]) => {
  if (typeof window === 'undefined') return;
  try {
    fetch('/api/save-prompts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(prompts),
    }).catch(() => {});
  } catch (e) {}
};

const saveSavedPromptsToLocalStorage = (prompts: SavedPrompt[]) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('minimax_saved_prompts', JSON.stringify(prompts));
    syncSavedPromptsToFile(prompts);
  } catch (e) {
    console.warn('[StudioStore] Failed to save savedPrompts to localStorage', e);
  }
};

export const useStudioStore = create<StudioState>((set, get) => {
  const initialProject = loadHydratedProject();
  const initialDiag = PromptValidator.validate(initialProject);
  const initialTheme = (localStorage.getItem('minimax_studio_theme') as 'dark' | 'light') || 'dark';
  const initialDraft = loadHydratedDraft();
  const initialSavedPrompts = loadHydratedSavedPrompts();
  const initialView = (localStorage.getItem('minimax_active_view') as StudioState['activeView']) || 'wizard';
  const initialSceneStep = (Number(localStorage.getItem('minimax_active_scene_step') || 1) as 1 | 2 | 3);
  const initialStep = Number(localStorage.getItem('minimax_current_step') || 1);

  // Hydrate keyframes asynchronously from IndexedDB
  if (typeof window !== 'undefined') {
    KeyframeStorageService.getAllKeyframes().then((loadedKeyframes) => {
      if (loadedKeyframes && loadedKeyframes.length > 0) {
        set({ sceneKeyframes: loadedKeyframes });
      }
    });
  }

  if (typeof document !== 'undefined') {
    document.documentElement.classList.remove('dark', 'light');
    document.documentElement.classList.add(initialTheme);
  }

  return {
    project: initialProject,
    currentStep: initialStep,
    activeView: initialView,
    diagnostics: initialDiag,
    proposedPromptDiff: null,
    theme: initialTheme,
    sceneKeyframes: [],
    savedPrompts: initialSavedPrompts,
    isGeneratingKeyframes: false,
    isEnhancingPrompt: false,
    generationStatusMessage: null,
    directorPlanDraft: initialDraft,
    activeSceneStep: initialSceneStep,
    directorModel: (typeof window !== 'undefined' ? (localStorage.getItem('minimax_director_model') as any) : null) || 'gemini-2.5-pro',
    directorThinkingBudget: typeof window !== 'undefined' && localStorage.getItem('minimax_thinking_budget') !== null ? Number(localStorage.getItem('minimax_thinking_budget')) : 4096,
    directorMode: (typeof window !== 'undefined' ? (localStorage.getItem('minimax_director_mode') as any) : null) || 'balanced',
    systemPromptPreset: (typeof window !== 'undefined' ? (localStorage.getItem('minimax_system_prompt_preset') as any) : null) || 'standard',
    isInspectorOpen: typeof window !== 'undefined' ? localStorage.getItem('minimax_inspector_open') !== 'false' : true,
    isInspectorExpanded: typeof window !== 'undefined' ? localStorage.getItem('minimax_inspector_expanded') === 'true' : false,
    inspectorWidth: typeof window !== 'undefined' && localStorage.getItem('minimax_inspector_width') ? Number(localStorage.getItem('minimax_inspector_width')) : 480,

    setInspectorWidth: (width) => {
      const clamped = Math.max(320, Math.min(850, width));
      if (typeof window !== 'undefined') localStorage.setItem('minimax_inspector_width', String(clamped));
      set({ inspectorWidth: clamped });
    },

    toggleInspectorOpen: () => {
      const nextState = !get().isInspectorOpen;
      if (typeof window !== 'undefined') localStorage.setItem('minimax_inspector_open', String(nextState));
      set({ isInspectorOpen: nextState });
    },

    toggleInspectorExpanded: () => {
      const nextState = !get().isInspectorExpanded;
      if (typeof window !== 'undefined') localStorage.setItem('minimax_inspector_expanded', String(nextState));
      set({ isInspectorExpanded: nextState });
    },

    setDirectorModel: (model) => {
      if (typeof window !== 'undefined') localStorage.setItem('minimax_director_model', model);
      set({ directorModel: model });
    },

    setDirectorThinkingBudget: (budget) => {
      if (typeof window !== 'undefined') localStorage.setItem('minimax_thinking_budget', String(budget));
      set({ directorThinkingBudget: budget });
    },

    setDirectorMode: (mode) => {
      if (typeof window !== 'undefined') localStorage.setItem('minimax_director_mode', mode);
      set({ directorMode: mode });
    },

    setSystemPromptPreset: (preset) => {
      if (typeof window !== 'undefined') localStorage.setItem('minimax_system_prompt_preset', preset);
      set({ systemPromptPreset: preset });
    },

    setDirectorPlanDraft: (draft) => {
      set({ directorPlanDraft: draft });
      const { project, activeView, activeSceneStep, currentStep } = get();
      saveProjectStateToLocalStorage(project, draft, activeView, activeSceneStep, currentStep);
    },

    setActiveSceneStep: (step) => {
      set({ activeSceneStep: step });
      const { project, directorPlanDraft, activeView, currentStep } = get();
      saveProjectStateToLocalStorage(project, directorPlanDraft, activeView, step, currentStep);
    },

    setCurrentStep: (step) => {
      set({ currentStep: step });
      const { project, directorPlanDraft, activeView, activeSceneStep } = get();
      saveProjectStateToLocalStorage(project, directorPlanDraft, activeView, activeSceneStep, step);
    },

    setActiveView: (view) => {
      set({ activeView: view });
      const { project, directorPlanDraft, activeSceneStep, currentStep } = get();
      saveProjectStateToLocalStorage(project, directorPlanDraft, view, activeSceneStep, currentStep);
    },

    setGenerationStatus: (status) => {
      set((state) => ({
        isGeneratingKeyframes: status.isGenerating !== undefined ? status.isGenerating : state.isGeneratingKeyframes,
        isEnhancingPrompt: status.isEnhancing !== undefined ? status.isEnhancing : state.isEnhancingPrompt,
        generationStatusMessage: status.message !== undefined ? status.message : state.generationStatusMessage,
      }));
    },

    setProject: (project) => {
      const dividedShots = TimelineEngine.divideShotsEvenly(project.shots, project.settings.durationSeconds);
      const updated = { ...project, shots: dividedShots };
      set({ project: updated });
      get().recompileAndValidate();
    },

    updateSettings: (newSettings) => {
      const { project } = get();
      const updatedSettings = { ...project.settings, ...newSettings };
      const dividedShots = TimelineEngine.divideShotsEvenly(project.shots, updatedSettings.durationSeconds);

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
      const targetCount = Math.max(1, Math.min(9, count));

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
      if (project.shots.length >= 9) return;
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
      if (project.shots.length <= 1) return;
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

    recompileAndValidate: () => {
      const { project, directorPlanDraft, activeView, activeSceneStep, currentStep } = get();
      const compiled = PromptCompiler.compile(project);
      const updatedProject = { ...project, compiledPrompt: compiled };
      const diag = PromptValidator.validate(updatedProject);
      set({ project: updatedProject, diagnostics: diag });
      saveProjectStateToLocalStorage(updatedProject, directorPlanDraft, activeView, activeSceneStep, currentStep);
    },

    autoFixProject: () => {
      const { project } = get();
      const fixedProject = PromptOptimizer.autoFix(project);
      set({ project: fixedProject });
      get().recompileAndValidate();
    },

    setProposedPromptDiff: (diff) => set({ proposedPromptDiff: diff }),

    toggleTheme: () => {
      const nextTheme = get().theme === 'dark' ? 'light' : 'dark';
      get().setTheme(nextTheme);
    },

    setTheme: (theme) => {
      localStorage.setItem('minimax_studio_theme', theme);
      if (typeof document !== 'undefined') {
        document.documentElement.classList.remove('dark', 'light');
        document.documentElement.classList.add(theme);
      }
      set({ theme });
    },

    addSceneKeyframe: (keyframe) => {
      const { sceneKeyframes } = get();
      const updated = [keyframe, ...sceneKeyframes];
      KeyframeStorageService.saveKeyframe(keyframe);
      set({ sceneKeyframes: updated });
    },

    removeSceneKeyframe: (id) => {
      const { sceneKeyframes } = get();
      const updated = sceneKeyframes.filter((k) => k.id !== id);
      KeyframeStorageService.deleteKeyframe(id);
      set({ sceneKeyframes: updated });
    },

    assignKeyframeToAnchor: (keyframe, target) => {
      const { project, addReference } = get();

      const newRef: ReferenceImage = {
        id: `ref-${Date.now()}`,
        name: keyframe.name,
        url: keyframe.url,
        type: target,
        shotIndex: target === 'first_frame' ? 1 : target === 'last_frame' ? project.shots.length : 1,
        traits: {
          subject: keyframe.prompt,
          environment: keyframe.style,
        },
      };

      if (target === 'first_frame') {
        const filtered = project.references.filter((r) => r.type !== 'first_frame');
        const newMode = project.settings.mode === 'T2VA' ? 'I2VA' : project.settings.mode;
        set({
          project: {
            ...project,
            references: [newRef, ...filtered],
            settings: { ...project.settings, mode: newMode },
          },
        });
        get().recompileAndValidate();
      } else if (target === 'last_frame') {
        const filtered = project.references.filter((r) => r.type !== 'last_frame');
        set({
          project: {
            ...project,
            references: [...filtered, newRef],
            settings: { ...project.settings, mode: 'FL2VA' },
          },
        });
        get().recompileAndValidate();
      } else {
        addReference(newRef);
      }
    },

    savePromptToLibrary: (customPromptData) => {
      const { project, directorPlanDraft, savedPrompts } = get();
      const compiled = customPromptData?.compiledPrompt || project.compiledPrompt || PromptCompiler.compile(project);
      
      if (!compiled || compiled.trim().length === 0) return;

      const idea = customPromptData?.idea || directorPlanDraft?.idea || project.description || 'Custom Director Scene Prompt';
      const rawTitle = customPromptData?.title || (project.name !== 'Cyberpunk Neon Standoff' ? project.name : '');
      const title = rawTitle && rawTitle.trim().length > 0 && !rawTitle.toLowerCase().includes('analyze image')
        ? rawTitle.trim()
        : TitleGenerator.generateCinematicTitle(idea, project.settings.style, project.settings.mode);

      // Deduplicate if identical compiled prompt already exists
      const existingIdx = savedPrompts.findIndex((p) => p.compiledPrompt.trim() === compiled.trim());
      if (existingIdx !== -1) {
        // Already saved, move to top and update title if provided
        const existing = { ...savedPrompts[existingIdx], title };
        const updatedList = [existing, ...savedPrompts.filter((_, i) => i !== existingIdx)];
        set({ savedPrompts: updatedList });
        saveSavedPromptsToLocalStorage(updatedList);
        return;
      }

      const newSavedPrompt: SavedPrompt = {
        id: `prompt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        title,
        idea,
        compiledPrompt: compiled,
        narrativeStyle: customPromptData?.narrativeStyle || project.settings.style,
        mode: customPromptData?.mode || project.settings.mode,
        shotsCount: customPromptData?.shotsCount || project.shots.length,
        durationSeconds: customPromptData?.durationSeconds || project.settings.durationSeconds,
        aspectRatio: customPromptData?.aspectRatio || project.settings.aspectRatio,
        createdAt: new Date().toISOString(),
        isFavorite: false,
        tags: [project.settings.mode, project.settings.style],
      };

      const updated = [newSavedPrompt, ...savedPrompts];
      set({ savedPrompts: updated });
      saveSavedPromptsToLocalStorage(updated);
    },

    deleteSavedPrompt: (id) => {
      const { savedPrompts } = get();
      const updated = savedPrompts.filter((p) => p.id !== id);
      set({ savedPrompts: updated });
      saveSavedPromptsToLocalStorage(updated);
    },

    toggleFavoritePrompt: (id) => {
      const { savedPrompts } = get();
      const updated = savedPrompts.map((p) => (p.id === id ? { ...p, isFavorite: !p.isFavorite } : p));
      set({ savedPrompts: updated });
      saveSavedPromptsToLocalStorage(updated);
    },

    updateSavedPromptTitle: (id, newTitle) => {
      if (!newTitle || !newTitle.trim()) return;
      const { savedPrompts } = get();
      const updated = savedPrompts.map((p) => (p.id === id ? { ...p, title: newTitle.trim() } : p));
      set({ savedPrompts: updated });
      saveSavedPromptsToLocalStorage(updated);
    },

    loadSavedPromptIntoStudio: (savedPrompt) => {
      const { project } = get();
      set({
        project: {
          ...project,
          name: savedPrompt.title,
          description: savedPrompt.idea,
          compiledPrompt: savedPrompt.compiledPrompt,
          settings: {
            ...project.settings,
            mode: savedPrompt.mode,
            style: savedPrompt.narrativeStyle,
            durationSeconds: savedPrompt.durationSeconds || project.settings.durationSeconds,
            aspectRatio: (savedPrompt.aspectRatio as any) || project.settings.aspectRatio,
          },
        },
        activeView: 'studio',
      });
      get().recompileAndValidate();
    },

    importPromptsFromJSON: (jsonString: string) => {
      try {
        const parsed = JSON.parse(jsonString);
        const incoming: SavedPrompt[] = Array.isArray(parsed) ? parsed : [parsed];
        const { savedPrompts } = get();

        const map = new Map<string, SavedPrompt>();
        savedPrompts.forEach((p) => {
          if (p && p.compiledPrompt) {
            const key = p.id || p.compiledPrompt.trim();
            map.set(key, p);
          }
        });

        incoming.forEach((p) => {
          if (p && p.compiledPrompt) {
            const key = p.id || p.compiledPrompt.trim();
            if (!map.has(key)) {
              map.set(key, p);
            }
          }
        });

        const updated = Array.from(map.values());
        set({ savedPrompts: updated });
        saveSavedPromptsToLocalStorage(updated);
        return true;
      } catch (e) {
        console.error('[StudioStore] Failed to import JSON prompts', e);
        return false;
      }
    },
  };
});
