import React from 'react';
import { useStudioStore } from '../../store/StudioStore';
import { Sparkles, Check, X } from 'lucide-react';

export const PromptDiffView: React.FC = () => {
  const { project, proposedPromptDiff, setProposedPromptDiff, autoFixProject } = useStudioStore();

  if (!proposedPromptDiff) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-4xl w-full p-6 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2 text-cyan-400 font-bold">
            <Sparkles className="w-5 h-5" />
            <span>AI Prompt Proposal Diff View</span>
          </div>
          <button
            type="button"
            onClick={() => setProposedPromptDiff(null)}
            className="text-zinc-400 hover:text-zinc-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-xs font-semibold text-zinc-400 mb-2 block">Current Compiled Prompt</span>
            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 font-mono text-xs text-zinc-300 h-64 overflow-y-auto whitespace-pre-wrap">
              {project.compiledPrompt}
            </div>
          </div>

          <div>
            <span className="text-xs font-semibold text-emerald-400 mb-2 block">Proposed AI Enhanced Prompt</span>
            <div className="bg-zinc-950 border border-emerald-500/40 rounded-xl p-3 font-mono text-xs text-emerald-300 h-64 overflow-y-auto whitespace-pre-wrap">
              {proposedPromptDiff}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => setProposedPromptDiff(null)}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs font-semibold"
          >
            Discard
          </button>
          <button
            type="button"
            onClick={() => {
              autoFixProject();
              setProposedPromptDiff(null);
            }}
            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-zinc-950 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-cyan-500/20"
          >
            <Check className="w-4 h-4" />
            <span>Accept Proposal</span>
          </button>
        </div>
      </div>
    </div>
  );
};
