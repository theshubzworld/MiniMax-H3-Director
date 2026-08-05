import React from 'react';
import { useStudioStore } from '../../store/StudioStore';
import { useHistoryStore } from '../../store/HistoryStore';
import { Video, Undo, Redo, Download, Sparkles, Layout, Sun, Moon, Film } from 'lucide-react';
import { MiniMaxMode } from '../../types/project';
import { PromptFormatter } from '../../engine/PromptFormatter';

export const Header: React.FC = () => {
  const { project, setProject, updateSettings, setMode, activeView, setActiveView, theme, toggleTheme } = useStudioStore();
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
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 p-0.5 shadow-lg shadow-cyan-500/20 flex-shrink-0">
            <div className="w-full h-full bg-zinc-950 rounded-[10px] flex items-center justify-center">
              <Video className="w-5 h-5 text-cyan-400" />
            </div>
          </div>

          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-sm sm:text-base tracking-tight text-zinc-100 flex items-center gap-1.5">
                MiniMax H3 <span className="text-[10px] bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/40 text-cyan-300 px-2 py-0.5 rounded-full font-mono font-bold tracking-wider">DIRECTOR</span>
              </h1>
            </div>

            <div className="flex items-center gap-2 mt-0.5">
              <div className="flex items-center gap-1 text-zinc-400 hover:text-zinc-200 transition-colors">
                <Film className="w-3 h-3 text-cyan-400 flex-shrink-0" />
                <input
                  type="text"
                  value={project.name}
                  onChange={(e) => setProject({ ...project, name: e.target.value })}
                  placeholder="Untitled Project"
                  className="text-[11px] font-medium text-zinc-300 hover:text-zinc-100 focus:text-zinc-100 bg-transparent hover:bg-zinc-900/60 px-1 py-0.2 rounded focus:outline-none focus:bg-zinc-900 border border-transparent hover:border-zinc-800 transition-all w-36 sm:w-48 truncate"
                  title="Click to edit project name"
                />
              </div>

              <span className="text-[10px] text-zinc-400 font-mono hidden xl:inline-flex items-center gap-1 bg-zinc-900/80 px-2 py-0.2 rounded border border-zinc-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                {project.shots.length} Shots • {project.settings.durationSeconds}s • {project.settings.mode}
              </span>
            </div>
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

        {/* Light / Dark Theme Toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          className="p-2 bg-zinc-900 border border-zinc-800 hover:border-cyan-500/50 text-zinc-300 hover:text-cyan-400 rounded-xl transition-all shadow-sm"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-cyan-500" />}
        </button>

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
