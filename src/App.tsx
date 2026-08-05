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
import { useStudioStore } from './store/StudioStore';

export const App: React.FC = () => {
  const { project, activeView, diagnostics, addShot, updateShot, removeShot, updateAudio } = useStudioStore();

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
          {activeView === 'wizard' && <Wizard />}

          {activeView === 'storyboard' && (
            <div className="space-y-4 max-w-5xl mx-auto">
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
            <div className="space-y-6 max-w-5xl mx-auto">
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
