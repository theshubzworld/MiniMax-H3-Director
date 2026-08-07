import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useStudioStore, DirectorPlanDraft } from '../../store/StudioStore';
import { ImageGenProvider, NanoBananaModel, GeneratedKeyframe } from '../../ai/providers/ImageGenProvider';
import { AspectRatio, VisualStyle, ALL_VISUAL_STYLES, SceneGridLayout, QualityResolution } from '../../types/project';
import {
  Film,
  Sparkles,
  Loader2,
  Download,
  Trash2,
  Check,
  ArrowRight,
  Lightbulb,
  Image as ImageIcon,
  Eye,
  X,
  Lock,
  Layers,
  UploadCloud,
  Sliders,
  Zap,
  ShieldCheck,
  Cpu,
  Copy,
  Palette,
  Grid,
  RefreshCw,
  CheckCircle2,
  ChevronRight,
  Maximize2,
} from 'lucide-react';

const NANO_BANANA_MODELS: { id: NanoBananaModel; name: string; badge: string; desc: string }[] = [
  {
    id: 'gemini-3.1-flash-image',
    name: 'Nano Banana 2 (Flash Image 3.1)',
    badge: '4K WORKHORSE',
    desc: 'High fidelity, ultra-fast generation, and photorealistic 4K visual consistency.',
  },
  {
    id: 'gemini-3.1-flash-lite-image',
    name: 'Nano Banana 2 Lite',
    badge: 'ULTRA-FAST',
    desc: 'Rapid iteration draft engine with minimal latency.',
  },
  {
    id: 'gemini-3-pro-image',
    name: 'Nano Banana Pro (Gemini 3 Pro)',
    badge: 'CINEMA PRO',
    desc: 'High spatial precision and complex multi-character scene layout.',
  },
  {
    id: 'gemini-2.5-flash-image',
    name: 'Nano Banana 1 (Flash Image 2.5)',
    badge: 'CLASSIC',
    desc: 'Reliable classic Gemini image generation model.',
  },
];

interface SeedPreset {
  label: string;
  category: 'action' | 'realism' | 'scifi' | 'fantasy';
  prompt: string;
}

const SCENE_SEED_PRESETS: SeedPreset[] = [
  { label: '📸 Viral iPhone Mirror Selfie', category: 'realism', prompt: 'Casual vertical smartphone mirror selfie in a dimly lit aesthetic room, direct flash glare, slightly imperfect candid posture, oversized hoodie.' },
  { label: '🗡️ Cyborg Katana Rain Standoff', category: 'action', prompt: 'A young female cyborg warrior drawing her glowing plasma katana in a rain-soaked neon Neo-Tokyo alleyway as emergency sirens flash.' },
  { label: '🏎️ Hypercar Night Drift Glow', category: 'action', prompt: 'A sleek matte-black futuristic hypercar drifting through a damp cyberpunk highway tunnel at high speed with cyan neon light trails.' },
  { label: '🌌 Deep Space Monolith Discovery', category: 'scifi', prompt: 'An astronaut in a high-tech white spacesuit discovering a glowing crystalline monolith on an unknown alien moon surface under twin suns.' },
  { label: '🕶️ Cyber-Samurai Awakening', category: 'action', prompt: 'A chrome cybernetic warrior kneeling on a rooftop in neo-tokyo as heavy steady rain drips down his energized visor armor.' },
  { label: '🌅 80s Synthwave Sunset Coast', category: 'scifi', prompt: 'A retro sports car driving along a palm tree coastline towards a colossal glowing synthwave grid sun at golden hour dusk.' },
  { label: '👗 High Fashion Runway Stare', category: 'realism', prompt: 'A supermodel wearing an avant-garde glowing iridescent gown striding down a minimalist glass runway under dramatic spotlight rays.' },
  { label: '🥋 Ancient Temple Bamboo Showdown', category: 'action', prompt: 'Two martial arts masters facing off in a mist-covered bamboo forest at twilight as autumn cherry blossom leaves swirl in the wind.' },
  { label: '🐉 Mystical Crimson Dragon Rider', category: 'fantasy', prompt: 'A dragon rider flying atop an armored crimson dragon soaring through stormy cloudscapes above an ancient mountain fortress.' },
  { label: '🦇 Dark Gothic Vampire Cathedral', category: 'fantasy', prompt: 'A dark gothic vampire noble in a velvet cloak standing inside an ancient ruined cathedral with moonlight streaming through stained glass.' },
  { label: '🌺 Bioluminescent Alien Jungle', category: 'fantasy', prompt: 'A slender glowing alien emissary touching a giant pulsating bioluminescent flower inside an enchanted alien valley at twilight.' },
  { label: '🔥 Post-Apocalyptic Wasteland Hero', category: 'action', prompt: 'A lone scavenger standing on a mountain of rusty scrap metal looking out over a desolate post-apocalyptic desert under a blood red sky.' },
  { label: '⚡ Matrix Bullet-Time Martial Arts', category: 'action', prompt: 'A trenchcoat-clad hero frozen mid-air dodging a glowing plasma projectile with distorted motion blur trails.' },
  { label: '🏖️ Golden Hour Sunset Silhouette', category: 'realism', prompt: 'A serene figure walking along a tropical ocean shore with soft waves reflecting golden orange sunset light.' },
  { label: '🧜‍♀️ Bioluminescent Mermaid Realm', category: 'fantasy', prompt: 'An ethereal underwater mermaid swimming through a glowing deep-sea coral reef with shimmering light motes.' },
  { label: '🤖 Mecha Robot Hangar Activation', category: 'scifi', prompt: 'A giant 50-foot combat mecha robot powering up inside a dark industrial military bay as sparks fly from its armor plates.' },
];

