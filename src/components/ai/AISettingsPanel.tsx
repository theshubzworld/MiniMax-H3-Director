import React, { useState, useEffect } from 'react';
import { AIEngine } from '../../ai/AIEngine';
import { LocalProvider } from '../../ai/providers/LocalProvider';
import { Key, Sliders, Check, Shield, Cpu, Activity, Loader2, Sparkles } from 'lucide-react';

export const AISettingsPanel: React.FC = () => {
  const [providerId, setProviderId] = useState('gemini');
  const [apiKey, setApiKey] = useState('');
  const [localEndpoint, setLocalEndpoint] = useState('http://localhost:11434/v1');
  const [localModel, setLocalModel] = useState('qwen2.5-vl:8b');
  const [isPinging, setIsPinging] = useState(false);
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
  }, []);

  const handleTestPing = async () => {
    setIsPinging(true);
    setPingResult(null);
    try {
      localStorage.setItem('minimax_local_endpoint', localEndpoint);
      localStorage.setItem('minimax_local_model', localModel);
      const localProv = new LocalProvider();
      const res = await localProv.pingServer();
      setPingResult(res);
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
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-6 max-w-2xl mx-auto shadow-2xl">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-bold">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-zinc-100">AI Director Engine Settings</h2>
            <p className="text-xs text-zinc-400">Configure Cloud (Gemini) or Local GPU (Qwen3-VL / Ollama / LM Studio) credentials.</p>
          </div>
        </div>

        <span className="text-xs bg-emerald-950 border border-emerald-500/40 text-emerald-300 px-2.5 py-1 rounded-full font-mono flex items-center gap-1">
          <Shield className="w-3.5 h-3.5" />
          <span>Active: {providerId.toUpperCase()}</span>
        </span>
      </div>

      <div className="space-y-4">
        {/* Provider Selector */}
        <div>
          <label className="text-xs text-zinc-400 font-medium mb-1.5 block">Active AI Provider</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {AIEngine.getAvailableProviders().map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  setProviderId(p.id);
                  AIEngine.setActiveProvider(p.id);
                }}
                className={`p-3 rounded-xl border text-left text-xs font-semibold transition-all cursor-pointer ${
                  providerId === p.id
                    ? 'bg-cyan-950/60 border-cyan-500 text-cyan-300 shadow-lg shadow-cyan-500/10'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <div className="font-bold">{p.name}</div>
                <div className="text-[10px] text-zinc-500 mt-0.5">
                  {p.id === 'gemini' && 'Google Cloud Vertex / Studio'}
                  {p.id === 'local' && 'Qwen3-VL / Ollama / LM Studio'}
                  {p.id === 'openai' && 'OpenAI GPT-4o / Compatible'}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Local GPU Settings */}
        {providerId === 'local' && (
          <div className="p-4 bg-zinc-950/80 rounded-xl border border-cyan-500/30 space-y-3 animate-fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-300">
                <Cpu className="w-4 h-4 text-cyan-400" />
                <span>Local GPU Vision-LLM Configuration</span>
              </div>
              <button
                type="button"
                onClick={handleTestPing}
                disabled={isPinging}
                className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              >
                {isPinging ? <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" /> : <Activity className="w-3.5 h-3.5 text-cyan-400" />}
                <span>{isPinging ? 'Pinging...' : 'Test Connection'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              <div>
                <label className="text-zinc-400 font-medium mb-1 block">Local API Endpoint</label>
                <input
                  type="text"
                  value={localEndpoint}
                  onChange={(e) => setLocalEndpoint(e.target.value)}
                  placeholder="http://localhost:11434/v1"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-200 font-mono focus:outline-none focus:border-cyan-500/50"
                />
                <span className="text-[10px] text-zinc-500">Ollama: :11434/v1 | LM Studio: :1234/v1</span>
              </div>

              <div>
                <label className="text-zinc-400 font-medium mb-1 block">Local Model Name</label>
                <input
                  type="text"
                  value={localModel}
                  onChange={(e) => setLocalModel(e.target.value)}
                  placeholder="qwen2.5-vl:8b"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-200 font-mono focus:outline-none focus:border-cyan-500/50"
                />
                <span className="text-[10px] text-zinc-500">e.g. qwen2.5-vl:8b or qwen3-vl-8b-heretic</span>
              </div>
            </div>

            {pingResult && (
              <div
                className={`p-2.5 rounded-lg border text-xs flex items-center justify-between ${
                  pingResult.ok
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                    : 'bg-red-950/40 border-red-500/40 text-red-300'
                }`}
              >
                <span>{pingResult.ok ? '✅ Local GPU Server Connected!' : `❌ ${pingResult.error}`}</span>
                {pingResult.ok && <span className="font-mono font-bold text-[11px]">{pingResult.latencyMs}ms latency</span>}
              </div>
            )}
          </div>
        )}

        {/* Gemini API Key */}
        {providerId === 'gemini' && (
          <div>
            <label className="text-xs text-zinc-400 font-medium mb-1.5 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-cyan-400" />
              Gemini 2.5 Pro / 3.5 Flash API Key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIzaSy... (or configure VITE_GEMINI_API_KEY in .env)"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-zinc-200 focus:outline-none focus:border-cyan-500/50 font-mono"
            />
          </div>
        )}
      </div>

      <div className="flex justify-end pt-2">
        <button
          type="button"
          onClick={handleSave}
          className="px-5 py-2 bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
        >
          {saved ? <Check className="w-4 h-4" /> : null}
          <span>{saved ? 'Saved!' : 'Save AI Settings'}</span>
        </button>
      </div>
    </div>
  );
};
