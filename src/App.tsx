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
              {/* Sleek Compact Studio Header & MiniMax Mode Switcher */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0 shadow-sm">
                    <Sparkles className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <h2 className="text-sm font-extrabold text-zinc-100 flex items-center gap-2">
                      <span>Gemini Director AI Studio</span>
                      <span className="text-[10px] bg-cyan-950 border border-cyan-500/30 text-cyan-300 px-2 py-0.5 rounded-full font-mono font-bold">
                        H3 Engine
                      </span>
                    </h2>
                    <p className="text-xs text-zinc-400">
                      Single-page prompt studio with live timeline orchestration, 4K keyframes, and real-time inspector copy.
                    </p>
                  </div>
                </div>

                {/* Compact Mode Switcher Bar */}
                <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800 shrink-0">
                  {[
                    { mode: 'T2VA', label: 'T2VA (Text)', desc: 'Text to Video' },
                    { mode: 'I2VA', label: 'I2VA (First Frame)', desc: 'First Frame Anchor' },
                    { mode: 'FL2VA', label: 'FL2VA (First & Last)', desc: 'First & Last Frame' },
                    { mode: 'L2VA', label: 'L2VA (Last Frame)', desc: 'Last Frame Anchor' },
                  ].map((m) => {
                    const isSelected = project.settings.mode === m.mode;
                    return (
                      <button
                        key={m.mode}
                        type="button"
                        onClick={() => updateSettings({ mode: m.mode as MiniMaxMode })}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                          isSelected
                            ? 'bg-cyan-500 text-zinc-950 shadow-md shadow-cyan-500/20 font-extrabold'
                            : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                        }`}
                        title={m.desc}
                      >
                        <span>{m.label}</span>
                      </button>
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