export const SceneCreatorPanel: React.FC = () => {
  const {
    project,
    sceneKeyframes,
    addSceneKeyframe,
    removeSceneKeyframe,
    assignKeyframeToAnchor,
    setActiveView,
    updateSettings,
    isGeneratingKeyframes,
    isEnhancingPrompt,
    generationStatusMessage,
    setGenerationStatus,
    directorPlanDraft,
    setDirectorPlanDraft,
    activeSceneStep,
    setActiveSceneStep,
  } = useStudioStore();

  const [activeTab, setActiveTab] = useState<'pair' | 'single'>('pair');
  const [prompt, setPrompt] = useState(() => localStorage.getItem('minimax_h3_scene_prompt') || (directorPlanDraft?.idea || ''));
  const [model, setModel] = useState<NanoBananaModel>('gemini-3.1-flash-image');
  const style = project.settings.style || 'Ultra Realistic Photorealism';
  const aspectRatio = project.settings.aspectRatio || '16:9';
  const [gridLayout, setGridLayout] = useState<SceneGridLayout>('2x1_dual');
  const [qualityResolution, setQualityResolution] = useState<QualityResolution>('4K');

  const [anchorIntent, setAnchorIntent] = useState<'first_frame' | 'last_frame' | 'character'>('first_frame');
  const [autoEnhancePrompt, setAutoEnhancePrompt] = useState(true);
  const [directorModel, setDirectorModel] = useState<'gemini-2.5-pro' | 'gemini-3.5-flash'>('gemini-2.5-pro');
  const [refImage, setRefImage] = useState<string | undefined>(undefined);
  const [styleRefImage, setStyleRefImage] = useState<string | undefined>(undefined);
  const [assignedStatus, setAssignedStatus] = useState<string | null>(null);
  const [previewKeyframe, setPreviewKeyframe] = useState<GeneratedKeyframe | null>(null);
  const [presetCategory, setPresetCategory] = useState<'all' | 'action' | 'realism' | 'scifi' | 'fantasy'>('all');
  const [isCopiedPrompt, setIsCopiedPrompt] = useState(false);
  const [autoSaveLocally, setAutoSaveLocally] = useState(true);

  // Editable fields for Step 2 Director Review
  const [editableFrame1, setEditableFrame1] = useState(directorPlanDraft?.frame1 || '');
  const [editableFrame2, setEditableFrame2] = useState(directorPlanDraft?.frame2 || '');

  // Resolution support mapping per model
  const isLiteModel = model === 'gemini-3.1-flash-lite-image';
  const is05KSupported = model === 'gemini-3.1-flash-image';
  const is2KSupported = model !== 'gemini-3.1-flash-lite-image';
  const is4KSupported = model !== 'gemini-3.1-flash-lite-image';

  const currentMode = project.settings.mode || 'FL2VA';
  const isPairModeActive = currentMode === 'FL2VA' && activeTab === 'pair';

  // Synchronize active tab and default anchor intent when current project mode changes
  useEffect(() => {
    if (currentMode !== 'FL2VA') {
      setActiveTab('single');
    } else {
      setActiveTab('pair');
    }

    if (currentMode === 'L2VA') {
      setAnchorIntent('last_frame');
    } else {
      setAnchorIntent('first_frame');
    }
  }, [currentMode]);

  useEffect(() => {
    if (directorPlanDraft) {
      setEditableFrame1(directorPlanDraft.frame1);
      setEditableFrame2(directorPlanDraft.frame2);
    }
  }, [directorPlanDraft]);

  // Auto-fallback resolution when switching to a model with restricted resolutions
  useEffect(() => {
    if (!is4KSupported && qualityResolution === '4K') {
      setQualityResolution('1K');
    } else if (!is2KSupported && qualityResolution === '2K') {
      setQualityResolution('1K');
    } else if (!is05KSupported && qualityResolution === '0.5K') {
      setQualityResolution('1K');
    }
  }, [model, is05KSupported, is2KSupported, is4KSupported, qualityResolution]);

  const handleCopyPrompt = (text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopiedPrompt(true);
    setTimeout(() => setIsCopiedPrompt(false), 3000);
  };

  const handleRefImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          setRefImage(ev.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveRefImage = () => {
    setRefImage(undefined);
  };

  const handleStyleRefImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          setStyleRefImage(ev.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveStyleRefImage = () => {
    setStyleRefImage(undefined);
  };

  // PASS 1: Generate & Plan Director Prompts (Step 1 -> Step 2)
  const handlePlanPrompts = async () => {
    if (!prompt.trim() || isGeneratingKeyframes) return;

    setGenerationStatus({
      isGenerating: true,
      isEnhancing: true,
      message: `Gemini ${directorModel === 'gemini-3.5-flash' ? '3.5 Flash' : '2.5 Pro'} Director Planning ${isPairModeActive ? 'Dual Keyframe Pair' : 'Single Keyframe'} & Expanded Prompts...`,
    });

    try {
      if (!isPairModeActive) {
        const enhancedPrompt = await ImageGenProvider.enhancePromptForImage(
          prompt.trim(),
          style,
          aspectRatio,
          refImage,
          undefined,
          styleRefImage,
          qualityResolution,
          directorModel,
          currentMode
        );

        let finalSinglePrompt = enhancedPrompt;
        if (gridLayout === '2x2_grid') {
          finalSinglePrompt = `2x2 4-Image Grid Layout composite showing 4 sequential action camera angles of: ${enhancedPrompt}`;
        } else if (gridLayout === '3x3_grid') {
          finalSinglePrompt = `3x3 9-Frame Storyboard Pre-Vis Grid Layout [1][2][3]/[4][5][6]/[7][8][9] showing: ${enhancedPrompt}`;
        }

        const draft: DirectorPlanDraft = {
          idea: prompt.trim(),
          mode: 'single',
          frame1: finalSinglePrompt,
          frame2: '',
          sharedSceneDNA: { location: 'Selected Scene', cameraLanguage: 'Cinematic Framing' },
        };

        setDirectorPlanDraft(draft);
        setEditableFrame1(finalSinglePrompt);
        setEditableFrame2('');
      } else {
        const pairPlan = await ImageGenProvider.planKeyframePairPrompts({
          idea: prompt.trim(),
          model,
          style,
          aspectRatio,
          mode: currentMode,
          referenceImage: refImage,
          styleReferenceImage: styleRefImage,
          gridLayout,
          qualityResolution,
        }, undefined, directorModel);

        const draft: DirectorPlanDraft = {
          idea: prompt.trim(),
          mode: 'pair',
          sharedVisualDNA: pairPlan.visualDNA,
          sharedSceneDNA: pairPlan.sceneDNA,
          frame1: pairPlan.prompt1,
          frame2: pairPlan.prompt2,
        };

        setDirectorPlanDraft(draft);
        setEditableFrame1(pairPlan.prompt1);
        setEditableFrame2(pairPlan.prompt2);
      }

      setActiveSceneStep(2);
    } catch (e) {
      console.error('[SceneCreatorPanel] Director planning pass failed', e);
    } finally {
      setGenerationStatus({ isGenerating: false, isEnhancing: false, message: null });
    }
  };

  const handleRegenerateTweak = async () => {
    if (isGeneratingKeyframes) return;
    setEditableFrame1((prev) => `${prev} Cinematic alternate angle, dynamic volumetric lighting variation, high optical clarity.`);
    if (editableFrame2) {
      setEditableFrame2((prev) => `${prev} Cinematic alternate angle, dynamic volumetric lighting variation, high optical clarity.`);
    }
    setTimeout(() => {
      handleRenderApprovedImages();
    }, 100);
  };

  // PASS 2: Render Approved Images using Google Nano Banana (Step 2 -> Step 3)
  const handleRenderApprovedImages = async () => {
    if (isGeneratingKeyframes) return;

    setGenerationStatus({
      isGenerating: true,
      isEnhancing: false,
      message: `Google Nano Banana Rendering Approved ${qualityResolution} Images...`,
    });

    try {
      let p1 = (editableFrame1 || prompt.trim()).trim();
      let p2 = (editableFrame2 || '').trim();

      // Enforce Grid Directive Prepend if selected
      if (gridLayout === '2x2_grid') {
        if (!p1.includes('[2x2 FOUR-PANEL COMPOSITE GRID LAYOUT]')) {
          p1 = `[2x2 FOUR-PANEL COMPOSITE GRID LAYOUT] Create a 2x2 grid (Top-Left, Top-Right, Bottom-Left, Bottom-Right) showing 4 sequential action panels. ${p1}`;
        }
        if (p2 && !p2.includes('[2x2 FOUR-PANEL COMPOSITE GRID LAYOUT]')) {
          p2 = `[2x2 FOUR-PANEL COMPOSITE GRID LAYOUT] Create a 2x2 grid (Top-Left, Top-Right, Bottom-Left, Bottom-Right) showing 4 sequential action panels. ${p2}`;
        }
      } else if (gridLayout === '3x3_grid') {
        if (!p1.includes('[3x3 NINE-FRAME STORYBOARD PRE-VIS GRID LAYOUT]')) {
          p1 = `[3x3 NINE-FRAME STORYBOARD PRE-VIS GRID LAYOUT] Create a 3x3 nine-panel grid labeled [1][2][3] / [4][5][6] / [7][8][9] displaying 9-frame sequential story progression. ${p1}`;
        }
        if (p2 && !p2.includes('[3x3 NINE-FRAME STORYBOARD PRE-VIS GRID LAYOUT]')) {
          p2 = `[3x3 NINE-FRAME STORYBOARD PRE-VIS GRID LAYOUT] Create a 3x3 nine-panel grid labeled [1][2][3] / [4][5][6] / [7][8][9] displaying 9-frame sequential story progression. ${p2}`;
        }
      }

      if (!isPairModeActive || !p2) {
        const result = await ImageGenProvider.generateKeyframe({
          prompt: p1,
          model,
          style,
          aspectRatio,
          referenceImage: refImage,
          styleReferenceImage: styleRefImage,
          autoEnhancePrompt: false,
          qualityResolution,
        });

        addSceneKeyframe(result);
        const targetAnchor = currentMode === 'L2VA' ? 'last_frame' : 'first_frame';
        assignKeyframeToAnchor(result, targetAnchor);

        if (autoSaveLocally) {
          handleDownload(result);
        }

        setActiveSceneStep(3);
        setAssignedStatus(`🎬 Keyframe rendered & assigned to <Picture 1>! (${currentMode} Mode)`);
      } else {
        const [firstKeyframe, lastKeyframe] = await Promise.all([
          ImageGenProvider.generateKeyframe({
            prompt: p1,
            model,
            style,
            aspectRatio,
            referenceImage: refImage,
            styleReferenceImage: styleRefImage,
            autoEnhancePrompt: false,
            qualityResolution,
          }),
          ImageGenProvider.generateKeyframe({
            prompt: p2,
            model,
            style,
            aspectRatio,
            referenceImage: refImage,
            styleReferenceImage: styleRefImage,
            autoEnhancePrompt: false,
            qualityResolution,
          }),
        ]);

        addSceneKeyframe(firstKeyframe);
        addSceneKeyframe(lastKeyframe);

        assignKeyframeToAnchor(firstKeyframe, 'first_frame');
        assignKeyframeToAnchor(lastKeyframe, 'last_frame');

        if (autoSaveLocally) {
          handleDownload(firstKeyframe);
          setTimeout(() => handleDownload(lastKeyframe), 300);
        }

        setActiveSceneStep(3);
        setAssignedStatus(`🎬 Keyframe pair rendered & assigned to <Picture 1> & <Picture 2>! (FL2VA Mode)`);
      }

      setTimeout(() => setAssignedStatus(null), 5000);
    } catch (e) {
      console.error('[SceneCreatorPanel] Nano Banana image render failed', e);
    } finally {
      setGenerationStatus({ isGenerating: false, isEnhancing: false, message: null });
    }
  };

  const handleAssign = (keyframe: GeneratedKeyframe, target: 'first_frame' | 'last_frame' | 'character') => {
    assignKeyframeToAnchor(keyframe, target);
    setAssignedStatus(`Assigned to ${target === 'first_frame' ? '<Picture 1>' : target === 'last_frame' ? '<Picture 2>' : 'Character Anchor'}!`);
    setTimeout(() => setAssignedStatus(null), 4000);
  };

  const handleDownload = (keyframe: GeneratedKeyframe) => {
    const a = document.createElement('a');
    a.href = keyframe.url;
    a.download = keyframe.name.endsWith('.png') ? keyframe.name : `${keyframe.name}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDownloadAll = () => {
    sceneKeyframes.forEach((kf, idx) => {
      setTimeout(() => handleDownload(kf), idx * 250);
    });
  };

  const filteredPresets = SCENE_SEED_PRESETS.filter(
    (p) => presetCategory === 'all' || p.category === presetCategory
  );

  return (
    <div className="space-y-6">
      {/* Workstation Top Banner */}
      <div className="bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-1.5">
              <div className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3 h-3" /> 3-Step Guided Director Studio
              </div>
              <span className="text-xs text-zinc-400 font-mono">Nano Banana Engine</span>
            </div>

            <h2 className="text-xl font-extrabold text-zinc-100 flex items-center gap-2">
              <ImageIcon className="w-6 h-6 text-amber-400" />
              Scene Creator & AI Keyframe Workstation
            </h2>
            <p className="text-xs text-zinc-400 max-w-2xl mt-1 leading-relaxed">
              {currentMode === 'I2VA'
                ? 'Design photorealistic 4K AI opening keyframes (<Picture 1> @ 0.00s) with locked character and environmental continuity for MiniMax H3 I2VA First Frame mode.'
                : currentMode === 'L2VA'
                ? 'Design photorealistic 4K AI ending keyframes (<Picture 1> @ Ending) with locked character and environmental continuity for MiniMax H3 L2VA Last Frame mode.'
                : currentMode === 'T2VA'
                ? 'Design photorealistic 4K AI concept keyframes / pre-vis storyboard grids for MiniMax H3 T2VA Text-to-Video mode.'
                : 'Design photorealistic 4K AI keyframe pairs with 100% character and environmental continuity for MiniMax H3 FL2VA mode.'}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setActiveView('wizard')}
            className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 border border-zinc-700 shadow-md"
          >
            <span>Return to Director Wizard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Assigned Status Toast */}
      {assignedStatus && (
        <div className="bg-emerald-950/90 border border-emerald-500/50 text-emerald-200 px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-2.5 shadow-xl animate-in fade-in slide-in-from-top-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>{assignedStatus}</span>
        </div>
      )}

      {/* 3-STEP COMPACT STEPPER NAVIGATION BAR */}
      <div className="flex flex-col sm:flex-row items-center gap-2 bg-zinc-900/80 p-2 rounded-xl border border-zinc-800/80">
        {[
          { step: 1, title: 'Step 1: Setup & References', desc: 'Grid, Model & Reference Uploads' },
          { step: 2, title: 'Step 2: Director Prompt Review', desc: 'Preview & Edit Expanded Prompts' },
          { step: 3, title: 'Step 3: 4K Render & Gallery', desc: 'Nano Banana Image Render' },
        ].map((s) => {
          const isActive = activeSceneStep === s.step;
          const isDone = activeSceneStep > s.step;
          return (
            <div
              key={s.step}
              onClick={() => setActiveSceneStep(s.step as 1 | 2 | 3)}
              className={`flex-1 w-full px-3 py-2 rounded-lg border cursor-pointer transition-all flex items-center gap-2.5 ${
                isActive
                  ? 'bg-amber-950/50 border-amber-500 text-zinc-100 shadow-md shadow-amber-500/10'
                  : isDone
                  ? 'bg-zinc-950 border-emerald-500/50 text-zinc-300'
                  : 'bg-zinc-950/60 border-zinc-800/60 text-zinc-500 hover:border-zinc-700'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-lg font-mono text-[11px] font-bold flex items-center justify-center flex-shrink-0 ${
                  isActive
                    ? 'bg-amber-500 text-zinc-950'
                    : isDone
                    ? 'bg-emerald-500 text-zinc-950'
                    : 'bg-zinc-800 text-zinc-400'
                }`}
              >
                {isDone ? <Check className="w-3.5 h-3.5" /> : s.step}
              </div>
              <div className="truncate">
                <span className="text-[11px] font-bold block truncate">{s.title}</span>
                <span className="text-[9px] text-zinc-400 block truncate">{s.desc}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* STEP 1: MODE, REFERENCES, GRID LAYOUT & SPEC SETUP                        */}
      {/* ========================================================================= */}
      {activeSceneStep === 1 && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-5 shadow-xl">
          {/* Mode Selector Tabs */}
          <div className="flex items-center gap-3 border-b border-zinc-800 pb-3.5">
            <button
              type="button"
              onClick={() => {
                setActiveTab('pair');
                if (currentMode !== 'FL2VA') {
                  updateSettings({ mode: 'FL2VA' });
                }
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                activeTab === 'pair' && currentMode === 'FL2VA'
                  ? 'bg-amber-500 text-zinc-950 shadow-lg shadow-amber-500/20'
                  : 'bg-zinc-950 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
              }`}
            >
              <Film className="w-4 h-4" />
              <span>🎬 Dual Keyframe Director (FL2VA Pair)</span>
              {currentMode === 'FL2VA' ? (
                <span className="px-1.5 py-0.5 bg-amber-950 border border-amber-500/40 text-amber-300 rounded text-[10px] uppercase font-mono font-bold">Active Mode</span>
              ) : (
                <span className="px-1.5 py-0.5 bg-zinc-900 text-zinc-500 rounded text-[10px] font-mono">Switches to FL2VA</span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('single')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                activeTab === 'single' || currentMode !== 'FL2VA'
                  ? 'bg-cyan-500 text-zinc-950 shadow-lg shadow-cyan-500/20'
                  : 'bg-zinc-950 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>
                {currentMode === 'I2VA'
                  ? '✨ Single Keyframe (<Picture 1> @ 0.00s First Frame)'
                  : currentMode === 'L2VA'
                  ? '✨ Single Keyframe (<Picture 1> @ Ending Mark Last Frame)'
                  : currentMode === 'T2VA'
                  ? '✨ Single Keyframe (T2VA Pre-Vis Concept)'
                  : '✨ Single Keyframe Generator'}
              </span>
              {currentMode !== 'FL2VA' && (
                <span className="px-1.5 py-0.5 bg-cyan-950 border border-cyan-500/40 text-cyan-300 rounded text-[10px] uppercase font-mono font-bold">{currentMode} Active</span>
              )}
            </button>
          </div>

          {/* Compact 5-Column Studio Controls Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 bg-zinc-950/80 p-3.5 rounded-xl border border-zinc-800/80">
            <div>
              <label className="text-[11px] text-zinc-400 font-bold mb-1 block flex items-center justify-between">
                <span>Nano Banana AI Engine</span>
                <span className="text-[9px] text-amber-400 font-mono">Vertex AI</span>
              </label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value as NanoBananaModel)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-2.5 py-1.5 text-xs text-amber-300 font-bold focus:outline-none focus:border-amber-500/50 truncate cursor-pointer"
              >
                {NANO_BANANA_MODELS.map((m) => (
                  <option key={m.id} value={m.id} className="bg-zinc-900 text-zinc-100 py-1 font-sans">
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] text-zinc-400 font-bold mb-1 block flex items-center gap-1">
                <Grid className="w-3 h-3 text-amber-400" />
                Image Grid Layout
              </label>
              <select
                value={gridLayout}
                onChange={(e) => setGridLayout(e.target.value as SceneGridLayout)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-amber-500/50 truncate cursor-pointer"
              >
                <option value="single" className="bg-zinc-900 text-zinc-100 py-1 font-sans">Single Keyframe</option>
                <option value="2x1_dual" className="bg-zinc-900 text-zinc-100 py-1 font-sans">2x1 Dual Grid</option>
                <option value="2x2_grid" className="bg-zinc-900 text-zinc-100 py-1 font-sans">2x2 4-Image Grid</option>
                <option value="3x3_grid" className="bg-zinc-900 text-zinc-100 py-1 font-sans">3x3 Storyboard Grid</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] text-zinc-400 font-bold mb-1 block flex items-center gap-1">
                <Zap className="w-3 h-3 text-cyan-400" />
                Quality & Resolution
              </label>
              <select
                value={qualityResolution}
                onChange={(e) => setQualityResolution(e.target.value as QualityResolution)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-amber-500/50 truncate cursor-pointer"
              >
                <option value="4K" disabled={!is4KSupported} className={!is4KSupported ? 'bg-zinc-950 text-zinc-600 font-sans' : 'bg-zinc-900 text-zinc-100 py-1 font-sans'}>
                  4K (4096px Master) {!is4KSupported ? '— N/A Lite' : ''}
                </option>
                <option value="2K" disabled={!is2KSupported} className={!is2KSupported ? 'bg-zinc-950 text-zinc-600 font-sans' : 'bg-zinc-900 text-zinc-100 py-1 font-sans'}>
                  2K (2048px High Res) {!is2KSupported ? '— N/A Lite' : ''}
                </option>
                <option value="1K" className="bg-zinc-900 text-zinc-100 py-1 font-sans">
                  1K (1024px Standard)
                </option>
                <option value="0.5K" disabled={!is05KSupported} className={!is05KSupported ? 'bg-zinc-950 text-zinc-600 font-sans' : 'bg-zinc-900 text-zinc-100 py-1 font-sans'}>
                  0.5K (512px Draft) {!is05KSupported ? '— Flash 3.1 Only' : ''}
                </option>
              </select>
            </div>

            <div>
              <label className="text-[11px] text-zinc-400 font-bold mb-1 block">Visual Style</label>
              <select
                value={style}
                onChange={(e) => updateSettings({ style: e.target.value as VisualStyle })}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-amber-500/50 truncate cursor-pointer"
              >
                {ALL_VISUAL_STYLES.map((st) => (
                  <option key={st} value={st} className="bg-zinc-900 text-zinc-100 py-1 font-sans">
                    {st}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] text-zinc-400 font-bold mb-1 block">Aspect Ratio</label>
              <select
                value={aspectRatio}
                onChange={(e) => updateSettings({ aspectRatio: e.target.value as AspectRatio })}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-amber-500/50 cursor-pointer"
              >
                {['16:9', '9:16', '1:1', '2.39:1', '21:9', '4:3', '3:4', '3:2', '2:3', '4:5', '5:4'].map((ar) => (
                  <option key={ar} value={ar} className="bg-zinc-900 text-zinc-100 py-1 font-sans">
                    {ar}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Dual Reference Image Upload Cards (Subject & Style Reference) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Subject Reference Image */}
            <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-zinc-300 flex items-center gap-2">
                  <UploadCloud className="w-4 h-4 text-amber-400" />
                  Subject Reference (Character Likeness)
                </label>

                {refImage && (
                  <span className="text-[9px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-500/40 px-2 py-0.5 rounded-full flex items-center gap-1 font-mono">
                    <Lock className="w-3 h-3" /> IDENTITY LOCKED
                  </span>
                )}
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleRefImageUpload}
                  className="text-xs text-zinc-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-zinc-800 file:text-zinc-200 hover:file:bg-zinc-700 cursor-pointer w-full sm:w-auto"
                />

                {refImage && (
                  <div className="flex items-center gap-2.5 bg-zinc-900 border border-zinc-800 p-1.5 rounded-xl">
                    <img src={refImage} alt="Ref Subject Thumbnail" className="w-9 h-9 object-cover rounded-lg border border-zinc-700" />
                    <div>
                      <span className="text-[10px] text-zinc-200 font-bold block">Subject Loaded</span>
                      <button
                        type="button"
                        onClick={handleRemoveRefImage}
                        className="text-[9px] text-rose-400 hover:underline flex items-center gap-1 mt-0.5"
                      >
                        <Trash2 className="w-2.5 h-2.5" /> Remove
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Style Reference Image */}
            <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-zinc-300 flex items-center gap-2">
                  <Palette className="w-4 h-4 text-cyan-400" />
                  Style Reference (Aesthetic & Lighting)
                </label>

                {styleRefImage && (
                  <span className="text-[9px] font-bold text-cyan-400 bg-cyan-950/80 border border-cyan-500/40 px-2 py-0.5 rounded-full flex items-center gap-1 font-mono">
                    <Lock className="w-3 h-3" /> STYLE LOCKED
                  </span>
                )}
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleStyleRefImageUpload}
                  className="text-xs text-zinc-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-zinc-800 file:text-zinc-200 hover:file:bg-zinc-700 cursor-pointer w-full sm:w-auto"
                />

                {styleRefImage && (
                  <div className="flex items-center gap-2.5 bg-zinc-900 border border-zinc-800 p-1.5 rounded-xl">
                    <img src={styleRefImage} alt="Ref Style Thumbnail" className="w-9 h-9 object-cover rounded-lg border border-zinc-700" />
                    <div>
                      <span className="text-[10px] text-zinc-200 font-bold block">Style Loaded</span>
                      <button
                        type="button"
                        onClick={handleRemoveStyleRefImage}
                        className="text-[9px] text-rose-400 hover:underline flex items-center gap-1 mt-0.5"
                      >
                        <Trash2 className="w-2.5 h-2.5" /> Remove
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Viral Preset Seeds */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs text-zinc-400 font-medium flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                Famous Viral Scene Idea Seeds
              </label>

              <div className="flex items-center gap-1">
                {[
                  { id: 'all', name: 'All (16)' },
                  { id: 'action', name: '🔥 Action' },
                  { id: 'realism', name: '📸 Realism' },
                  { id: 'scifi', name: '🚀 Sci-Fi' },
                  { id: 'fantasy', name: '🐉 Fantasy' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setPresetCategory(cat.id as any)}
                    className={`px-2 py-0.5 text-[10px] rounded-lg border transition-all ${
                      presetCategory === cat.id
                        ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 font-bold'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {filteredPresets.map((seed) => (
                <button
                  key={seed.label}
                  type="button"
                  onClick={() => {
                    setPrompt(seed.prompt);
                    localStorage.setItem('minimax_h3_scene_prompt', seed.prompt);
                  }}
                  className="px-2.5 py-1 text-[11px] bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 hover:border-amber-500/40 text-zinc-300 rounded-lg transition-all"
                >
                  {seed.label}
                </button>
              ))}
            </div>
          </div>

          {/* Prompt Textarea */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs text-zinc-400 font-medium block">
                {activeTab === 'pair'
                  ? 'Scene Transformation Arc Idea (Frame 1 -> Action -> Frame 2 Resolution)'
                  : 'Visual Keyframe Description Prompt'}
              </label>
              <div className="flex items-center gap-2">
                {prompt.trim() && (
                  <button
                    type="button"
                    onClick={() => {
                      setPrompt('');
                      localStorage.removeItem('minimax_h3_scene_prompt');
                    }}
                    className="text-[11px] text-red-400 hover:text-red-300 font-semibold px-2.5 py-0.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 transition-all flex items-center gap-1 cursor-pointer shadow-xs"
                    title="Clear Prompt Idea"
                  >
                    <Trash2 className="w-3 h-3 text-red-400" />
                    <span>Clear Prompt</span>
                  </button>
                )}
                <span className="text-[10px] text-zinc-500 font-mono">{prompt.length} chars</span>
              </div>
            </div>
            <textarea
              rows={3}
              value={prompt}
              onChange={(e) => {
                const val = e.target.value;
                setPrompt(val);
                localStorage.setItem('minimax_h3_scene_prompt', val);
              }}
              placeholder={
                activeTab === 'pair'
                  ? 'e.g. Corporate executive inside glass atrium transforms into futuristic superhero during a sudden explosion...'
                  : 'e.g. A young female cyborg warrior drawing her glowing plasma katana in a rain-soaked neon Neo-Tokyo alleyway...'
              }
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3.5 text-xs text-zinc-200 focus:outline-none focus:border-amber-500/50 font-mono leading-relaxed shadow-inner"
            />
          </div>

          {/* Toggles */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="auto-enhance-toggle"
                checked={autoEnhancePrompt}
                onChange={(e) => setAutoEnhancePrompt(e.target.checked)}
                className="w-4 h-4 rounded border-zinc-700 bg-zinc-950 text-amber-500 focus:ring-amber-500/20 cursor-pointer"
              />
              <label htmlFor="auto-enhance-toggle" className="text-xs text-zinc-300 font-semibold cursor-pointer flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Auto-Enhance Prompt via Gemini 3.5 Flash / 2.5 Pro AI Director Engine
              </label>
            </div>

          {/* Director Planning Model Selector */}
          {autoEnhancePrompt && (
            <div className="flex items-center gap-2 mt-2">
              <Cpu className="w-3.5 h-3.5 text-violet-400 flex-shrink-0" />
              <span className="text-[11px] text-zinc-400 font-semibold">Director Engine:</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  id="director-model-pro"
                  onClick={() => setDirectorModel('gemini-2.5-pro')}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border transition-all ${
                    directorModel === 'gemini-2.5-pro'
                      ? 'bg-violet-500/30 border-violet-500/60 text-violet-300'
                      : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:border-zinc-600'
                  }`}
                >
                  Gemini 2.5 Pro
                </button>
                <button
                  type="button"
                  id="director-model-flash"
                  onClick={() => setDirectorModel('gemini-3.5-flash')}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border transition-all ${
                    directorModel === 'gemini-3.5-flash'
                      ? 'bg-cyan-500/30 border-cyan-500/60 text-cyan-300'
                      : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:border-zinc-600'
                  }`}
                >
                  3.5 Flash ⚡
                </button>
              </div>
              <span className="text-[10px] text-zinc-600 hidden sm:inline">
                {directorModel === 'gemini-2.5-pro' ? '(Highest quality, slower)' : '(Fastest, high quality)'}
              </span>
            </div>
          )}

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="auto-save-toggle"
                checked={autoSaveLocally}
                onChange={(e) => setAutoSaveLocally(e.target.checked)}
                className="w-4 h-4 rounded border-zinc-700 bg-zinc-950 text-emerald-500 focus:ring-emerald-500/20 cursor-pointer"
              />
              <label htmlFor="auto-save-toggle" className="text-xs text-zinc-200 font-bold cursor-pointer flex items-center gap-1.5">
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                Auto-Save Images Locally (Auto-Download 4K PNG)
              </label>
            </div>
          </div>

          {/* Step 1 Action Button */}
          <div className="pt-3 border-t border-zinc-800 flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={handlePlanPrompts}
              disabled={isGeneratingKeyframes || !prompt.trim()}
              className="px-6 py-3 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-zinc-950 font-extrabold rounded-xl text-xs flex items-center gap-2.5 shadow-xl shadow-amber-500/20 disabled:opacity-40 transition-all w-full sm:w-auto"
            >
              {isGeneratingKeyframes ? <Loader2 className="w-4 h-4 animate-spin" /> : <Film className="w-4 h-4" />}
              <span>
                {generationStatusMessage
                  ? generationStatusMessage
                  : currentMode === 'I2VA'
                  ? '🎬 Step 1 Pass: Plan First Frame (<Picture 1> @ 0.00s) Prompt'
                  : currentMode === 'L2VA'
                  ? '🎬 Step 1 Pass: Plan Last Frame (<Picture 1> @ Ending) Prompt'
                  : currentMode === 'T2VA'
                  ? '🎬 Step 1 Pass: Plan Pre-Vis Concept Prompt'
                  : isPairModeActive
                  ? '🎬 Step 1 Pass: Plan FL2VA Keyframe Pair Prompts & Shared DNA (Proceed to Step 2)'
                  : '🎬 Step 1 Pass: Plan Single Keyframe Prompt'}
              </span>
            </button>

            <div className="hidden sm:flex items-center gap-2 text-[11px] text-zinc-400 font-mono">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Target: {qualityResolution.toUpperCase()} • {aspectRatio}</span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 2: DIRECTOR PROMPT REVIEW & REGENERATION SCREEN (PASS 1 PREVIEW)     */}
      {/* ========================================================================= */}
      {activeSceneStep === 2 && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-6 shadow-xl animate-in fade-in">
          <div className="bg-amber-950/40 border border-amber-500/40 p-4 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                  Gemini Director Pass 1 Complete: Review Expanded Prompts
                </h3>
                <p className="text-xs text-zinc-400">
                  Inspect or tweak the generated prompt text below before rendering final 4K images with Nano Banana.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handlePlanPrompts}
              disabled={isGeneratingKeyframes}
              className="px-3.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-amber-300 text-xs font-bold rounded-xl flex items-center gap-1.5 border border-zinc-700 transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingKeyframes ? 'animate-spin' : ''}`} />
              <span>🔄 Regenerate Prompts</span>
            </button>
          </div>

          {/* DNA Summary */}
          {directorPlanDraft?.sharedVisualDNA && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-zinc-950 p-4 rounded-xl border border-zinc-800 text-xs font-mono">
              <div>
                <span className="text-amber-400 font-bold block mb-1">🔒 Locked Visual Identity DNA:</span>
                <p className="text-zinc-300">{JSON.stringify(directorPlanDraft.sharedVisualDNA)}</p>
              </div>
              <div>
                <span className="text-cyan-400 font-bold block mb-1">🎬 Locked Shared Scene DNA:</span>
                <p className="text-zinc-300">{JSON.stringify(directorPlanDraft.sharedSceneDNA)}</p>
              </div>
            </div>
          )}

          {/* Frame Prompts */}
          {isPairModeActive && editableFrame2 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-bold text-amber-400 mb-2 block flex items-center justify-between">
                  <span>Frame 1 Expanded Visual Prompt (&lt;Picture 1&gt; @ 0.00s)</span>
                  <span className="text-[10px] text-zinc-500 font-mono">{editableFrame1.length} chars</span>
                </label>
                <textarea
                  rows={6}
                  value={editableFrame1}
                  onChange={(e) => setEditableFrame1(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3.5 text-xs text-zinc-200 font-mono leading-relaxed focus:outline-none focus:border-amber-500/50 shadow-inner"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-cyan-400 mb-2 block flex items-center justify-between">
                  <span>Frame 2 Expanded Visual Prompt (&lt;Picture 2&gt; @ Ending)</span>
                  <span className="text-[10px] text-zinc-500 font-mono">{editableFrame2.length} chars</span>
                </label>
                <textarea
                  rows={6}
                  value={editableFrame2}
                  onChange={(e) => setEditableFrame2(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3.5 text-xs text-zinc-200 font-mono leading-relaxed focus:outline-none focus:border-cyan-500/50 shadow-inner"
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="text-xs font-bold text-amber-400 mb-2 block flex items-center justify-between">
                <span>
                  {currentMode === 'I2VA'
                    ? 'Frame 1 Expanded Visual Prompt (<Picture 1> @ 0.00s First Frame)'
                    : currentMode === 'L2VA'
                    ? 'Frame 1 Expanded Visual Prompt (<Picture 1> @ Ending Mark Last Frame)'
                    : currentMode === 'T2VA'
                    ? 'Single Keyframe Visual Prompt (Text-to-Video Concept Frame)'
                    : 'Single Keyframe Visual Prompt (<Picture 1>)'}
                </span>
                <span className="text-[10px] text-zinc-500 font-mono">{editableFrame1.length} chars</span>
              </label>
              <textarea
                rows={7}
                value={editableFrame1}
                onChange={(e) => setEditableFrame1(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3.5 text-xs text-zinc-200 font-mono leading-relaxed focus:outline-none focus:border-amber-500/50 shadow-inner"
              />
            </div>
          )}

          {/* Step 2 Action Buttons */}
          <div className="pt-4 border-t border-zinc-800 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setActiveSceneStep(1)}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold rounded-xl text-xs transition-all"
            >
              ⬅️ Back to Setup (Step 1)
            </button>

            <button
              type="button"
              onClick={handleRenderApprovedImages}
              disabled={isGeneratingKeyframes}
              className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-zinc-950 font-extrabold rounded-xl text-xs flex items-center gap-2.5 shadow-xl shadow-emerald-500/20 disabled:opacity-40 transition-all"
            >
              {isGeneratingKeyframes ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>🚀 Approve & Render {qualityResolution} Keyframe Images (Proceed to Step 3)</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 3: IMAGE RENDER & GALLERY (PASS 2 OUTPUT)                            */}
      {/* ========================================================================= */}
      {activeSceneStep === 3 && (
        <div className="space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <h3 className="text-sm font-bold text-zinc-200 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-amber-400" />
              Generated Scene Keyframe Gallery ({sceneKeyframes.length})
            </h3>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleRegenerateTweak}
                disabled={isGeneratingKeyframes}
                className="px-3.5 py-1.5 bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-zinc-950 text-xs font-bold rounded-xl flex items-center gap-1.5 border border-amber-500/40 transition-all shadow-md"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingKeyframes ? 'animate-spin' : ''}`} />
                <span>🔄 Regenerate Keyframes (Tweak Prompt)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveSceneStep(2)}
                className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold rounded-xl border border-zinc-700"
              >
                ✏️ Edit Director Prompts (Step 2)
              </button>

              {sceneKeyframes.length > 0 && (
                <button
                  type="button"
                  onClick={handleDownloadAll}
                  className="px-3.5 py-1.5 bg-zinc-800 hover:bg-emerald-500 hover:text-zinc-950 text-emerald-300 text-xs font-bold rounded-xl flex items-center gap-1.5 border border-zinc-700 transition-all shadow-md"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Save All Images Locally ({sceneKeyframes.length} PNGs)</span>
                </button>
              )}
            </div>
          </div>

          {sceneKeyframes.length === 0 ? (
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-10 text-center space-y-3">
              <Film className="w-10 h-10 text-zinc-600 mx-auto" />
              <h4 className="text-sm font-bold text-zinc-300">No generated keyframes yet</h4>
              <p className="text-xs text-zinc-400 max-w-md mx-auto">
                Go to Step 1 & Step 2 above to plan and approve your 4K keyframe prompts!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sceneKeyframes.map((kf) => (
                <div
                  key={kf.id}
                  className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl group hover:border-amber-500/50 transition-all"
                >
                  <div
                    className="relative aspect-video bg-zinc-950 overflow-hidden cursor-pointer group/img"
                    onClick={() => setPreviewKeyframe(kf)}
                  >
                    <img src={kf.url} alt={kf.name} className="w-full h-full object-contain group-hover/img:scale-105 transition-transform duration-300" />
                    <div className="absolute top-3 left-3 bg-zinc-950/80 backdrop-blur-md border border-zinc-800 text-[10px] text-amber-400 font-mono px-2 py-0.5 rounded-full font-bold">
                      {kf.aspectRatio} • {kf.model}
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewKeyframe(kf);
                      }}
                      className="absolute top-3 right-3 p-2 bg-zinc-950/80 hover:bg-amber-500 hover:text-zinc-950 text-zinc-300 rounded-xl backdrop-blur-md transition-all shadow-md"
                      title="Inspect HD Preview"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="p-4 space-y-3">
                    <p className="text-xs text-zinc-300 font-mono line-clamp-2 leading-relaxed">{kf.prompt}</p>

                    <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleAssign(kf, 'first_frame')}
                          className="px-2.5 py-1.2 bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-zinc-950 text-[10px] font-bold rounded-lg border border-amber-500/40 transition-all"
                        >
                          &lt;Picture 1&gt;
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAssign(kf, 'last_frame')}
                          className="px-2.5 py-1.2 bg-cyan-500/20 hover:bg-cyan-500 text-cyan-300 hover:text-zinc-950 text-[10px] font-bold rounded-lg border border-cyan-500/40 transition-all"
                        >
                          &lt;Picture 2&gt;
                        </button>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleDownload(kf)}
                          className="p-1.5 bg-zinc-800 hover:bg-emerald-500 hover:text-zinc-950 text-zinc-300 rounded-lg transition-all"
                          title="Download PNG"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeSceneKeyframe(kf.id)}
                          className="p-1.5 bg-zinc-800 hover:bg-rose-500 hover:text-white text-zinc-400 rounded-lg transition-all"
                          title="Delete Keyframe"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* FULLSCREEN PREVIEW MODAL */}
      {previewKeyframe &&
        ReactDOM.createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md animate-in fade-in">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-4xl w-full overflow-hidden shadow-2xl space-y-4 p-6 relative">
              <button
                type="button"
                onClick={() => setPreviewKeyframe(null)}
                className="absolute top-4 right-4 p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl transition-all"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="aspect-video bg-zinc-950 rounded-xl overflow-hidden border border-zinc-800">
                <img src={previewKeyframe.url} alt="Preview" className="w-full h-full object-contain" />
              </div>

              <div className="space-y-2">
                <p className="text-xs text-zinc-300 font-mono bg-zinc-950 p-3.5 rounded-xl border border-zinc-800 leading-relaxed">
                  {previewKeyframe.prompt}
                </p>

                <div className="flex justify-between items-center pt-2">
                  <button
                    type="button"
                    onClick={() => handleCopyPrompt(previewKeyframe.prompt)}
                    className="px-3 py-1.5 bg-zinc-800 hover:bg-amber-500 hover:text-zinc-950 text-zinc-200 text-xs font-bold rounded-xl flex items-center gap-1.5"
                  >
                    <Copy className="w-4 h-4" /> {isCopiedPrompt ? 'Copied!' : 'Copy Prompt'}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDownload(previewKeyframe)}
                    className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold rounded-xl flex items-center gap-1.5"
                  >
                    <Download className="w-4 h-4" /> Download 4K PNG
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};
