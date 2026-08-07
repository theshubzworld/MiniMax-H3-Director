import React, { useState } from 'react';
import { useStudioStore } from '../../store/StudioStore';
import { Copy, Check, Sparkles, Wrench, FileText, Code, Loader2, Bookmark, X, Maximize2, Minimize2, GripVertical } from 'lucide-react';
import { DiagnosticsPanel } from './DiagnosticsPanel';
import { PromptFormatter } from '../../engine/PromptFormatter';
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
    <div className="font-mono text-[13px] leading-[2.2] text-zinc-100 select-all space-y-3">
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
            <div key={idx} className="pt-2 pb-0.5 font-bold">
              <span className="inline-flex items-center px-2 py-0.5 rounded bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 text-xs font-mono font-bold uppercase tracking-wider leading-tight">
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
            <div key={idx} className="text-zinc-100 leading-[2.2] pt-1">
              <span className="inline-flex items-center px-2 py-0 mr-2 rounded bg-amber-500/20 border border-amber-500/40 text-amber-400 font-bold text-xs font-mono leading-tight align-baseline shadow-xs">
                {shotTag}
              </span>
              <span>{highlightInlineTokens(restOfLine)}</span>
            </div>
          );
        }

        // 3. Dialogue & Default Prose Lines
        return (
          <div key={idx} className="text-zinc-100 leading-[2.2]">
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
    diagnostics,
    autoFixProject,
    setProject,
    savePromptToLibrary,
    isInspectorOpen,
    toggleInspectorOpen,
    isInspectorExpanded,
    toggleInspectorExpanded,
    inspectorWidth,
    setInspectorWidth,
  } = useStudioStore();
  const [copied, setCopied] = useState(false);
  const [fixed, setFixed] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isPolishingCam, setIsPolishingCam] = useState(false);
  const [isEnhancingAudio, setIsEnhancingAudio] = useState(false);
  const [activeTab, setActiveTab] = useState<'prompt' | 'health' | 'json'>('prompt');
  const [isResizing, setIsResizing] = useState(false);

  if (!isInspectorOpen) return null;

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);

    const onMouseMove = (moveEvent: MouseEvent) => {
      const newWidth = window.innerWidth - moveEvent.clientX;
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
    navigator.clipboard.writeText(project.compiledPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveToLibrary = () => {
    savePromptToLibrary();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleAutoFix = () => {
    autoFixProject();
    setFixed(true);
    setTimeout(() => setFixed(false), 2000);
  };

  const handlePolishCamera = async () => {
    setIsPolishingCam(true);
    try {
      const provider = AIEngine.getActiveProvider();
      const apiKey = (localStorage.getItem('minimax_gemini_api_key') || import.meta.env.VITE_GEMINI_API_KEY || '').trim();
      const enhancedShots = await provider.enhanceCamera(project.shots, apiKey);
      setProject({
        ...project,
        shots: enhancedShots,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsPolishingCam(false);
    }
  };

  const handleEnhanceSoundscape = async () => {
    setIsEnhancingAudio(true);
    try {
      const provider = AIEngine.getActiveProvider();
      const apiKey = (localStorage.getItem('minimax_gemini_api_key') || import.meta.env.VITE_GEMINI_API_KEY || '').trim();
      const enhancedAudio = await provider.enhanceAudio(project.audio, apiKey);
      setProject({
        ...project,
        audio: enhancedAudio,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsEnhancingAudio(false);
    }
  };

  const effectiveWidth = isInspectorExpanded ? 680 : inspectorWidth;

  return (
    <div
      style={{ width: `${effectiveWidth}px` }}
      className="h-full bg-zinc-950 border-l border-zinc-800/80 flex flex-col flex-shrink-0 relative transition-all duration-75"
    >
      {/* Draggable Resizer Left Edge Handle */}
      <div
        onMouseDown={handleMouseDown}
        className={`absolute -left-1 top-0 bottom-0 w-2 cursor-col-resize hover:bg-cyan-500/60 z-30 transition-colors flex items-center justify-center group ${
          isResizing ? 'bg-cyan-400 shadow-lg shadow-cyan-500/50' : 'bg-transparent'
        }`}
        title="Click and drag left or right to adjust Prompt Inspector width"
      >
        <div className="w-0.5 h-8 bg-zinc-700 group-hover:bg-cyan-300 rounded-full" />
      </div>

      {/* Header */}
      <div className="p-3 border-b border-zinc-800/80 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleInspectorExpanded}
            className="p-1.5 text-zinc-400 hover:text-cyan-400 hover:bg-zinc-900 rounded-lg transition-all"
            title={isInspectorExpanded ? 'Normal Width' : 'Widescreen (680px)'}
          >
            {isInspectorExpanded ? <Minimize2 className="w-4 h-4 text-purple-400" /> : <Maximize2 className="w-4 h-4 text-cyan-400" />}
          </button>

          <div>
            <h3 className="font-bold text-xs sm:text-sm text-zinc-100 flex items-center gap-1.5">
              <span>Prompt Inspector</span>
              <span className="text-[10px] text-cyan-400 font-mono">({effectiveWidth}px)</span>
            </h3>
          </div>
        </div>

        {/* Width Quick Preset Pills */}
        <div className="hidden xl:flex items-center gap-1 bg-zinc-900 p-0.5 rounded-lg border border-zinc-800">
          {[
            { w: 400, label: '400' },
            { w: 500, label: '500' },
            { w: 600, label: '600' },
            { w: 700, label: '700' },
          ].map((preset) => (
            <button
              key={preset.w}
              type="button"
              onClick={() => setInspectorWidth(preset.w)}
              className={`px-1.5 py-0.5 text-[10px] font-mono font-bold rounded transition-all ${
                inspectorWidth === preset.w && !isInspectorExpanded
                  ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-500/50'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleAutoFix}
            className={`px-2 py-1 border text-xs font-semibold rounded-lg flex items-center gap-1 transition-all ${
              fixed
                ? 'bg-emerald-500 text-zinc-950 border-emerald-400 shadow-md'
                : 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/60'
            }`}
            title="Auto-Fix Formatting & Compliance"
          >
            {fixed ? <Check className="w-3.5 h-3.5" /> : <Wrench className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{fixed ? 'Fixed!' : 'Auto-Fix'}</span>
          </button>

          <button
            type="button"
            onClick={handleSaveToLibrary}
            className={`px-2 py-1 border text-xs font-semibold rounded-lg flex items-center gap-1 transition-all ${
              saved
                ? 'bg-purple-500 text-zinc-950 border-purple-400 font-bold shadow-md'
                : 'bg-purple-950/60 border-purple-500/40 text-purple-300 hover:bg-purple-900/60'
            }`}
            title="Save Prompt to Library"
          >
            {saved ? <Check className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{saved ? 'Saved!' : 'Save'}</span>
          </button>

          <button
            type="button"
            onClick={handleCopy}
            className="px-2.5 py-1 bg-cyan-500 hover:bg-cyan-400 text-zinc-950 rounded-lg text-xs font-semibold flex items-center gap-1 shadow-lg shadow-cyan-500/20 transition-all"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>

          <button
            type="button"
            onClick={toggleInspectorOpen}
            className="p-1 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900 rounded-lg transition-all"
            title="Close Inspector Panel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-800/80 bg-zinc-900/40">
        <button
          type="button"
          onClick={() => setActiveTab('prompt')}
          className={`flex-1 py-2 text-xs font-medium border-b-2 transition-all ${
            activeTab === 'prompt'
              ? 'border-cyan-500 text-cyan-300 bg-zinc-900'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Prompt Text
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('health')}
          className={`flex-1 py-2 text-xs font-medium border-b-2 flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'health'
              ? 'border-cyan-500 text-cyan-300 bg-zinc-900'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Health ({diagnostics.overallHealthScore}%)
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('json')}
          className={`flex-1 py-2 text-xs font-medium border-b-2 transition-all ${
            activeTab === 'json'
              ? 'border-cyan-500 text-cyan-300 bg-zinc-900'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          ComfyUI Payload
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeTab === 'prompt' && (
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 shadow-xl overflow-x-auto border-t-2 border-t-cyan-500/60">
            <RenderSyntaxHighlightedPrompt text={project.compiledPrompt} />
          </div>
        )}

        {activeTab === 'health' && <DiagnosticsPanel result={diagnostics} />}

        {activeTab === 'json' && (
          <pre className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 font-mono text-[11px] text-cyan-300 leading-normal overflow-x-auto whitespace-pre-wrap">
            {PromptFormatter.toComfyUIPayload(project)}
          </pre>
        )}
      </div>

      {/* Quick AI Action Tools Footer */}
      <div className="p-3 border-t border-zinc-800/80 bg-zinc-900/60 space-y-2">
        <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-cyan-400" />
          <span>AI Enhancement Tools</span>
        </div>
        <div className="grid grid-cols-2 gap-1.5 text-xs">
          <button
            type="button"
            onClick={handlePolishCamera}
            disabled={isPolishingCam}
            className="p-1.5 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-zinc-200 rounded-lg text-left text-[11px] font-medium transition-all flex items-center gap-1.5"
          >
            {isPolishingCam ? <Loader2 className="w-3.5 h-3.5 text-cyan-400 animate-spin" /> : <span>✨</span>}
            <span>{isPolishingCam ? 'Polishing 3D...' : 'Polish Camera 3D'}</span>
          </button>
          <button
            type="button"
            onClick={handleEnhanceSoundscape}
            disabled={isEnhancingAudio}
            className="p-1.5 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-zinc-200 rounded-lg text-left text-[11px] font-medium transition-all flex items-center gap-1.5"
          >
            {isEnhancingAudio ? <Loader2 className="w-3.5 h-3.5 text-cyan-400 animate-spin" /> : <span>✨</span>}
            <span>{isEnhancingAudio ? 'Enhancing...' : 'Enhance Soundscape'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
