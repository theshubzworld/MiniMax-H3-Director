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
  Download,
  FileText,
  Upload,
  Database,
  FileJson,
  X,
  Edit2,
} from 'lucide-react';

export const PromptLibraryPanel: React.FC = () => {
  const {
    savedPrompts,
    deleteSavedPrompt,
    toggleFavoritePrompt,
    updateSavedPromptTitle,
    loadSavedPromptIntoStudio,
    savePromptToLibrary,
    importPromptsFromJSON,
    project,
  } = useStudioStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'favorites' | 'T2VA' | 'I2VA' | 'FL2VA' | 'L2VA'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [justSavedCurrent, setJustSavedCurrent] = useState(false);
  const [isCodebaseModalOpen, setIsCodebaseModalOpen] = useState(false);
  const [copiedCodebaseJson, setCopiedCodebaseJson] = useState(false);
  const [importMessage, setImportMessage] = useState<string | null>(null);
  const [editingTitleId, setEditingTitleId] = useState<string | null>(null);
  const [editingTitleValue, setEditingTitleValue] = useState('');

  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

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

  const handleExportJSON = () => {
    if (!prompts || prompts.length === 0) return;
    const filename = `minimax_saved_prompts_backup_${new Date().toISOString().slice(0, 10)}.json`;
    const jsonStr = JSON.stringify(prompts, null, 2);

    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadUserSavedPrompts = () => {
    const filename = `user_saved_prompts.json`;
    const jsonStr = JSON.stringify(prompts, null, 2);

    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopyCodebaseJSON = () => {
    const jsonStr = JSON.stringify(prompts, null, 2);
    navigator.clipboard.writeText(jsonStr);
    setCopiedCodebaseJson(true);
    setTimeout(() => setCopiedCodebaseJson(false), 2000);
  };

  const handleImportFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = importPromptsFromJSON(content);
        if (success) {
          setImportMessage('Prompts successfully imported & merged into your library!');
        } else {
          setImportMessage('Failed to parse JSON file. Please check file format.');
        }
        setTimeout(() => setImportMessage(null), 4000);
      }
    };
    reader.readAsText(file);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleStartEditTitle = (p: SavedPrompt) => {
    setEditingTitleId(p.id);
    setEditingTitleValue(p.title);
  };

  const handleSaveTitle = (id: string) => {
    if (editingTitleValue.trim()) {
      updateSavedPromptTitle(id, editingTitleValue.trim());
    }
    setEditingTitleId(null);
  };

  const handleExportSingleTxt = (p: SavedPrompt) => {
    const safeTitle = p.title.replace(/[^a-z0-9_-]/gi, '_').substring(0, 40) || 'minimax_h3_prompt';
    const filename = `${safeTitle}_${p.mode}.txt`;

    const content = `================================================================================
MINIMAX H3 PROMPT: ${p.title}
================================================================================
MODE: ${p.mode} | SHOTS: ${p.shotsCount} (${p.durationSeconds}s) | ASPECT: ${p.aspectRatio}
NARRATIVE STYLE: ${p.narrativeStyle}
CREATED DATE: ${new Date(p.createdAt).toLocaleString()}
================================================================================

STORY IDEA:
${p.idea}

================================================================================
COMPILED MINIMAX H3 PRODUCTION PROMPT
================================================================================

${p.compiledPrompt}
`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportAllTxt = () => {
    if (!prompts || prompts.length === 0) return;
    const filename = `minimax_h3_all_prompts_${new Date().toISOString().slice(0, 10)}.txt`;

    const sections = prompts
      .map(
        (p, idx) => `================================================================================
PROMPT #${idx + 1}: ${p.title}
MODE: ${p.mode} | SHOTS: ${p.shotsCount} (${p.durationSeconds}s) | ASPECT: ${p.aspectRatio}
NARRATIVE STYLE: ${p.narrativeStyle}
CREATED: ${new Date(p.createdAt).toLocaleString()}
================================================================================

STORY IDEA:
${p.idea}

COMPILED PROMPT:
${p.compiledPrompt}`
      )
      .join('\n\n\n');

    const content = `================================================================================
MINIMAX H3 PROMPT STUDIO - SAVED PROMPTS LIBRARY EXPORT
TOTAL SAVED PROMPTS: ${prompts.length}
EXPORT DATE: ${new Date().toLocaleString()}
================================================================================

${sections}
`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
              Access all your saved MiniMax H3 video prompts, 1-click reload scenes into the studio editor, or export prompts directly as TXT files.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImportFileChange}
              accept=".json"
              className="hidden"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 hover:border-emerald-500/40 text-emerald-300 text-xs font-bold transition-all shadow-md"
              title="Import JSON backup file into saved prompts library"
            >
              <Upload className="w-3.5 h-3.5 text-emerald-400" />
              <span>Import JSON</span>
            </button>

            <button
              type="button"
              onClick={handleExportJSON}
              disabled={prompts.length === 0}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 hover:border-amber-500/40 text-amber-300 text-xs font-bold transition-all shadow-md disabled:opacity-40"
              title="Export all saved prompts as JSON backup file"
            >
              <FileJson className="w-3.5 h-3.5 text-amber-400" />
              <span>Export JSON</span>
            </button>

            <button
              type="button"
              onClick={() => setIsCodebaseModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-950/60 hover:bg-purple-900/80 border border-purple-800/60 hover:border-purple-500/60 text-purple-300 text-xs font-bold transition-all shadow-md"
              title="View permanent codebase JSON sync & backup code"
            >
              <Database className="w-3.5 h-3.5 text-purple-400" />
              <span>Save to Codebase</span>
            </button>

            <button
              type="button"
              onClick={handleExportAllTxt}
              disabled={prompts.length === 0}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 hover:border-cyan-500/40 text-cyan-300 text-xs font-bold transition-all shadow-md disabled:opacity-40"
              title="Export all saved prompts into a single TXT file"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Export .TXT</span>
            </button>

            <button
              type="button"
              onClick={handleSaveCurrent}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-lg ${
                justSavedCurrent
                  ? 'bg-emerald-500 text-zinc-950 font-extrabold shadow-emerald-500/20 scale-105'
                  : 'bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white shadow-purple-500/20'
              }`}
            >
              {justSavedCurrent ? <Check className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
              <span>{justSavedCurrent ? 'Saved Current Scene!' : 'Save Active Scene'}</span>
            </button>
          </div>
        </div>
      </div>

      {importMessage && (
        <div className="bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs font-semibold px-4 py-3 rounded-xl flex items-center justify-between shadow-lg backdrop-blur-md animate-fadeIn">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{importMessage}</span>
          </div>
          <button type="button" onClick={() => setImportMessage(null)} className="text-emerald-400 hover:text-emerald-200">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

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

                    {editingTitleId === p.id ? (
                      <div className="flex items-center gap-2 mt-1">
                        <input
                          type="text"
                          value={editingTitleValue}
                          onChange={(e) => setEditingTitleValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveTitle(p.id);
                            if (e.key === 'Escape') setEditingTitleId(null);
                          }}
                          className="bg-zinc-950 border border-purple-500 rounded-lg px-2.5 py-1 text-xs text-zinc-100 font-bold focus:outline-none flex-1"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveTitle(p.id)}
                          className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 text-xs font-bold transition-all"
                          title="Save Title"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingTitleId(null)}
                          className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-zinc-200 text-xs transition-all"
                          title="Cancel"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 group/title mt-1">
                        <h3 className="text-base font-bold text-zinc-100 tracking-tight group-hover/title:text-purple-300 transition-colors">
                          {p.title}
                        </h3>
                        <button
                          type="button"
                          onClick={() => handleStartEditTitle(p)}
                          className="opacity-50 hover:opacity-100 p-1 text-zinc-400 hover:text-purple-300 transition-all rounded-md hover:bg-zinc-800/60"
                          title="Edit Recognition Title"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
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

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleExportSingleTxt(p)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-zinc-950 text-cyan-300 hover:text-white border border-zinc-800 hover:border-cyan-500/40 hover:bg-zinc-800 transition-all"
                        title="Export this prompt as a .txt file"
                      >
                        <Download className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Export TXT</span>
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

      {/* Codebase Permanent Backup Modal */}
      {isCodebaseModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setIsCodebaseModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-all"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-purple-400">
                <Database className="w-5 h-5" />
                <h3 className="text-base font-extrabold text-zinc-100">Permanent Codebase Sync</h3>
              </div>
              <p className="text-xs text-zinc-400">
                To save your browser prompts permanently into your codebase git repository, copy the JSON below or download{' '}
                <code className="text-purple-300 bg-purple-950/60 px-1.5 py-0.5 rounded">user_saved_prompts.json</code> and place it inside{' '}
                <code className="text-purple-300 bg-purple-950/60 px-1.5 py-0.5 rounded">src/data/</code>.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-zinc-400">
                <span>JSON Prompt Payload ({prompts.length} prompts)</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleDownloadUserSavedPrompts}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-950 hover:bg-purple-900 text-purple-300 border border-purple-800 text-xs font-bold transition-all"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download user_saved_prompts.json</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleCopyCodebaseJSON}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold transition-all"
                  >
                    {copiedCodebaseJson ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCodebaseJson ? 'Copied JSON!' : 'Copy JSON'}</span>
                  </button>
                </div>
              </div>
              <textarea
                readOnly
                rows={10}
                value={JSON.stringify(prompts, null, 2)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-[11px] font-mono text-zinc-300 focus:outline-none scrollbar-thin"
              />
            </div>

            <div className="pt-3 border-t border-zinc-800 flex justify-end">
              <button
                type="button"
                onClick={() => setIsCodebaseModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
