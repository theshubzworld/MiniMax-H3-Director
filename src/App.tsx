import React from 'react';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { PromptInspector } from './components/inspector/PromptInspector';
import { Wizard } from './components/wizard/Wizard';
import { ShotCard } from './components/storyboard/ShotCard';
import { HorizontalTimeline } from './components/storyboard/HorizontalTimeline';
import { DiagnosticsPanel } from './components/inspector/DiagnosticsPanel';
import { TemplateGallery } from './components/templates/TemplateGallery';
import { ComfyUIModal } from './components/comfy/ComfyUIModal';
import { AISettingsPanel } from './components/ai/AISettingsPanel';
import { PromptDiffView } from './components/inspector/PromptDiffView';
import { AudioBuilder } from './components/builders/AudioBuilder';
import { MusicBuilder } from './components/builders/MusicBuilder';
import { SceneCreatorPanel } from './components/scene/SceneCreatorPanel';
import { SceneGalleryView } from './components/gallery/SceneGalleryView';
import { PromptLibraryPanel } from './components/library/PromptLibraryPanel';
import { AIDirectorPanel } from './components/ai/AIDirectorPanel';
import { Sparkles, Video } from 'lucide-react';
import { MiniMaxMode } from './types/project';
import { useStudioStore } from './store/StudioStore';

export const App: React.FC = () => {
  const { project, activeView, diagnostics, addShot, updateShot, removeShot, updateAudio, updateSettings } = useStudioStore();

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-zinc-950 text-zinc-100 selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Header */}
      <Header />

      {/* Main Studio Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Navigation Sidebar */}
        <Sidebar />

        {/* Central Workspace */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6 bg-zinc-950">
          {activeView === 'gemini-director' && (
            <div className="space-y-6 w-full animate-fade-in">
              {/* Standalone Header Banner */}
              <div className="bg-gradient-to-r from-cyan-950/60 via-zinc-900 to-purple-950/40 border border-cyan-500/40 rounded-2xl p-5 flex items-center justify-between shadow-lg shadow-cyan-500/10">
                <div className="space-y-1">
                  <h2 className="text-base font-extrabold text-cyan-300 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
                    <span>Gemini Director AI Standalone Studio</span>
                  </h2>
                  <p className="text-xs text-zinc-300 leading-normal">
                    Single-page AI prompt studio. Type your story concept & click Build — your compiled MiniMax H3 prompt renders live in the right-side Prompt Inspector for instant 1-click copy!
                  </p>
                </div>
                <span className="text-xs bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 px-3.5 py-1.5 rounded-full font-mono font-extrabold shrink-0 hidden sm:inline-flex items-center gap-1.5 shadow-xs">
                  ⚡ 1-Click Live Sidebar Copy
                </span>
              </div>

              {/* MiniMax Mode Specs & Setup */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                  <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-2">
                    <Video className="w-4 h-4 text-cyan-400" />
                    <span>MiniMax H3 Generation Mode Specs</span>
                  </h3>
                  <span className="text-[11px] text-cyan-400 font-mono font-semibold">Active Mode: {project.settings.mode}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  {[
                    { mode: 'T2VA', name: 'Text to Video + Audio', desc: 'No reference image. Builds timeline directly from prompt prose.' },
                    { mode: 'I2VA', name: 'First-Frame I2VA', desc: '<Picture 1> anchors opening frame at 0.00s and develops forward.' },
                    { mode: 'FL2VA', name: 'First & Last Frame', desc: 'Picture 1 (0.00s) to Picture 2 (ending mark) path interpolation.' },
                    { mode: 'L2VA', name: 'Last-Frame L2VA', desc: 'Infers preceding state converging exactly on Picture 1 at the end.' },
                  ].map((m) => {
                    const isSelected = project.settings.mode === m.mode;
                    return (
                      <div
                        key={m.mode}
                        onClick={() => updateSettings({ mode: m.mode as MiniMaxMode })}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-cyan-950/50 border-cyan-500 text-zinc-100 shadow-lg shadow-cyan-500/10 font-bold'
                            : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                        }`}
                      >
                        <span className="text-xs font-bold uppercase text-cyan-400 block mb-1">{m.mode}</span>
                        <h4 className="font-semibold text-xs text-zinc-200">{m.name}</h4>
                        <p className="text-[11px] text-zinc-400 mt-1 leading-normal">{m.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* AIDirectorPanel Standalone Workstation */}
              <AIDirectorPanel />
            </div>
          )}

          {activeView === 'wizard' && <Wizard />}

          {activeView === 'scene-creator' && <SceneCreatorPanel />}

          {activeView === 'scene-gallery' && <SceneGalleryView />}

          {activeView === 'prompt-library' && <PromptLibraryPanel />}

          {activeView === 'storyboard' && (
            <div className="space-y-4 w-full">
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

          {activeView === 'studio' && (
            <div className="space-y-6 w-full">
              <HorizontalTimeline
                shots={project.shots}
                totalDuration={project.settings.durationSeconds}
                onAddShot={() => addShot()}
              />

              <div className="space-y-4">
                <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-wider">
                  Storyboard Shot Nodes ({project.shots.length})
                </h3>
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

              <div className="space-y-4 pt-4 border-t border-zinc-800">
                <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-wider">
                  Audio & Music Orchestration
                </h3>
                <AudioBuilder audio={project.audio} onChange={updateAudio} />
                <MusicBuilder
                  music={project.audio.music}
                  onChange={(music) => updateAudio({ music })}
                />
              </div>
            </div>
          )}

          {activeView === 'diagnostics' && (
            <div className="max-w-3xl mx-auto">
              <DiagnosticsPanel result={diagnostics} />
            </div>
          )}

          {activeView === 'templates' && (
            <div className="max-w-6xl mx-auto">
              <TemplateGallery />
            </div>
          )}

          {activeView === 'comfy' && (
            <div className="max-w-4xl mx-auto">
              <ComfyUIModal />
            </div>
          )}

          {(activeView as any) === 'ai-settings' && (
            <div className="max-w-4xl mx-auto">
              <AISettingsPanel />
            </div>
          )}
        </main>

        {/* Right Live Inspector */}
        <PromptInspector />
      </div>

      {/* Modals & Overlays */}
      <PromptDiffView />
    </div>
  );
};
