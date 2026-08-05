import React from 'react';
import { EnvironmentConfig } from '../../types/shot';
import { Sun, CloudRain } from 'lucide-react';

interface EnvironmentBuilderProps {
  environment: EnvironmentConfig;
  onChange: (updatedEnv: EnvironmentConfig) => void;
}

export const EnvironmentBuilder: React.FC<EnvironmentBuilderProps> = ({ environment, onChange }) => {
  return (
    <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-4 space-y-3">
      <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
        <Sun className="w-4 h-4" />
        <span>Environment & Setting Composer</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="text-xs text-zinc-400 font-medium mb-1 block">Location / Setting</label>
          <input
            type="text"
            value={environment.location || ''}
            onChange={(e) => onChange({ ...environment, location: e.target.value })}
            placeholder="e.g. rain-soaked neo-tokyo alleyway"
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-amber-500/50"
          />
        </div>

        <div>
          <label className="text-xs text-zinc-400 font-medium mb-1 block">Lighting Scheme</label>
          <input
            type="text"
            value={environment.lighting || ''}
            onChange={(e) => onChange({ ...environment, lighting: e.target.value })}
            placeholder="e.g. neon cyan and magenta backlight"
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-amber-500/50"
          />
        </div>

        <div>
          <label className="text-xs text-zinc-400 font-medium mb-1 flex items-center gap-1">
            <CloudRain className="w-3 h-3 text-amber-400" />
            Weather & Atmosphere
          </label>
          <input
            type="text"
            value={environment.weather || ''}
            onChange={(e) => onChange({ ...environment, weather: e.target.value })}
            placeholder="e.g. heavy steady rain, rising steam"
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-amber-500/50"
          />
        </div>
      </div>
    </div>
  );
};
