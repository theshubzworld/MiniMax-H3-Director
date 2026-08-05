import React, { useState } from 'react';
import { useStudioStore } from '../../store/StudioStore';
import { Copy, Check, Sparkles, Wrench, FileText, Code, Loader2 } from 'lucide-react';
import { DiagnosticsPanel } from './DiagnosticsPanel';
import { PromptFormatter } from '../../engine/PromptFormatter';
import { AIEngine } from '../../ai/AIEngine';

export const PromptInspector: React.FC = () => {
  const { project, diagnostics, autoFixProject, setProject } = useStudioStore();
  const [copied, setCopied] = useState(false);
  const [fixed, setFixed] = useState(false);
  const [isPolishingCam, setIsPolishingCam] = useState(false);
  const [isEnhancingAudio, setIsEnhancingAudio] = useState(false);
  const [activeTab, setActiveTab] = useState<'prompt' | 'health' | 'json'>('prompt');

  const handleCopy = () => {
    navigator.clipboard.writeText(project.compiledPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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

  return (
    <div className="h-full bg-zinc-950 border-l border-zinc-800/80 flex flex-col w-80 lg:w-96 flex-shrink-0">
      {/* Header */}
      <div className="p-4 border-b border-zinc-800/80 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-sm text-zinc-100 flex items-center gap-2">
            <Code className="w-4 h-4 text-cyan-400" />
            Prompt Inspector
          </h3>
          <p className="text-[11px] text-zinc-400">Live compiled MiniMax H3 prompt</p>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleAutoFix}
            className={`px-2 py-1 border text-xs font-semibold rounded-lg flex items-center gap-1 transition-all ${
              fixed
                ? 'bg-emerald-500 text-zinc-950 border-emerald-400 shadow-md shadow-emerald-500/20'
                : 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/60'
            }`}
            title="Auto-Fix Formatting & Compliance"
          >
            {fixed ? <Check className="w-3.5 h-3.5" /> : <Wrench className="w-3.5 h-3.5" />}
            <span>{fixed ? 'Fixed!' : 'Auto-Fix'}</span>
          </button>

          <button
            type="button"
            onClick={handleCopy}
            className="px-2.5 py-1 bg-cyan-500 hover:bg-cyan-400 text-zinc-950 rounded-lg text-xs font-semibold flex items-center gap-1 shadow-lg shadow-cyan-500/20 transition-all"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy'}</span>
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
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 font-mono text-xs text-zinc-200 leading-relaxed whitespace-pre-wrap select-all">
            {project.compiledPrompt}
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
