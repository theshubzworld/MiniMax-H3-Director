import React, { useState, useEffect } from 'react';
import { AIEngine } from '../../ai/AIEngine';
import { LocalProvider } from '../../ai/providers/LocalProvider';
import { GeminiProvider } from '../../ai/providers/GeminiProvider';
import { Key, Sliders, Check, Shield, Cpu, Activity, Loader2, Sparkles, Download, Copy, ExternalLink, Play } from 'lucide-react';

interface RecommendedModel {
  name: string;
  tag: string;
  vram: string;
  badge: string;
  badgeColor: string;
  desc: string;
  hfUrl: string;
  ollamaUrl: string;
  ollamaCmd: string;
}

const RECOMMENDED_LOCAL_MODELS: RecommendedModel[] = [
  {
    name: 'Qwen3-VL 8B Heretic (Uncensored Vision)',
    tag: 'hf.co/mradermacher/Qwen3-VL-8B-Instruct-Heretic-GGUF:Q4_K_M',
    vram: '~5.4 GB (6GB+ VRAM)',
    badge: '👑 TOP CHOICE / UNCENSORED',
    badgeColor: 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-500/40',
    desc: 'Unfiltered vision-language model for candid, intimate, raw smartphone, and unfiltered cinematic scene reasoning.',
    hfUrl: 'https://huggingface.co/mradermacher/Qwen3-VL-8B-Instruct-Heretic-GGUF',
    ollamaUrl: 'https://huggingface.co/mradermacher/Qwen3-VL-8B-Instruct-Heretic-GGUF',
    ollamaCmd: 'ollama run hf.co/mradermacher/Qwen3-VL-8B-Instruct-Heretic-GGUF:Q4_K_M',
  },
  {
    name: 'Qwen2.5-VL 3B Instruct (Ultra-Fast)',
    tag: 'qwen2.5vl:3b',
    vram: '~3.2 GB (4GB+ VRAM)',
    badge: '⚡ ULTRA LIGHTWEIGHT',
    badgeColor: 'bg-cyan-500/20 text-cyan-800 dark:text-cyan-300 border-cyan-500/40',
    desc: 'Super-fast, low VRAM model ideal for laptop GPUs, GTX 1660 / RTX 3050, or instant generation.',
    hfUrl: 'https://huggingface.co/mradermacher/Qwen2.5-VL-3B-Instruct-GGUF',
    ollamaUrl: 'https://ollama.com/library/qwen2.5vl',
    ollamaCmd: 'ollama run qwen2.5vl:3b',
  },
  {
    name: 'Qwen2.5-VL 7B Instruct (Standard)',
    tag: 'qwen2.5vl:7b',
    vram: '~6.0 GB (8GB+ VRAM)',
    badge: '🎯 HIGH PRECISION',
    badgeColor: 'bg-blue-500/20 text-blue-800 dark:text-blue-300 border-blue-500/40',
    desc: 'Official Alibaba vision model with high image understanding and sharp camera trajectory breakdown.',
    hfUrl: 'https://huggingface.co/mradermacher/Qwen2.5-VL-7B-Instruct-GGUF',
    ollamaUrl: 'https://ollama.com/library/qwen2.5vl',
    ollamaCmd: 'ollama run qwen2.5vl:7b',
  },
  {
    name: 'LLaVA 7B Vision (Lightweight)',
    tag: 'llava:7b',
    vram: '~4.5 GB (6GB+ VRAM)',
    badge: '🖼️ PROVEN VISION',
    badgeColor: 'bg-purple-500/20 text-purple-800 dark:text-purple-300 border-purple-500/40',
    desc: 'Battle-tested vision model with fast inference and wide community compatibility across all Ollama versions.',
    hfUrl: 'https://huggingface.co/liuhaotian/llava-v1.5-7b',
    ollamaUrl: 'https://ollama.com/library/llava',
    ollamaCmd: 'ollama run llava:7b',
  },
];

