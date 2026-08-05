import React, { useState, useEffect } from 'react';
import { AIEngine } from '../../ai/AIEngine';
import { Key, Sliders, Check, Shield } from 'lucide-react';

export const AISettingsPanel: React.FC = () => {
  const [providerId, setProviderId] = useState('gemini');
  const [apiKey, setApiKey] = useState('');
  const [saved, setSaved] = useState(false);
  const [temperature, setTemperature] = useState(0.7);
  const [visionDetail, setVisionDetail] = useState('high');

  useEffect(() => {
    let storedKey = (localStorage.getItem('minimax_gemini_api_key') || '').trim();
    if (!storedKey) {
      storedKey = (import.meta.env.VITE_GEMINI_API_KEY || '').trim();
    }
    setApiKey(storedKey);
  }, []);

  const handleSave = () => {
    localStorage.setItem('minimax_gemini_api_key', apiKey);
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
            <p className="text-xs text-zinc-400">Configure AI provider, models, temperature, and API keys.</p>
          </div>
        </div>

        <span className="text-xs bg-emerald-950 border border-emerald-500/40 text-emerald-300 px-2.5 py-1 rounded-full font-mono flex items-center gap-1">
          <Shield className="w-3.5 h-3.5" />
          <span>Connected</span>
        </span>
      </div>

      <div className="space-y-4">
        {/* Provider Selector */}
        <div>
          <label className="text-xs text-zinc-400 font-medium mb-1.5 block">Active AI Provider</label>
          <div className="grid grid-cols-2 gap-2">
            {AIEngine.getAvailableProviders().map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  setProviderId(p.id);
                  AIEngine.setActiveProvider(p.id);
                }}
                className={`p-3 rounded-xl border text-left text-xs font-semibold transition-all ${
                  providerId === p.id
                    ? 'bg-cyan-950/60 border-cyan-500 text-cyan-300 shadow-lg shadow-cyan-500/10'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        {/* API Key */}
        <div>
          <label className="text-xs text-zinc-400 font-medium mb-1.5 flex items-center gap-1.5">
            <Key className="w-3.5 h-3.5 text-cyan-400" />
            Gemini 2.5 Pro API Key
          </label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="AIzaSy... (or configure VITE_GEMINI_API_KEY in .env)"
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-zinc-200 focus:outline-none focus:border-cyan-500/50 font-mono"
          />
        </div>

        {/* Creativity Controls */}
        <div className="grid grid-cols-2 gap-4 pt-2">
          <div>
            <label className="text-xs text-zinc-400 font-medium mb-1 block">
              Director Creativity (Temperature: {temperature})
            </label>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className="w-full accent-cyan-500"
            />
          </div>

          <div>
            <label className="text-xs text-zinc-400 font-medium mb-1 block">Vision Detail Level</label>
            <select
              value={visionDetail}
              onChange={(e) => setVisionDetail(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none"
            >
              <option value="high">High Detail (Full Visual DNA)</option>
              <option value="medium">Medium Detail</option>
              <option value="low">Fast Low Detail</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button
          type="button"
          onClick={handleSave}
          className="px-5 py-2 bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-cyan-500/20 transition-all"
        >
          {saved ? <Check className="w-4 h-4" /> : null}
          <span>{saved ? 'Saved!' : 'Save AI Settings'}</span>
        </button>
      </div>
    </div>
  );
};
