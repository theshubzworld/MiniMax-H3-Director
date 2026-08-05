import React from 'react';
import { useStudioStore } from '../../store/StudioStore';
import { ShotCard } from '../storyboard/ShotCard';
import { HorizontalTimeline } from '../storyboard/HorizontalTimeline';
import { AudioBuilder } from '../builders/AudioBuilder';
import { MusicBuilder } from '../builders/MusicBuilder';
import { AIDirectorPanel } from '../ai/AIDirectorPanel';
import { Video, ArrowRight, ArrowLeft } from 'lucide-react';
import { MiniMaxMode, AspectRatio, VisualStyle } from '../../types/project';

export const Wizard: React.FC = () => {
  const { project, currentStep, setCurrentStep, updateSettings, addShot, updateShot, removeShot, updateAudio } =
    useStudioStore();

  const nextStep = () => setCurrentStep(Math.min(4, currentStep + 1));
  const prevStep = () => setCurrentStep(Math.max(1, currentStep - 1));

  return (
    <div className="space-y-6">
      {/* 4-Step Wizard Progress Bar */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-center justify-between">
        {[
          { num: 1, title: '1. Visuals & Keyframes' },
          { num: 2, title: '2. Storyboard' },
          { num: 3, title: '3. Audio & Music' },
          { num: 4, title: '4. Review & Export' },
        ].map((s) => {
          const isActive = currentStep === s.num;
          const isDone = currentStep > s.num;

          return (
            <div
              key={s.num}
              onClick={() => setCurrentStep(s.num)}
              className={`flex items-center gap-2 cursor-pointer transition-all ${
                isActive
                  ? 'text-cyan-400 font-bold'
                  : isDone
                  ? 'text-emerald-400 font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono font-bold ${
                  isActive
                    ? 'bg-cyan-500 text-zinc-950 shadow-md shadow-cyan-500/20'
                    : isDone
                    ? 'bg-emerald-950 border border-emerald-500 text-emerald-300'
                    : 'bg-zinc-800 text-zinc-400'
                }`}
              >
                {s.num}
              </div>
              <span className="text-xs hidden md:inline">{s.title}</span>
            </div>
          );
        })}
      </div>

      {/* Step 1: Visuals, Specs, Presets, Keyframe Upload & Gemini Director */}
      {currentStep === 1 && (
        <div className="space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-6">
            <div>
              <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
                <Video className="w-5 h-5 text-cyan-400" />
                Step 1: MiniMax H3 Mode Specs & Visual Setup
              </h2>
              <p className="text-xs text-zinc-400">
                Select your generation mode, video duration, and aesthetic style before building your storyboard.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {[
                { mode: 'T2VA', name: 'Text to Video + Audio', desc: 'No reference image. Builds timeline directly from prompt prose.' },
                { mode: 'I2VA', name: 'First-Frame I2VA', desc: '<Picture 1> anchors opening frame at 0.00s and develops forward.' },
                { mode: 'FL2VA', name: 'First & Last Frame', desc: 'Picture 1 (0.00s) to Picture 2 (ending mark) continuous path interpolation.' },
                { mode: 'L2VA', name: 'Last-Frame L2VA', desc: 'Infers preceding state converging exactly on Picture 1 at the end.' },
              ].map((m) => {
                const isSelected = project.settings.mode === m.mode;
                return (
                  <div
                    key={m.mode}
                    onClick={() => updateSettings({ mode: m.mode as MiniMaxMode })}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-cyan-950/50 border-cyan-500 text-zinc-100 shadow-lg shadow-cyan-500/10'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <span className="text-xs font-bold uppercase text-cyan-400 block mb-1">{m.mode}</span>
                    <h4 className="font-semibold text-sm text-zinc-200">{m.name}</h4>
                    <p className="text-xs text-zinc-400 mt-1">{m.desc}</p>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-zinc-400 font-medium mb-1 block">Aesthetic Visual Style</label>
                <select
                  value={project.settings.style}
                  onChange={(e) => updateSettings({ style: e.target.value as VisualStyle })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-cyan-500/50"
                >
                  {[
                    'Cinematic',
                    'Live-action',
                    '2D Anime',
                    '3D CG Animation',
                    'Luxury Fashion',
                    'Cyberpunk',
                    'Film Noir',
                    'Claymation',
                    'Watercolor',
                    'Vintage 35mm',
                    'Documentary',
                    'Ultra-Realistic Photorealism',
                    'Dark Fantasy',
                    'Sci-Fi Cyber-Noir',
                    'Vaporwave / Synthwave',
                    'Retro 80s VHS',
                    'Hyper-Detailed 8K Uncut',
                    'Isometric Low-Poly',
                    'Chibi / Kawaii Anime',
                    'Noir Neo-Realism',
                    'Watercolor Sketch',
                    'Surrealist Dreamscape',
                    'Retro Comic Book / Manga',
                    'Horror Gothic',
                    'Architectural Minimalist',
                    'IMAX High-Frame Rate',
                    'Unreal Engine 5 Realtime Render',
                  ].map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-zinc-400 font-medium mb-1 block">Effective Video Duration (Seconds)</label>
                <input
                  type="number"
                  value={project.settings.durationSeconds}
                  onChange={(e) => updateSettings({ durationSeconds: parseFloat(e.target.value) || 6 })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-cyan-500/50"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 font-medium mb-1 block">Aspect Ratio</label>
                <select
                  value={project.settings.aspectRatio}
                  onChange={(e) => updateSettings({ aspectRatio: e.target.value as AspectRatio })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-cyan-500/50"
                >
                  {['16:9', '9:16', '1:1', '2.39:1', '4:3'].map((ar) => (
                    <option key={ar} value={ar}>
                      {ar}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <AIDirectorPanel />
        </div>
      )}

      {/* Step 2: Storyboard & Timeline */}
      {currentStep === 2 && (
        <div className="space-y-4">
          <HorizontalTimeline
            shots={project.shots}
            totalDuration={project.settings.durationSeconds}
            onAddShot={() => addShot()}
          />
          <div className="space-y-4">
            {project.shots.map((shot, idx) => (
              <ShotCard
                key={shot.id}
                shot={shot}
                index={idx}
                totalShots={project.shots.length}
                onUpdate={(updated) => updateShot(idx, updated)}
                onRemove={() => removeShot(idx)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Audio & Music */}
      {currentStep === 3 && (
        <div className="space-y-4">
          <AudioBuilder audio={project.audio} onChange={updateAudio} />
          <MusicBuilder
            music={project.audio.music}
            onChange={(music) => updateAudio({ music })}
          />
        </div>
      )}

      {/* Step 4: Review & Export */}
      {currentStep === 4 && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-bold text-zinc-100">Step 4: Review Compiled MiniMax H3 Prompt</h2>
          <p className="text-xs text-zinc-400">Your prompt has been compiled adhering 100% to MiniMax specifications.</p>
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 font-mono text-xs text-cyan-300 whitespace-pre-wrap">
            {project.compiledPrompt}
          </div>
        </div>
      )}

      {/* Navigation Toolbar */}
      <div className="flex items-center justify-between border-t border-zinc-800 pt-4">
        <button
          type="button"
          onClick={prevStep}
          disabled={currentStep === 1}
          className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 disabled:opacity-30 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>

        <button
          type="button"
          onClick={nextStep}
          disabled={currentStep === 4}
          className="px-5 py-2 bg-cyan-500 hover:bg-cyan-400 text-zinc-950 rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-lg shadow-cyan-500/20 transition-all"
        >
          <span>{currentStep === 3 ? 'Review Final Prompt' : 'Next Step'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
