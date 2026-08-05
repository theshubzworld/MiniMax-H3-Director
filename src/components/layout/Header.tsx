import React from 'react';
import { useStudioStore } from '../../store/StudioStore';
import { useHistoryStore } from '../../store/HistoryStore';
import { Video, Undo, Redo, Download, Sparkles, Layout } from 'lucide-react';
import { MiniMaxMode } from '../../types/project';
import { PromptFormatter } from '../../engine/PromptFormatter';

export const Header: React.FC = () => {
  const { project, updateSettings, setMode, activeView, setActiveView } = useStudioStore();
  const { undo, redo, canUndo, canRedo } = useHistoryStore();

  const handleModeChange = (mode: MiniMaxMode) => {
    setMode(mode);
  };

  const handleExportTXT = () => {
    const text = PromptFormatter.toTXT(project);
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.name.toLowerCase().replace(/\s+/g, '_')}_prompt.txt`;
    a.click();
  };

  return (
    <header className="h-16 bg-zinc-950/90 border-b border-zinc-800/80 px-6 flex items-center justify-between backdrop-blur-md sticky top-0 z-40">
      {/* Brand Logo & Name */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 p-0.5 shadow-lg shadow-cyan-500/20">
            <div className="w-full h-full bg-zinc-950 rounded-[10px] flex items-center justify-center">
              <Video className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <div>
            <h1 className="font-extrabold text-base tracking-tight text-white flex items-center gap-2">
              MiniMax H3 <span className="text-xs bg-cyan-950 border border-cyan-500/40 text-cyan-300 px-2 py-0.5 rounded-full font-mono">Prompt Studio</span>
            </h1>
            <input
              type="text"
              value={project.name}
              onChange={(e) => updateSettings({})}
              className="text-xs text-zinc-400 bg-transparent hover:bg-zinc-900 px-1 py-0.5 rounded focus:outline-none focus:bg-zinc-900 border border-transparent hover:border-zinc-800"
            />
          </div>
        </div>

        {/* MiniMax Mode Switcher Badges */}
        <div className="hidden md:flex items-center bg-zinc-900 p-1 rounded-xl border border-zinc-800 gap-1 ml-4">
          {(['T2VA', 'I2VA', 'FL2VA', 'L2VA'] as MiniMaxMode[]).map((m) => {
            const isSelected = project.settings.mode === m;
            return (
              <button
                key={m}
                type="button"
                onClick={() => handleModeChange(m)}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                  isSelected
                    ? 'bg-cyan-500 text-zinc-950 shadow-md shadow-cyan-500/20'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                }`}
              >
                {m}
              </button>
            );
          })}
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-3">
        {/* View Switcher (Wizard vs Studio Editor) */}
        <div className="flex bg-zinc-900 p-1 rounded-xl border border-zinc-800">
          <button
            type="button"
            onClick={() => setActiveView('wizard')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all ${
              activeView === 'wizard'
                ? 'bg-zinc-800 text-cyan-300 border border-cyan-500/30'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Wizard</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveView('studio')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all ${
              activeView === 'studio'
                ? 'bg-zinc-800 text-cyan-300 border border-cyan-500/30'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Layout className="w-3.5 h-3.5" />
            <span>Pro Studio</span>
          </button>
        </div>

        {/* Undo / Redo */}
        <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-xl border border-zinc-800">
          <button
            type="button"
            onClick={() => undo(project)}
            disabled={!canUndo}
            className="p-1.5 text-zinc-400 hover:text-zinc-100 disabled:opacity-30 rounded-lg hover:bg-zinc-800 transition-all"
            title="Undo"
          >
            <Undo className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => redo(project)}
            disabled={!canRedo}
            className="p-1.5 text-zinc-400 hover:text-zinc-100 disabled:opacity-30 rounded-lg hover:bg-zinc-800 transition-all"
            title="Redo"
          >
            <Redo className="w-4 h-4" />
          </button>
        </div>

        {/* Export Button */}
        <button
          type="button"
          onClick={handleExportTXT}
          className="px-3.5 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-zinc-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-cyan-500/20 transition-all"
        >
          <Download className="w-4 h-4" />
          <span>Export TXT</span>
        </button>
      </div>
    </header>
  );
};
