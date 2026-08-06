import React, { useState } from 'react';
import { useStudioStore } from '../../store/StudioStore';
import { SavedPrompt } from '../../types/project';
import {
  Bookmark,
  Search,
  Star,
  Trash2,
  Copy,
  Check,
  ExternalLink,
  Film,
  Sparkles,
  Sliders,
  Calendar,
  Volume2,
  Clapperboard,
  Layers,
} from 'lucide-react';

export const PromptLibraryPanel: React.FC = () => {
  const { savedPrompts, deleteSavedPrompt, toggleFavoritePrompt, loadSavedPromptIntoStudio, savePromptToLibrary, project } =
    useStudioStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'favorites' | 'T2VA' | 'I2VA' | 'FL2VA' | 'L2VA'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [justSavedCurrent, setJustSavedCurrent] = useState(false);

  const prompts = savedPrompts || [];

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSaveCurrent = () => {
    savePromptToLibrary();
    setJustSavedCurrent(true);
    setTimeout(() => setJustSavedCurrent(false), 2500);
  };

  const filteredPrompts = prompts.filter((p) => {
    // Tab filter
    if (filterTab === 'favorites' && !p.isFavorite) return false;
    if (filterTab !== 'all' && filterTab !== 'favorites' && p.mode !== filterTab) return false;

    // Search filter
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.title.toLowerCase().includes(q) ||
      p.idea.toLowerCase().includes(q) ||
      p.narrativeStyle.toLowerCase().includes(q) ||
      p.compiledPrompt.toLowerCase().includes(q)
    );
  });

  const favoritesCount = prompts.filter((p) => p.isFavorite).length;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-purple-950/30 border border-zinc-800/80 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                <Bookmark className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-extrabold text-zinc-100 tracking-tight">Saved Prompt Library</h2>
            </div>
            <p className="text-xs text-zinc-400 max-w-xl">
              Access all your saved MiniMax H3 video prompts, 1-click reload scenes into the studio editor, or copy production prompts directly to your clipboard.
            </p>
          </div>

          <button
            type="button"
            onClick={handleSaveCurrent}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg ${
              justSavedCurrent
                ? 'bg-emerald-500 text-zinc-950 font-extrabold shadow-emerald-500/20 scale-105'
                : 'bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white shadow-purple-500/20'
            }`}
          >
            {justSavedCurrent ? <Check className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
            <span>{justSavedCurrent ? 'Saved Current Scene!' : 'Save Active Scene to Library'}</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Control Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-zinc-900/80 border border-zinc-800/80 rounded-2xl p-3 backdrop-blur-md">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search saved prompts by title, keyword, style, or text..."
            className="w-full bg-zinc-950 border border-zinc-800/80 focus:border-purple-500/60 rounded-xl pl-9 pr-4 py-2 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none transition-all"
          />
        </div>

        {/* Filter Category Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <button
            type="button"
            onClick={() => setFilterTab('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              filterTab === 'all'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
            }`}
          >
            All ({prompts.length})
          </button>

          <button
            type="button"
            onClick={() => setFilterTab('favorites')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              filterTab === 'favorites'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
            }`}
          >
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span>Favorites ({favoritesCount})</span>
          </button>

          {(['I2VA', 'T2VA', 'FL2VA', 'L2VA'] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setFilterTab(m)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold whitespace-nowrap transition-all ${
                filterTab === m
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Prompts Cards Grid */}
      {filteredPrompts.length === 0 ? (
        <div className="text-center py-16 bg-zinc-900/40 border border-zinc-800/60 rounded-2xl p-8 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-zinc-800/80 border border-zinc-700 flex items-center justify-center mx-auto text-zinc-500">
            <Bookmark className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-zinc-300">No Prompts Found</h3>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              {searchQuery
                ? `No saved prompts match "${searchQuery}". Try clearing your search.`
                : 'Your prompt library is empty. Generate a storyboard or click "Save Active Scene to Library" above!'}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredPrompts.map((p) => {
            const isExpanded = expandedId === p.id;
            const isCopied = copiedId === p.id;

            return (
              <div
                key={p.id}
                className="bg-zinc-900/90 border border-zinc-800/80 hover:border-zinc-700 rounded-2xl p-5 space-y-4 transition-all shadow-lg hover:shadow-xl group"
              >
                {/* Header Row */}
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 rounded-md bg-purple-500/10 border border-purple-500/30 text-purple-300 font-mono text-[10px] font-bold">
                        {p.mode}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-mono text-[10px] font-bold">
                        {p.shotsCount} Shots ({p.durationSeconds}s)
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] font-semibold">
                        {p.narrativeStyle}
                      </span>
                      <span className="text-[10px] text-zinc-500 font-mono flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(p.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-zinc-100 tracking-tight group-hover:text-purple-300 transition-colors">
                      {p.title}
                    </h3>
                  </div>

                  {/* Top Actions */}
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => toggleFavoritePrompt(p.id)}
                      title={p.isFavorite ? 'Remove Favorite' : 'Mark Favorite'}
                      className={`p-2 rounded-xl border transition-all ${
                        p.isFavorite
                          ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                          : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-amber-400 hover:bg-zinc-800'
                      }`}
                    >
                      <Star className={`w-4 h-4 ${p.isFavorite ? 'fill-amber-400' : ''}`} />
                    </button>

                    <button
                      type="button"
                      onClick={() => deleteSavedPrompt(p.id)}
                      title="Delete Prompt"
                      className="p-2 rounded-xl bg-zinc-950 text-zinc-400 hover:text-rose-400 border border-zinc-800 hover:border-rose-500/40 hover:bg-rose-500/10 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Idea Summary */}
                <p className="text-xs text-zinc-400 leading-relaxed bg-zinc-950/60 p-3 rounded-xl border border-zinc-800/50">
                  {p.idea}
                </p>

                {/* Collapsible Prompt Preview */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setExpandedId(isExpanded ? null : p.id)}
                      className="text-[11px] font-bold text-zinc-400 hover:text-purple-300 flex items-center gap-1.5 transition-colors"
                    >
                      <Sliders className="w-3.5 h-3.5 text-purple-400" />
                      <span>{isExpanded ? 'Hide Compiled Prompt' : 'View Full MiniMax H3 Prompt'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleCopy(p.id, p.compiledPrompt)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        isCopied
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                          : 'bg-zinc-950 text-zinc-300 hover:text-white border border-zinc-800 hover:bg-zinc-800'
                      }`}
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-purple-400" />}
                      <span>{isCopied ? 'Copied!' : 'Copy Prompt'}</span>
                    </button>
                  </div>

                  {isExpanded && (
                    <pre className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl text-xs font-mono text-zinc-300 overflow-x-auto max-h-72 whitespace-pre-wrap leading-relaxed">
                      {p.compiledPrompt}
                    </pre>
                  )}
                </div>

                {/* Bottom Action Footer */}
                <div className="pt-2 border-t border-zinc-800/60 flex items-center justify-between gap-3">
                  <span className="text-[10px] text-zinc-500 font-mono">
                    ID: {p.id.slice(0, 16)}...
                  </span>

                  <button
                    type="button"
                    onClick={() => loadSavedPromptIntoStudio(p)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold transition-all shadow-md"
                  >
                    <Clapperboard className="w-4 h-4 text-purple-400" />
                    <span>Load Scene into Studio</span>
                    <ExternalLink className="w-3.5 h-3.5 text-purple-400" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
