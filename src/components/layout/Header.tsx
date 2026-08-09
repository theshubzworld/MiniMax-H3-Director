import React from 'react';
import { useStudioStore } from '../../store/StudioStore';
import { useHistoryStore } from '../../store/HistoryStore';
import {
  Undo2, Redo2, Download, Sparkles, LayoutDashboard, Sun, Moon,
  Coffee, PanelRight, Maximize2, Minimize2, Clapperboard,
} from 'lucide-react';
import { MiniMaxMode } from '../../types/project';
import { PromptFormatter } from '../../engine/PromptFormatter';

const MODE_LABELS: Record<MiniMaxMode, string> = {
  T2VA:  'T2V',
  I2VA:  'I2V',
  FL2VA: 'FL2V',
  L2VA:  'L2V',
};

export const Header: React.FC = () => {
  const {
    project,
    setProject,
    setMode,
    activeView,
    setActiveView,
    theme,
    toggleTheme,
    isInspectorOpen,
    toggleInspectorOpen,
    isInspectorExpanded,
    toggleInspectorExpanded,
  } = useStudioStore();
  const { undo, redo, canUndo, canRedo } = useHistoryStore();

  const handleExportTXT = () => {
    const text = PromptFormatter.toTXT(project);
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.name.toLowerCase().replace(/\s+/g, '_')}_prompt.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <header className="h-14 bg-zinc-950 border-b border-zinc-800/60 px-4 flex items-center justify-between gap-4 sticky top-0 z-40 backdrop-blur-xl">

      {/* ── LEFT: Brand ── */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <img
          src="/favicon.svg"
          alt="MiniMax H3 Director"
          className="w-8 h-8 rounded-lg shadow-lg shadow-cyan-500/20 flex-shrink-0"
        />
        <div className="flex flex-col leading-none gap-0.5">
          <span className="font-black text-[13px] tracking-tight text-white">MiniMax H3</span>
          <span className="font-mono font-bold text-[9px] tracking-[0.2em] text-cyan-400 uppercase">Director</span>
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-zinc-800 mx-1 hidden sm:block" />

        {/* Stats pill */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[10px] font-mono text-zinc-500">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>{project.shots.length} shots</span>
          <span className="text-zinc-700">·</span>
          <span>{project.settings.durationSeconds}s</span>
          <span className="text-zinc-700">·</span>
          <span className="text-cyan-500 font-bold">{MODE_LABELS[project.settings.mode as MiniMaxMode] ?? project.settings.mode}</span>
        </div>
      </div>

      {/* ── CENTER: View Switcher ── */}
      <div className="flex-1 flex items-center justify-center">
        <nav className="flex items-center bg-zinc-900 border border-zinc-800 rounded-xl p-1 gap-0.5" aria-label="View switcher">

          {/* Gemini AI */}
          <button
            type="button"
            id="view-tab-gemini"
            onClick={() => setActiveView('gemini-director')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 cursor-pointer ${
              activeView === 'gemini-director'
                ? 'bg-gradient-to-r from-cyan-500/20 to-blue-600/10 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/60'
            }`}
          >
            <Sparkles className={`w-3.5 h-3.5 flex-shrink-0 ${activeView === 'gemini-director' ? 'text-cyan-400' : 'text-zinc-600'}`} />
            <span>Gemini AI</span>
          </button>

          {/* Wizard */}
          <button
            type="button"
            id="view-tab-wizard"
            onClick={() => setActiveView('wizard')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 cursor-pointer ${
              activeView === 'wizard'
                ? 'bg-zinc-800 text-violet-300 border border-violet-500/30 shadow-sm'
                : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/60'
            }`}
          >
            <Clapperboard className={`w-3.5 h-3.5 flex-shrink-0 ${activeView === 'wizard' ? 'text-violet-400' : 'text-zinc-600'}`} />
            <span>Wizard</span>
          </button>

          {/* Pro Studio */}
          <button
            type="button"
            id="view-tab-studio"
            onClick={() => setActiveView('studio')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 cursor-pointer ${
              activeView === 'studio'
                ? 'bg-zinc-800 text-sky-300 border border-sky-500/30 shadow-sm'
                : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/60'
            }`}
          >
            <LayoutDashboard className={`w-3.5 h-3.5 flex-shrink-0 ${activeView === 'studio' ? 'text-sky-400' : 'text-zinc-600'}`} />
            <span>Pro Studio</span>
          </button>
        </nav>
      </div>

      {/* ── RIGHT: Controls ── */}
      <div className="flex items-center gap-2 flex-shrink-0">

        {/* Mode Badges */}
        <div className="hidden md:flex items-center bg-zinc-900 border border-zinc-800 rounded-xl p-1 gap-0.5">
          {(['T2VA', 'I2VA', 'FL2VA', 'L2VA'] as MiniMaxMode[]).map((m) => {
            const isActive = project.settings.mode === m;
            return (
              <button
                key={m}
                type="button"
                id={`mode-badge-${m}`}
                onClick={() => setMode(m)}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                  isActive
                    ? 'bg-cyan-500 text-zinc-950 shadow-sm shadow-cyan-500/30'
                    : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800'
                }`}
              >
                {MODE_LABELS[m]}
              </button>
            );
          })}
        </div>

        {/* Sep */}
        <div className="w-px h-5 bg-zinc-800 hidden md:block" />

        {/* Undo / Redo */}
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={() => undo(project)}
            disabled={!canUndo}
            className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 disabled:opacity-25 disabled:cursor-not-allowed transition-all"
            title="Undo"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => redo(project)}
            disabled={!canRedo}
            className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 disabled:opacity-25 disabled:cursor-not-allowed transition-all"
            title="Redo"
          >
            <Redo2 className="w-4 h-4" />
          </button>
        </div>

        {/* Sep */}
        <div className="w-px h-5 bg-zinc-800" />

        {/* Theme Toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-all"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark'
            ? <Sun className="w-4 h-4 text-amber-400" />
            : <Moon className="w-4 h-4 text-sky-400" />}
        </button>

        {/* Inspector + Expand */}
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={toggleInspectorOpen}
            className={`p-1.5 rounded-lg transition-all ${
              isInspectorOpen
                ? 'text-cyan-400 bg-cyan-500/10 border border-cyan-500/30'
                : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800'
            }`}
            title={isInspectorOpen ? 'Hide Prompt Inspector' : 'Show Prompt Inspector'}
          >
            <PanelRight className="w-4 h-4" />
          </button>
          {isInspectorOpen && (
            <button
              type="button"
              onClick={toggleInspectorExpanded}
              className={`p-1.5 rounded-lg transition-all ${
                isInspectorExpanded
                  ? 'text-violet-400 bg-violet-500/10 border border-violet-500/30'
                  : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800'
              }`}
              title={isInspectorExpanded ? 'Normal Width' : 'Widescreen'}
            >
              {isInspectorExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          )}
        </div>

        {/* Sep */}
        <div className="w-px h-5 bg-zinc-800" />

        {/* Coffee */}
        <a
          href="https://buymeacoffee.com/shubzworld"
          target="_blank"
          rel="noopener noreferrer"
          className="p-1.5 rounded-lg text-zinc-500 hover:text-amber-400 hover:bg-amber-500/10 transition-all"
          title="Support on Buy Me a Coffee"
        >
          <Coffee className="w-4 h-4" />
        </a>

        {/* Export */}
        <button
          type="button"
          onClick={handleExportTXT}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-cyan-500 hover:bg-cyan-400 active:scale-95 text-zinc-950 font-bold rounded-xl text-xs transition-all shadow-md shadow-cyan-500/25"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export</span>
        </button>
      </div>
    </header>
  );
};
