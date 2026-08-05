import React from 'react';
import { useStudioStore } from '../../store/StudioStore';
import { Sparkles, Film, ShieldCheck, Grid, Cpu, FolderPlus } from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { activeView, setActiveView, addShot } = useStudioStore();

  return (
    <aside className="w-64 bg-zinc-950 border-r border-zinc-800/80 flex flex-col justify-between h-full flex-shrink-0">
      {/* Top Nav List */}
      <div className="p-4 space-y-6">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 px-3 mb-2 block">
            Studio Views
          </span>
          <nav className="space-y-1">
            <button
              type="button"
              onClick={() => setActiveView('wizard')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeView === 'wizard'
                  ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/10 text-cyan-300 border border-cyan-500/40'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Director Wizard</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveView('storyboard')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeView === 'storyboard'
                  ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/10 text-cyan-300 border border-cyan-500/40'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              <Film className="w-4 h-4 text-purple-400" />
              <span>Visual Storyboard</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveView('diagnostics')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeView === 'diagnostics'
                  ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/10 text-cyan-300 border border-cyan-500/40'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Diagnostics Engine</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveView('templates')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeView === 'templates'
                  ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/10 text-cyan-300 border border-cyan-500/40'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              <Grid className="w-4 h-4 text-amber-400" />
              <span>20+ Template Library</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveView('comfy')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeView === 'comfy'
                  ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/10 text-cyan-300 border border-cyan-500/40'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              <Cpu className="w-4 h-4 text-pink-400" />
              <span>ComfyUI Payload</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveView('ai-settings' as any)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                (activeView as any) === 'ai-settings'
                  ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/10 text-cyan-300 border border-cyan-500/40'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>AI Director Settings</span>
            </button>
          </nav>
        </div>

        {/* Quick Actions */}
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 px-3 mb-2 block">
            Quick Actions
          </span>
          <button
            type="button"
            onClick={() => addShot()}
            className="w-full border border-dashed border-zinc-800 hover:border-cyan-500/50 hover:bg-zinc-900 text-zinc-300 py-2 rounded-xl text-xs font-medium flex items-center justify-center gap-2 transition-all"
          >
            <FolderPlus className="w-4 h-4 text-cyan-400" />
            <span>Add New Shot Node</span>
          </button>
        </div>
      </div>

      {/* Footer Specs info */}
      <div className="p-4 border-t border-zinc-900 bg-zinc-900/30">
        <div className="text-[11px] text-zinc-400 space-y-1">
          <p className="font-semibold text-zinc-200">MiniMax H3 Engine v1.0</p>
          <p>Native Stereo Audio Sync</p>
          <p className="text-[10px] text-cyan-400 font-mono">T2VA / I2VA / FL2VA / L2VA</p>
        </div>
      </div>
    </aside>
  );
};
