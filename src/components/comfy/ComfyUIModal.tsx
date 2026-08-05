import React, { useState } from 'react';
import { useStudioStore } from '../../store/StudioStore';
import { PromptFormatter } from '../../engine/PromptFormatter';
import { Cpu, Copy, Check, Terminal } from 'lucide-react';

export const ComfyUIModal: React.FC = () => {
  const { project } = useStudioStore();
  const [copied, setCopied] = useState(false);

  const comfyPayload = PromptFormatter.toComfyUIPayload(project);

  const handleCopy = () => {
    navigator.clipboard.writeText(comfyPayload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Cpu className="w-5 h-5 text-pink-400" />
            ComfyUI API Integration Payload
          </h2>
          <p className="text-xs text-zinc-400">
            Export JSON payload formatted for ComfyUI workflow matching `MINIMAX H3 3in1.json`.
          </p>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="px-3.5 py-1.5 bg-pink-500 hover:bg-pink-400 text-zinc-950 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-pink-500/20 transition-all"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          <span>{copied ? 'Copied Payload!' : 'Copy API JSON'}</span>
        </button>
      </div>

      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 font-mono text-xs text-pink-300 leading-relaxed overflow-x-auto whitespace-pre-wrap">
        {comfyPayload}
      </div>

      <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-2">
        <span className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
          <Terminal className="w-4 h-4 text-cyan-400" />
          cURL Execution Command
        </span>
        <code className="block text-[11px] font-mono text-zinc-400 bg-zinc-900 p-2.5 rounded-lg border border-zinc-800 select-all overflow-x-auto">
          curl -X POST http://127.0.0.1:8188/prompt -H "Content-Type: application/json" -d '{comfyPayload.replace(/\n/g, '')}'
        </code>
      </div>
    </div>
  );
};