export const AISettingsPanel: React.FC = () => {
  const [providerId, setProviderId] = useState('gemini');
  const [apiKey, setApiKey] = useState('');
  const [localEndpoint, setLocalEndpoint] = useState('http://localhost:11434/v1');
  const [localModel, setLocalModel] = useState('hf.co/mradermacher/Qwen3-VL-8B-Instruct-Heretic-GGUF:Q4_K_M');
  const [isPinging, setIsPinging] = useState(false);
  const [isScanningModels, setIsScanningModels] = useState(false);
  const [isTestingGemini, setIsTestingGemini] = useState(false);
  const [geminiTestResult, setGeminiTestResult] = useState<{ ok: boolean; model: string; error?: string } | null>(null);
  const [installedModels, setInstalledModels] = useState<{ name: string; size?: string }[]>([]);
  const [isCustomModel, setIsCustomModel] = useState(false);
  const [copiedModelTag, setCopiedModelTag] = useState<string | null>(null);
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

  const handleTestGeminiKey = async () => {
    setIsTestingGemini(true);
    setGeminiTestResult(null);
    try {
      localStorage.setItem('minimax_gemini_api_key', apiKey);
      const res = await GeminiProvider.testApiKey(apiKey);
      setGeminiTestResult(res);
    } catch (err: any) {
      setGeminiTestResult({ ok: false, model: '', error: err.message || 'Key validation failed' });
    } finally {
      setIsTestingGemini(false);
    }
  };

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
    <div className="w-full space-y-5 pb-8">
      {/* Header Banner */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-lg flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-bold shadow-md shadow-cyan-500/10 shrink-0">
            <Sliders className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg font-extrabold text-zinc-100 flex items-center gap-2 whitespace-nowrap">
              <span>AI Director Engine Settings</span>
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5 leading-normal">
              Configure Cloud Gemini (Vertex Express / AI Studio) or Local GPU (Qwen3-VL / Ollama / LM Studio).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <span className="text-xs bg-emerald-950 border border-emerald-500/40 text-emerald-800 dark:text-emerald-300 px-3 py-1.5 rounded-xl font-mono font-bold flex items-center gap-2 whitespace-nowrap shrink-0">
            <Shield className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="whitespace-nowrap">Active: {providerId.toUpperCase()}</span>
          </span>

          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-zinc-950 font-extrabold rounded-xl text-xs flex items-center gap-2 shadow-md shadow-cyan-500/20 transition-all cursor-pointer whitespace-nowrap shrink-0"
          >
            {saved ? <Check className="w-3.5 h-3.5 shrink-0" /> : <Sparkles className="w-3.5 h-3.5 shrink-0" />}
            <span className="whitespace-nowrap">{saved ? 'Saved!' : 'Save AI Settings'}</span>
          </button>
        </div>
      </div>

      {/* Provider Selector Cards Grid */}
      <div className="space-y-2.5">
        <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
          1. Select Active AI Provider Engine
        </label>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {/* Option 1: Gemini */}
          <button
            type="button"
            onClick={() => {
              setProviderId('gemini');
              AIEngine.setActiveProvider('gemini');
            }}
            className={`p-4 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
              providerId === 'gemini'
                ? 'bg-cyan-950/40 border-cyan-500 text-cyan-200 shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-500/50'
                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold">
                  <Sparkles className="w-4 h-4" />
                </div>
                {providerId === 'gemini' && (
                  <span className="text-[9px] bg-cyan-500 text-zinc-950 font-extrabold px-2 py-0.5 rounded-full uppercase font-mono">
                    ACTIVE
                  </span>
                )}
              </div>
              <h3 className="text-xs font-bold text-zinc-100 mb-0.5">Google Cloud Gemini</h3>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Gemini 3.5 Flash, 2.5 Flash, and 2.5 Pro with 4K thinking budget. Instant cloud inference.
              </p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-zinc-800/80 text-[10px] text-cyan-400 font-mono">
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
            className={`p-4 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
              providerId === 'local'
                ? 'bg-emerald-950/40 border-emerald-500 text-emerald-800 dark:text-emerald-200 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/50'
                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold">
                  <Cpu className="w-4 h-4" />
                </div>
                {providerId === 'local' && (
                  <span className="text-[9px] bg-emerald-500 text-zinc-950 font-extrabold px-2 py-0.5 rounded-full uppercase font-mono">
                    ACTIVE
                  </span>
                )}
              </div>
              <h3 className="text-xs font-bold text-zinc-100 mb-0.5">Local GPU (Qwen3-VL / Ollama)</h3>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                100% offline & private local Vision-LLM via Ollama, LM Studio, or ComfyUI. Zero API costs.
              </p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-zinc-800/80 text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-bold">
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
            className={`p-4 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
              providerId === 'openai'
                ? 'bg-purple-950/40 border-purple-500 text-purple-200 shadow-lg shadow-purple-500/10 ring-1 ring-purple-500/50'
                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold">
                  <Key className="w-4 h-4" />
                </div>
                {providerId === 'openai' && (
                  <span className="text-[9px] bg-purple-500 text-zinc-950 font-extrabold px-2 py-0.5 rounded-full uppercase font-mono">
                    ACTIVE
                  </span>
                )}
              </div>
              <h3 className="text-xs font-bold text-zinc-100 mb-0.5">OpenAI GPT-4o</h3>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Direct OpenAI API endpoint or custom compatible proxy endpoints for high-fidelity vision reasoning.
              </p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-zinc-800/80 text-[10px] text-purple-400 font-mono">
              GPT-4o / GPT-4o-mini
            </div>
          </button>
        </div>
      </div>

      {/* Configuration Detail Cards */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
        {/* Gemini Config */}
        {providerId === 'gemini' && (
          <div className="space-y-5 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-800 pb-3 gap-2">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-zinc-100">Google Gemini & Vertex AI Credentials</h3>
              </div>

              <button
                type="button"
                onClick={handleTestGeminiKey}
                disabled={isTestingGemini}
                className="px-4 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-400 dark:text-cyan-300 text-xs font-bold rounded-xl flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50 self-start sm:self-auto shrink-0"
              >
                {isTestingGemini ? <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" /> : <Activity className="w-3.5 h-3.5 text-cyan-400" />}
                <span>{isTestingGemini ? 'Validating Key...' : '⚡ Test Google API Key'}</span>
              </button>
            </div>

            {/* Dual Method Setup Cards (AI Studio vs Vertex AI) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Option A: Google AI Studio (Free) */}
              <div className="bg-zinc-950/80 border border-zinc-800 rounded-2xl p-4.5 flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-xs text-zinc-100 flex items-center gap-1.5">
                      <span>✨ Method 1: Google AI Studio</span>
                      <span className="text-[9px] bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                        FREE & INSTANT
                      </span>
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    Zero credit card required. Free tier includes Gemini 3.5 Flash, 2.5 Flash, and Gemini 2.5 Pro reasoning models.
                  </p>
                </div>

                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-2 bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-400 dark:text-cyan-300 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all text-center"
                >
                  <span>Get Free Key at Google AI Studio ↗</span>
                </a>
              </div>

              {/* Option B: Google Cloud Vertex AI */}
              <div className="bg-zinc-950/80 border border-zinc-800 rounded-2xl p-4.5 flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-xs text-zinc-100 flex items-center gap-1.5">
                      <span>🏢 Method 2: Google Cloud Vertex AI</span>
                      <span className="text-[9px] bg-purple-500/20 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-full font-bold">
                        HIGH QUOTA
                      </span>
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    For enterprise high-throughput generation. Uses global Vertex AI Express endpoints with custom project quota.
                  </p>
                </div>

                <a
                  href="https://console.cloud.google.com/apis/credentials"
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-2 bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-purple-400 dark:text-purple-300 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all text-center"
                >
                  <span>Get Vertex Key in Google Cloud Console ↗</span>
                </a>
              </div>
            </div>

            {/* Input Field */}
            <div className="space-y-2">
              <label className="text-xs text-zinc-300 font-bold block">
                Enter Your Google Gemini / Vertex API Key:
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIzaSy... (or configure VITE_GEMINI_API_KEY in .env)"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-xs sm:text-sm text-zinc-200 focus:outline-none focus:border-cyan-500/50 font-mono shadow-inner"
              />
              <p className="text-[11px] text-zinc-500 leading-normal">
                Your key is stored strictly in local browser storage (<code>localStorage</code>) and is never sent to third-party tracking servers.
              </p>
            </div>

            {/* Live Verification Status Banner */}
            {geminiTestResult && (
              <div
                className={`p-3.5 rounded-2xl border text-xs sm:text-sm flex items-center justify-between animate-fade-in ${
                  geminiTestResult.ok
                    ? 'bg-emerald-950 border-emerald-500 text-emerald-900 dark:text-emerald-200 shadow-sm'
                    : 'bg-red-950 border-red-500 text-red-900 dark:text-red-200 shadow-sm'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>{geminiTestResult.ok ? '✅' : '❌'}</span>
                  <span className="font-bold">
                    {geminiTestResult.ok
                      ? `Google API Key Verified & Active! (${geminiTestResult.model})`
                      : geminiTestResult.error}
                  </span>
                </div>
              </div>
            )}
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
                  <label className="text-xs text-zinc-300 font-bold block">Local Vision Model</label>
                  {installedModels.length > 0 ? (
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                      {installedModels.length} local models detected
                    </span>
                  ) : (
                    <span className="text-[10px] text-zinc-500">Popular defaults</span>
                  )}
                </div>

                {/* Main Native Dropdown Selector */}
                <div className="relative">
                  <select
                    value={
                      installedModels.some((m) => m.name === localModel)
                        ? localModel
                        : RECOMMENDED_LOCAL_MODELS.some((m) => m.tag === localModel)
                        ? localModel
                        : '__custom__'
                    }
                    onChange={(e) => {
                      if (e.target.value === '__custom__') {
                        setIsCustomModel(true);
                      } else {
                        setIsCustomModel(false);
                        setLocalModel(e.target.value);
                      }
                    }}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-xs sm:text-sm text-zinc-200 focus:outline-none focus:border-emerald-500/50 shadow-inner cursor-pointer appearance-none"
                  >
                    {installedModels.length > 0 && (
                      <optgroup label="✨ Detected On Your Machine">
                        {installedModels.map((m) => (
                          <option key={m.name} value={m.name}>
                            {m.name} {m.size ? `(${m.size})` : ''}
                          </option>
                        ))}
                      </optgroup>
                    )}

                    <optgroup label="🔥 Recommended Vision Models">
                      {RECOMMENDED_LOCAL_MODELS.map((m) => (
                        <option key={m.tag} value={m.tag}>
                          {m.name} ({m.vram})
                        </option>
                      ))}
                    </optgroup>

                    <option value="__custom__">✍️ Custom Model Tag (Type Manually...)</option>
                  </select>

                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400 text-xs">
                    ▼
                  </div>
                </div>

                {/* Custom Model Input (If selected or manual mode) */}
                {isCustomModel && (
                  <div className="pt-1.5 animate-fade-in">
                    <input
                      type="text"
                      value={localModel}
                      onChange={(e) => setLocalModel(e.target.value)}
                      placeholder="e.g. hf.co/user/custom-model:Q4_K_M"
                      className="w-full bg-zinc-950 border border-emerald-500/40 rounded-xl px-4 py-2 text-xs text-zinc-200 font-mono focus:outline-none focus:border-emerald-500 shadow-inner"
                      autoFocus
                    />
                    <div className="flex justify-between items-center mt-1 text-[10px] text-zinc-500">
                      <span>Type any model tag registered in Ollama / LM Studio</span>
                      <button
                        type="button"
                        onClick={() => setIsCustomModel(false)}
                        className="text-cyan-400 hover:underline cursor-pointer"
                      >
                        Back to dropdown
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Recommended Local Vision Models Library & 1-Click Setup Cards */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-200 flex items-center gap-1.5 uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Recommended Vision Models & 1-Click Commands</span>
                </span>
                <span className="text-[11px] text-zinc-500 font-mono">
                  Ollama · LM Studio · GGUF
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {RECOMMENDED_LOCAL_MODELS.map((item) => {
                  const isActive = localModel === item.tag;
                  const isCopied = copiedModelTag === item.tag;

                  return (
                    <div
                      key={item.tag}
                      className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                        isActive
                          ? 'bg-emerald-950/40 border-emerald-500/60 ring-1 ring-emerald-500/30'
                          : 'bg-zinc-950/70 border-zinc-800/90 hover:border-zinc-700'
                      }`}
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-xs font-bold text-zinc-100 leading-tight">
                            {item.name}
                          </span>
                          <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-md border shrink-0 ${item.badgeColor}`}>
                            {item.vram}
                          </span>
                        </div>

                        <p className="text-[11px] text-zinc-400 leading-relaxed">
                          {item.desc}
                        </p>

                        <div className="pt-1">
                          <code className="block p-2 bg-zinc-900 border border-zinc-800/80 rounded-lg text-[10px] font-mono text-emerald-600 dark:text-emerald-400 truncate select-all">
                            {item.ollamaCmd}
                          </code>
                        </div>
                      </div>

                      {/* Action Buttons Row */}
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(item.ollamaCmd);
                            setCopiedModelTag(item.tag);
                            setTimeout(() => setCopiedModelTag(null), 2000);
                          }}
                          className="flex-1 py-1.5 px-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                          title="Copy terminal command to run model in Ollama"
                        >
                          <Copy className="w-3.5 h-3.5 text-zinc-400" />
                          <span>{isCopied ? '✓ Copied' : 'Copy Command'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setLocalModel(item.tag);
                            setIsCustomModel(false);
                            localStorage.setItem('minimax_local_model', item.tag);
                          }}
                          className={`py-1.5 px-2.5 text-xs font-bold rounded-xl border transition-all flex items-center justify-center gap-1 cursor-pointer ${
                            isActive
                              ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-800 dark:text-emerald-300'
                              : 'bg-zinc-900 hover:bg-emerald-950/40 border-zinc-700 hover:border-emerald-500/40 text-zinc-300'
                          }`}
                          title="Set as active model in Studio"
                        >
                          <span>{isActive ? '✓ Active' : '⚡ Use Model'}</span>
                        </button>

                        <div className="flex items-center gap-1 shrink-0">
                          {item.ollamaUrl !== item.hfUrl && (
                            <a
                              href={item.ollamaUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-emerald-400 rounded-xl transition-all flex items-center gap-1 text-[11px] font-mono"
                              title="Open Ollama Model Page"
                            >
                              <span>🦙 Ollama</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}

                          <a
                            href={item.hfUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="px-2 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-amber-400 rounded-xl transition-all flex items-center gap-1 text-[11px] font-mono"
                            title="Open Hugging Face / Download GGUF"
                          >
                            <span>🤗 GGUF</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
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
