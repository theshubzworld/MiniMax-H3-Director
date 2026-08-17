import React from 'react';
import { useStudioStore } from '../../store/StudioStore';
import { useHistoryStore } from '../../store/HistoryStore';
import { DirectorLogo } from '../common/DirectorLogo';
import {
  Undo2, Redo2, Download, Sparkles, LayoutDashboard, Sun, Moon,
  Coffee, PanelRight, Maximize2, Minimize2, Clapperboard, Film
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
    <header className="h-15 bg-zinc-950/90 border-b border-zinc-800/80 px-4 sm:px-6 flex items-center justify-between gap-3 sticky top-0 z-40 backdrop-blur-2xl flex-nowrap min-w-0 shadow-sm">

      {/* ── LEFT: Brand & Stats ── */}
      <div className="flex items-center gap-3.5 flex-shrink-0">
        <button
          type="button"
          onClick={() => setActiveView('gemini-director')}
          className="cursor-pointer text-left focus:outline-none transition-transform active:scale-98"
        >
          <DirectorLogo size="md" />
        </button>

        {/* Divider */}
        <div className="w-px h-6 bg-zinc-800/80 mx-1 hidden sm:block" />

        {/* Live Project Stats Badge */}
        <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900/90 border border-zinc-800/80 text-[11px] font-mono text-zinc-400 shadow-inner">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-xs shadow-emerald-400/50" />
          <span className="font-semibold text-zinc-300">{project.shots.length} shots</span>
          <span className="text-zinc-700">·</span>
          <span className="font-semibold text-zinc-300">{project.settings.durationSeconds}s</span>
          <span className="text-zinc-700">·</span>
          <span className="text-cyan-400 font-extrabold">{MODE_LABELS[project.settings.mode as MiniMaxMode] ?? project.settings.mode}</span>
        </div>
      </div>

      {/* ── CENTER: Primary View Switcher ── */}
      <div className="flex-1 flex items-center justify-center min-w-0 px-2">
        <nav className="flex items-center bg-zinc-900/90 border border-zinc-800/80 rounded-2xl p-1 gap-1 shadow-inner" aria-label="View switcher">

          {/* Gemini AI */}
          <button
            type="button"
            id="view-tab-gemini"
            onClick={() => setActiveView('gemini-director')}
            className={`flex items-center gap-2 px-3.5 sm:px-4 py-1.5 rounded-xl text-xs font-extrabold transition-all duration-150 cursor-pointer ${
              activeView === 'gemini-director'
                ? 'bg-gradient-to-r from-cyan-500/25 to-blue-600/15 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
            }`}
          >
            <Sparkles className={`w-3.5 h-3.5 flex-shrink-0 ${activeView === 'gemini-director' ? 'text-cyan-400' : 'text-zinc-500'}`} />
            <span className="hidden sm:inline">Gemini AI</span>
            <span className="sm:hidden">AI</span>
          </button>

          {/* Story Wizard */}
          <button
            type="button"
            id="view-tab-wizard"
            onClick={() => setActiveView('wizard')}
            className={`flex items-center gap-2 px-3.5 sm:px-4 py-1.5 rounded-xl text-xs font-extrabold transition-all duration-150 cursor-pointer ${
              activeView === 'wizard'
                ? 'bg-zinc-800 text-violet-300 border border-violet-500/30 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
            }`}
          >
            <Clapperboard className={`w-3.5 h-3.5 flex-shrink-0 ${activeView === 'wizard' ? 'text-violet-400' : 'text-zinc-500'}`} />
            <span className="hidden sm:inline">Story Wizard</span>
            <span className="sm:hidden">Wizard</span>
          </button>

          {/* Pro Studio */}
          <button
            type="button"
            id="view-tab-studio"
            onClick={() => setActiveView('studio')}
            className={`flex items-center gap-2 px-3.5 sm:px-4 py-1.5 rounded-xl text-xs font-extrabold transition-all duration-150 cursor-pointer ${
              activeView === 'studio'
                ? 'bg-zinc-800 text-sky-300 border border-sky-500/30 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
            }`}
          >
            <LayoutDashboard className={`w-3.5 h-3.5 flex-shrink-0 ${activeView === 'studio' ? 'text-sky-400' : 'text-zinc-500'}`} />
            <span className="hidden sm:inline">Pro Studio</span>
            <span className="sm:hidden">Studio</span>
          </button>
        </nav>
      </div>

      {/* ── RIGHT: Mode Switcher & Actions ── */}
      <div className="flex items-center gap-2 flex-shrink-0">

        {/* MiniMax Mode Badges */}
        <div className="hidden lg:flex items-center bg-zinc-900/90 border border-zinc-800/80 rounded-xl p-1 gap-0.5 shadow-inner">
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
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-zinc-950 font-extrabold shadow-sm shadow-cyan-500/30'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
                }`}
              >
                {MODE_LABELS[m]}
              </button>
            );
          })}
        </div>

        {/* Undo / Redo */}
        <div className="flex items-center bg-zinc-900/80 border border-zinc-800/80 rounded-xl p-0.5 shadow-inner">
          <button
            type="button"
            onClick={() => undo(project)}
            disabled={!canUndo}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 disabled:opacity-25 disabled:cursor-not-allowed transition-all"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => redo(project)}
            disabled={!canRedo}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 disabled:opacity-25 disabled:cursor-not-allowed transition-all"
            title="Redo (Ctrl+Y)"
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Theme Toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          className="p-2 rounded-xl bg-zinc-900/80 border border-zinc-800/80 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-all shadow-inner"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark'
            ? <Sun className="w-3.5 h-3.5 text-amber-400" />
            : <Moon className="w-3.5 h-3.5 text-sky-400" />}
        </button>

        {/* Inspector Toggle */}
        <div className="flex items-center bg-zinc-900/80 border border-zinc-800/80 rounded-xl p-0.5 shadow-inner">
          <button
            type="button"
            onClick={toggleInspectorOpen}
            className={`p-1.5 rounded-lg transition-all ${
              isInspectorOpen
                ? 'text-cyan-400 bg-cyan-500/15 border border-cyan-500/30'
                : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800'
            }`}
            title={isInspectorOpen ? 'Hide Prompt Inspector' : 'Show Prompt Inspector'}
          >
            <PanelRight className="w-3.5 h-3.5" />
          </button>
          {isInspectorOpen && (
            <button
              type="button"
              onClick={toggleInspectorExpanded}
              className={`p-1.5 rounded-lg transition-all ${
                isInspectorExpanded
                  ? 'text-violet-400 bg-violet-500/15 border border-violet-500/30'
                  : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800'
              }`}
              title={isInspectorExpanded ? 'Normal Width' : 'Widescreen'}
            >
              {isInspectorExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>

        {/* Coffee */}
        <a
          href="https://buymeacoffee.com/shubzworld"
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 rounded-xl bg-zinc-900/80 border border-zinc-800/80 text-zinc-400 hover:text-amber-400 hover:bg-amber-500/10 transition-all shadow-inner"
          title="Support on Buy Me a Coffee"
        >
          <Coffee className="w-3.5 h-3.5" />
        </a>

        {/* Export Button */}
        <button
          type="button"
          onClick={handleExportTXT}
          className="flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 active:scale-95 text-zinc-950 font-extrabold rounded-xl text-xs transition-all shadow-md shadow-cyan-500/20 cursor-pointer shrink-0"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Export</span>
        </button>
      </div>
    </header>
  );
};
