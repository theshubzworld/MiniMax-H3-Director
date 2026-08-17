import React, { useState } from 'react';
import { useStudioStore } from '../../store/StudioStore';
import { PromptFormatter } from '../../engine/PromptFormatter';
import { FrameMath } from '../../engine/FrameMath';
import { Cpu, Copy, Check, Terminal, Film, Sparkles } from 'lucide-react';

export const ComfyUIModal: React.FC = () => {
  const { project } = useStudioStore();
  const [copied, setCopied] = useState(false);
  const [exportFormat, setExportFormat] = useState<'standard' | 'pixaroma'>('standard');

  const frameCalc = FrameMath.calculateH3Frames(project.settings.durationSeconds);
  const payloadText = exportFormat === 'standard'
    ? PromptFormatter.toComfyUIPayload(project)
    : PromptFormatter.toPixaromaPayload(project);

  const handleCopy = () => {
    navigator.clipboard.writeText(payloadText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-5 shadow-2xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-800 pb-4 gap-3">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Cpu className="w-5 h-5 text-pink-400" />
            ComfyUI Payload Exporter
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Export JSON payloads formatted for official MiniMax H3 3in1 or Advanced Custom Node workflows.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs bg-cyan-950 border border-cyan-500/40 text-cyan-300 px-3 py-1 rounded-full font-mono font-bold flex items-center gap-1.5">
            <Film className="w-3.5 h-3.5 text-cyan-400" />
            <span>{frameCalc.frames} frames ({frameCalc.actualSeconds}s @ 24fps)</span>
          </span>

          <button
            type="button"
            onClick={handleCopy}
            className="px-3.5 py-1.5 bg-pink-500 hover:bg-pink-400 text-zinc-950 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-pink-500/20 transition-all cursor-pointer shrink-0"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied Payload!' : 'Copy API JSON'}</span>
          </button>
        </div>
      </div>

      {/* Workflow Format Selector Tabs */}
      <div className="flex bg-zinc-950 p-1 rounded-xl border border-zinc-800 text-xs">
        <button
          type="button"
          onClick={() => setExportFormat('standard')}
          className={`flex-1 py-1.5 px-3 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 ${
            exportFormat === 'standard'
              ? 'bg-zinc-800 text-pink-400 border border-pink-500/30 shadow-xs'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>Standard MiniMax H3 3in1 (api.json)</span>
        </button>

        <button
          type="button"
          onClick={() => setExportFormat('pixaroma')}
          className={`flex-1 py-1.5 px-3 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 ${
            exportFormat === 'pixaroma'
              ? 'bg-zinc-800 text-amber-300 border border-amber-500/30 shadow-xs'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>⚡ Custom Video Prompt & Audio Sync Nodes</span>
        </button>
      </div>

      {/* Frame Math Info Card */}
      <div className="bg-zinc-950/60 p-3 rounded-xl border border-zinc-800/80 flex items-center justify-between text-xs text-zinc-300 font-mono">
        <span className="text-zinc-400">H3 Grid Math: <code>17n + 5</code></span>
        <span className="text-cyan-400 font-bold">{frameCalc.formula}</span>
        <span className="text-emerald-400">Runtime: {frameCalc.actualSeconds}s (was {project.settings.durationSeconds}s)</span>
      </div>

      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 font-mono text-xs text-pink-300 leading-relaxed overflow-x-auto whitespace-pre-wrap max-h-72">
        {payloadText}
      </div>

      <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-2">
        <span className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
          <Terminal className="w-4 h-4 text-cyan-400" />
          cURL Execution Command
        </span>
        <code className="block text-[11px] font-mono text-zinc-400 bg-zinc-900 p-2.5 rounded-lg border border-zinc-800 select-all overflow-x-auto">
          curl -X POST http://127.0.0.1:8188/prompt -H "Content-Type: application/json" -d '{payloadText.replace(/\n/g, '')}'
        </code>
      </div>
    </div>
  );
};
