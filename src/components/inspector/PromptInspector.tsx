import React, { useState } from 'react';
import { useStudioStore } from '../../store/StudioStore';
import { Copy, Check, Sparkles, Wrench, FileText, Code, Loader2, Bookmark, X, Maximize2, Minimize2, GripVertical } from 'lucide-react';
import { DiagnosticsPanel } from './DiagnosticsPanel';
import { PromptFormatter } from '../../engine/PromptFormatter';
import { FrameMath } from '../../engine/FrameMath';
import { AIEngine } from '../../ai/AIEngine';

const highlightInlineTokens = (text: string) => {
  const parts = text.split(/(<Picture\s*\d+>|\(S[1-9]\)|<d>|<\/d>|\[\s*en-[A-Z]+\s*\]|\[\s*English\s*\])/gi);

  return parts.map((part, i) => {
    if (!part) return null;
    if (/<Picture\s*\d+>/i.test(part)) {
      return (
        <span key={i} className="inline-flex items-center px-1.5 py-0 mx-0.5 rounded bg-purple-500/20 border border-purple-500/40 text-purple-400 font-bold text-xs font-mono leading-tight align-baseline shadow-xs">
          {part}
        </span>
      );
    }
    if (/\(S[1-9]\)/i.test(part)) {
      return (
        <span key={i} className="inline-flex items-center px-1 py-0 mx-0.5 rounded bg-sky-500/20 border border-sky-500/40 text-sky-400 font-bold text-xs font-mono leading-tight align-baseline shadow-xs">
          {part}
        </span>
      );
    }
    if (part === '<d>' || part === '</d>') {
      return (
        <span key={i} className="text-emerald-400 font-bold font-mono px-0.5 leading-tight">
          {part}
        </span>
      );
    }
    if (/\[\s*(en-[A-Z]+|English)\s*\]/i.test(part)) {
      return (
        <span key={i} className="inline-flex items-center px-1 py-0 text-emerald-400 font-bold font-mono bg-emerald-500/20 rounded border border-emerald-500/40 leading-tight align-baseline">
          {part}
        </span>
      );
    }
    return <React.Fragment key={i}>{part}</React.Fragment>;
  });
};

const RenderSyntaxHighlightedPrompt: React.FC<{ text: string }> = ({ text }) => {
  if (!text) return null;

  const lines = text.split('\n');

  return (
    <div className="font-mono text-xs leading-relaxed text-zinc-100 select-all space-y-3.5">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={idx} className="h-1" />;

        // 1. Root Section Headers
        if (
          trimmed === 'integrated_multimodal_description:' ||
          trimmed === 'dialogue:' ||
          trimmed === 'overall_soundscape:' ||
          trimmed === 'non_diegetic_music:'
        ) {
          return (
            <div key={idx} className="pt-2 pb-1">
              <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 text-[11px] font-mono font-bold uppercase tracking-wider shadow-xs">
                {trimmed}
              </span>
            </div>
          );
        }

        // 2. Shot Lines ([Shot 1] ..., [Shot 2] ...)
        const shotMatch = line.match(/^(\[\s*Shot\s*\d+\s*\])(.*)/i);
        if (shotMatch) {
          const shotTag = shotMatch[1];
          const restOfLine = shotMatch[2];

          return (
            <div key={idx} className="text-zinc-100 leading-relaxed pt-1.5 pb-1">
              <span className="inline-flex items-center px-2 py-0.5 mr-2 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400 font-bold text-[11px] font-mono shadow-xs">
                {shotTag}
              </span>
              <span className="text-zinc-100 font-normal leading-relaxed">{highlightInlineTokens(restOfLine)}</span>
            </div>
          );
        }

        // 3. Dialogue & Default Prose Lines
        return (
          <div key={idx} className="text-zinc-100 font-normal leading-relaxed">
            {highlightInlineTokens(line)}
          </div>
        );
      })}
    </div>
  );
};

export const PromptInspector: React.FC = () => {
  const {
    project,
    isInspectorOpen,
    toggleInspectorOpen,
    isInspectorExpanded,
    inspectorWidth,
    setInspectorWidth,
  } = useStudioStore();
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'prompt' | 'json'>('prompt');
  const [isResizing, setIsResizing] = useState(false);

  if (!isInspectorOpen) return null;

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);

    const onMouseMove = (moveEvent: MouseEvent) => {
      const newWidth = Math.max(380, Math.min(850, window.innerWidth - moveEvent.clientX));
      setInspectorWidth(newWidth);
    };

    const onMouseUp = () => {
      setIsResizing(false);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const handleCopy = () => {
    const textToCopy = activeTab === 'prompt' ? project.compiledPrompt : PromptFormatter.toComfyUIPayload(project);
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const effectiveWidth = isInspectorExpanded ? 680 : (inspectorWidth || 480);

  return (
    <div
      style={{ width: `${effectiveWidth}px` }}
      className="h-full bg-zinc-950 border-l border-zinc-800 flex flex-col flex-shrink-0 relative transition-all duration-150 shadow-xl select-none"
    >
      {/* Drag Resize Handle */}
      <div
        onMouseDown={handleMouseDown}
        className={`absolute -left-1 top-0 bottom-0 w-2 cursor-col-resize hover:bg-cyan-500/60 z-30 transition-colors ${
          isResizing ? 'bg-cyan-500' : 'bg-transparent'
        }`}
        title="Drag to resize Inspector width"
      />

      {/* Clean Minimalist Header */}
      <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between gap-3 bg-zinc-950/90 backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="font-extrabold text-sm text-zinc-100 whitespace-nowrap">Prompt Inspector</span>
          <span className="text-[10px] bg-cyan-950 border border-cyan-500/30 text-cyan-400 dark:text-cyan-300 px-2 py-0.5 rounded-full font-mono font-bold whitespace-nowrap shrink-0">
            {FrameMath.formatH3Badge(project.settings.durationSeconds)}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleCopy}
            className="px-3.5 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-zinc-950 rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-md shadow-cyan-500/20 transition-all cursor-pointer whitespace-nowrap"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>

          <button
            type="button"
            onClick={toggleInspectorOpen}
            className="p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-xl transition-all cursor-pointer"
            title="Close Inspector Panel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Sleek Segmented 2-Way View Switcher */}
      <div className="px-3 py-2 border-b border-zinc-800 bg-zinc-950">
        <div className="grid grid-cols-2 p-1 bg-zinc-900 border border-zinc-800 rounded-xl gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('prompt')}
            className={`py-1 px-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'prompt'
                ? 'bg-zinc-950 text-cyan-400 border border-zinc-800 shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <span>📝 Compiled Prompt</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('json')}
            className={`py-1 px-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'json'
                ? 'bg-zinc-950 text-pink-400 border border-zinc-800 shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <span>⚡ ComfyUI / JSON</span>
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 select-text">
        {activeTab === 'prompt' ? (
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 shadow-sm overflow-x-auto">
            <RenderSyntaxHighlightedPrompt text={project.compiledPrompt} />
          </div>
        ) : (
          <pre className="bg-zinc-950 border border-zinc-800 rounded-xl p-3.5 font-mono text-[11px] text-cyan-400 dark:text-cyan-300 leading-normal overflow-x-auto whitespace-pre-wrap shadow-inner">
            {PromptFormatter.toComfyUIPayload(project)}
          </pre>
        )}
      </div>
    </div>
  );
};
