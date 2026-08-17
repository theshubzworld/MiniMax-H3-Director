import React, { useState, useEffect } from 'react';
import { AIEngine } from '../../ai/AIEngine';
import { LocalProvider } from '../../ai/providers/LocalProvider';
import { Key, Sliders, Check, Shield, Cpu, Activity, Loader2, Sparkles } from 'lucide-react';

export const AISettingsPanel: React.FC = () => {
  const [providerId, setProviderId] = useState('gemini');
  const [apiKey, setApiKey] = useState('');
  const [localEndpoint, setLocalEndpoint] = useState('http://localhost:11434/v1');
  const [localModel, setLocalModel] = useState('hf.co/mradermacher/Qwen3-VL-8B-Instruct-Heretic-GGUF:Q4_K_M');
  const [isPinging, setIsPinging] = useState(false);
  const [isScanningModels, setIsScanningModels] = useState(false);
  const [installedModels, setInstalledModels] = useState<{ name: string; size?: string }[]>([]);
  const [pingResult, setPingResult] = useState<{ ok: boolean; latencyMs: number; error?: string } | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let storedKey = (localStorage.getItem('minimax_gemini_api_key') || '').trim();
    if (!storedKey) {
      storedKey = (import.meta.env.VITE_GEMINI_API_KEY || '').trim();
    }
    setApiKey(storedKey);

    const storedEndpoint = localStorage.getItem('minimax_local_endpoint');
    if (storedEndpoint) setLocalEndpoint(storedEndpoint);

    const storedModel = localStorage.getItem('minimax_local_model');
    if (storedModel) setLocalModel(storedModel);

    const activeId = AIEngine.getActiveProvider().id;
    if (activeId) setProviderId(activeId);

    // Auto-scan installed models if local endpoint is reachable
    scanInstalledModels(storedEndpoint || 'http://localhost:11434/v1');
  }, []);

  const scanInstalledModels = async (endpointToTest?: string) => {
    setIsScanningModels(true);
    try {
      if (endpointToTest) localStorage.setItem('minimax_local_endpoint', endpointToTest);
      const localProv = new LocalProvider();
      const models = await localProv.getInstalledModels();
      setInstalledModels(models);
    } catch (err) {
      console.warn('Scan models failed:', err);
    } finally {
      setIsScanningModels(false);
    }
  };

  const handleTestPing = async () => {
    setIsPinging(true);
    setPingResult(null);
    try {
      localStorage.setItem('minimax_local_endpoint', localEndpoint);
      localStorage.setItem('minimax_local_model', localModel);
      const localProv = new LocalProvider();
      const res = await localProv.pingServer();
      setPingResult(res);
      if (res.ok) {
        scanInstalledModels(localEndpoint);
      }
    } catch (err: any) {
      setPingResult({ ok: false, latencyMs: 0, error: err.message || 'Connection failed' });
    } finally {
      setIsPinging(false);
    }
  };

  const handleSave = () => {
    localStorage.setItem('minimax_gemini_api_key', apiKey);
    localStorage.setItem('minimax_local_endpoint', localEndpoint);
    localStorage.setItem('minimax_local_model', localModel);
    AIEngine.setActiveProvider(providerId);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-7 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-12 h-12 rounded-2xl bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-bold shadow-md shadow-cyan-500/10 shrink-0">
            <Sliders className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-extrabold text-zinc-100 flex items-center gap-2.5 whitespace-nowrap">
              <span>AI Director Engine Settings</span>
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-0.5 leading-normal">
              Configure Cloud Gemini (Vertex Express / AI Studio) or Local GPU (Qwen3-VL / Ollama / LM Studio).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span className="text-xs bg-emerald-950 border border-emerald-500/40 text-emerald-800 dark:text-emerald-300 px-3.5 py-2 rounded-xl font-mono font-bold flex items-center gap-2 whitespace-nowrap shrink-0">
            <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="whitespace-nowrap">Active Engine: {providerId.toUpperCase()}</span>
          </span>

          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-zinc-950 font-extrabold rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition-all cursor-pointer whitespace-nowrap shrink-0"
          >
            {saved ? <Check className="w-4 h-4 shrink-0" /> : <Sparkles className="w-4 h-4 shrink-0" />}
            <span className="whitespace-nowrap">{saved ? 'Settings Saved!' : 'Save AI Settings'}</span>
          </button>
        </div>
      </div>

      {/* Provider Selector Cards Grid */}
      <div className="space-y-3">
        <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
          1. Select Active AI Provider Engine
        </label>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Option 1: Gemini */}
          <button
            type="button"
            onClick={() => {
              setProviderId('gemini');
              AIEngine.setActiveProvider('gemini');
            }}
            className={`p-5 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
              providerId === 'gemini'
                ? 'bg-cyan-950/40 border-cyan-500 text-cyan-200 shadow-xl shadow-cyan-500/10 ring-1 ring-cyan-500/50'
                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold">
                  <Sparkles className="w-5 h-5" />
                </div>
                {providerId === 'gemini' && (
                  <span className="text-[10px] bg-cyan-500 text-zinc-950 font-extrabold px-2 py-0.5 rounded-full uppercase">
                    ACTIVE
                  </span>
                )}
              </div>
              <h3 className="text-sm font-bold text-zinc-100 mb-1">Google Cloud Gemini</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Gemini 3.5 Flash, 2.5 Flash, and 2.5 Pro with 4K thinking budget. Instant cloud inference.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-zinc-800/80 text-[11px] text-cyan-400 font-mono">
              Vertex Express / AI Studio
            </div>
          </button>

          {/* Option 2: Local GPU */}
          <button
            type="button"
            onClick={() => {
              setProviderId('local');
              AIEngine.setActiveProvider('local');
            }}
            className={`p-5 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
              providerId === 'local'
                ? 'bg-emerald-950/40 border-emerald-500 text-emerald-800 dark:text-emerald-200 shadow-xl shadow-emerald-500/10 ring-1 ring-emerald-500/50'
                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold">
                  <Cpu className="w-5 h-5" />
                </div>
                {providerId === 'local' && (
                  <span className="text-[10px] bg-emerald-500 text-zinc-950 font-extrabold px-2 py-0.5 rounded-full uppercase">
                    ACTIVE
                  </span>
                )}
              </div>
              <h3 className="text-sm font-bold text-zinc-100 mb-1">Local GPU (Qwen3-VL / Ollama)</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                100% offline & private local Vision-LLM via Ollama, LM Studio, or ComfyUI. Zero API costs.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-zinc-800/80 text-[11px] text-emerald-600 dark:text-emerald-400 font-mono font-bold">
              Qwen3-VL / Qwen2.5-VL 8B
            </div>
          </button>

          {/* Option 3: OpenAI */}
          <button
            type="button"
            onClick={() => {
              setProviderId('openai');
              AIEngine.setActiveProvider('openai');
            }}
            className={`p-5 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
              providerId === 'openai'
                ? 'bg-purple-950/40 border-purple-500 text-purple-200 shadow-xl shadow-purple-500/10 ring-1 ring-purple-500/50'
                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold">
                  <Key className="w-5 h-5" />
                </div>
                {providerId === 'openai' && (
                  <span className="text-[10px] bg-purple-500 text-zinc-950 font-extrabold px-2 py-0.5 rounded-full uppercase">
                    ACTIVE
                  </span>
                )}
              </div>
              <h3 className="text-sm font-bold text-zinc-100 mb-1">OpenAI GPT-4o</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Direct OpenAI API endpoint or custom compatible proxy endpoints for high-fidelity vision reasoning.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-zinc-800/80 text-[11px] text-purple-400 font-mono">
              GPT-4o / GPT-4o-mini
            </div>
          </button>
        </div>
      </div>

      {/* Configuration Detail Cards */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
        {/* Gemini Config */}
        {providerId === 'gemini' && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-zinc-100">Google Gemini API Credentials</h3>
              </div>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-cyan-400 hover:text-cyan-300 font-bold underline"
              >
                Get Free API Key from Google AI Studio ↗
              </a>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-zinc-400 font-medium block">
                Google Gemini API Key (or Vertex AI Express Mode)
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIzaSy... (or configure VITE_GEMINI_API_KEY in .env)"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-xs sm:text-sm text-zinc-200 focus:outline-none focus:border-cyan-500/50 font-mono shadow-inner"
              />
              <p className="text-[11px] text-zinc-500 leading-normal">
                Keys starting with <code>AIzaSy...</code> work directly with Google AI Studio (Free) and Vertex AI Express endpoints.
              </p>
            </div>
          </div>
        )}

        {/* Local GPU Config */}
        {providerId === 'local' && (
          <div className="space-y-5 animate-fade-in">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-sm font-bold text-zinc-100">Local GPU Vision-LLM Server Configuration</h3>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => scanInstalledModels(localEndpoint)}
                  disabled={isScanningModels}
                  className="px-3.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                  title="Query all models installed in Ollama / LM Studio"
                >
                  {isScanningModels ? <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" /> : <span>🔍</span>}
                  <span>{isScanningModels ? 'Scanning...' : 'Scan Local Models'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleTestPing}
                  disabled={isPinging}
                  className="px-4 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-800 dark:text-emerald-300 text-xs font-bold rounded-xl flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isPinging ? <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-500" /> : <Activity className="w-3.5 h-3.5 text-emerald-500" />}
                  <span>{isPinging ? 'Testing Local GPU...' : '⚡ Test Connection'}</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs text-zinc-400 font-bold block">Local API Endpoint URL</label>
                <input
                  type="text"
                  value={localEndpoint}
                  onChange={(e) => setLocalEndpoint(e.target.value)}
                  placeholder="http://localhost:11434/v1"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-xs sm:text-sm text-zinc-200 font-mono focus:outline-none focus:border-emerald-500/50 shadow-inner"
                />
                <div className="text-[11px] text-zinc-500 flex items-center gap-2">
                  <span>Ollama: <code>http://localhost:11434/v1</code></span>
                  <span>|</span>
                  <span>LM Studio: <code>http://localhost:1234/v1</code></span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-zinc-400 font-bold block">Local Vision Model Tag / Identifier</label>
                  {installedModels.length > 0 && (
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                      {installedModels.length} models detected
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  value={localModel}
                  onChange={(e) => setLocalModel(e.target.value)}
                  placeholder="hf.co/mradermacher/Qwen3-VL-8B-Instruct-Heretic-GGUF:Q4_K_M"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-xs sm:text-sm text-zinc-200 font-mono focus:outline-none focus:border-emerald-500/50 shadow-inner"
                />

                {/* 1-Click Installed Local Models Selector */}
                {installedModels.length > 0 && (
                  <div className="p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl space-y-1.5">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                      Installed on Your Machine (Click to select):
                    </span>
                    <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto">
                      {installedModels.map((m) => {
                        const isCurrent = localModel === m.name;
                        return (
                          <button
                            key={m.name}
                            type="button"
                            onClick={() => setLocalModel(m.name)}
                            className={`px-2.5 py-1 text-[11px] font-mono rounded-lg border text-left transition-all cursor-pointer flex items-center gap-1.5 ${
                              isCurrent
                                ? 'bg-emerald-950 border-emerald-500 text-emerald-800 dark:text-emerald-200 font-bold shadow-xs'
                                : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                            }`}
                          >
                            <span>{m.name}</span>
                            {m.size && <span className="text-[9px] text-zinc-500">({m.size})</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Setup Instructions Box */}
            <div className="bg-zinc-950/80 border border-zinc-800/80 rounded-2xl p-4 space-y-2 text-xs text-zinc-400">
              <div className="font-bold text-zinc-200 flex items-center gap-1.5">
                <span>💡 1-Command Ollama Heretic Setup:</span>
              </div>
              <code className="block p-2.5 bg-zinc-900 rounded-xl font-mono text-emerald-600 dark:text-emerald-400 border border-zinc-800 select-all">
                ollama run hf.co/mradermacher/Qwen3-VL-8B-Instruct-Heretic-GGUF:Q4_K_M
              </code>
              <p className="text-[11px] text-zinc-500">
                Ollama will serve this model directly at <code>http://localhost:11434/v1</code> with zero safety refusals.
              </p>
            </div>

            {pingResult && (
              <div
                className={`p-3.5 rounded-2xl border text-xs sm:text-sm flex items-center justify-between animate-fade-in ${
                  pingResult.ok
                    ? 'bg-emerald-950 border-emerald-500 text-emerald-900 dark:text-emerald-200 shadow-sm'
                    : 'bg-red-950 border-red-500 text-red-900 dark:text-red-200 shadow-sm'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>{pingResult.ok ? '✅' : '❌'}</span>
                  <span className="font-bold">{pingResult.ok ? 'Local GPU Vision-LLM Server is Online & Ready!' : pingResult.error}</span>
                </div>
                {pingResult.ok && (
                  <span className="font-mono font-extrabold text-xs bg-emerald-500/20 text-emerald-900 dark:text-emerald-200 px-2.5 py-1 rounded-lg border border-emerald-500/40">
                    {pingResult.latencyMs}ms latency
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {/* OpenAI Config */}
        {providerId === 'openai' && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-purple-400" />
                <h3 className="text-sm font-bold text-zinc-100">OpenAI API Key</h3>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-zinc-400 font-medium block">OpenAI API Key</label>
              <input
                type="password"
                placeholder="sk-..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-xs sm:text-sm text-zinc-200 focus:outline-none focus:border-purple-500/50 font-mono shadow-inner"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
