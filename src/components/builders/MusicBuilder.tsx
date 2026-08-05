import React from 'react';
import { NonDiegeticMusicConfig } from '../../types/audio';
import { Music } from 'lucide-react';

interface MusicBuilderProps {
  music: NonDiegeticMusicConfig;
  onChange: (updatedMusic: NonDiegeticMusicConfig) => void;
}

const TEMPOS: Array<NonDiegeticMusicConfig['tempo']> = ['very slow', 'slow', 'moderate', 'fast', 'energetic'];

export const MusicBuilder: React.FC<MusicBuilderProps> = ({ music, onChange }) => {
  return (
    <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-pink-400 font-semibold text-sm">
          <Music className="w-4 h-4" />
          <span>Non-Diegetic Music Orchestrator (`non_diegetic_music`)</span>
        </div>

        <button
          type="button"
          onClick={() => onChange({ ...music, hasMusic: !music.hasMusic })}
          className={`px-3 py-1 text-xs rounded-lg flex items-center gap-1.5 transition-all ${
            !music.hasMusic
              ? 'bg-zinc-800 text-zinc-400 border border-zinc-700'
              : 'bg-pink-950/80 border border-pink-500 text-pink-200 font-semibold'
          }`}
        >
          <span>{music.hasMusic ? 'Background Music Active' : 'No Music (N/A)'}</span>
        </button>
      </div>

      {music.hasMusic && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-zinc-400 font-medium mb-1 block">Genre / Musical Style</label>
            <input
              type="text"
              value={music.genreStyle}
              onChange={(e) => onChange({ ...music, genreStyle: e.target.value })}
              placeholder="e.g. Dark Cyberpunk Synthwave"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-pink-500/50"
            />
          </div>

          <div>
            <label className="text-xs text-zinc-400 font-medium mb-1 block">Instrumentation</label>
            <input
              type="text"
              value={music.instrumentation.join(', ')}
              onChange={(e) =>
                onChange({
                  ...music,
                  instrumentation: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                })
              }
              placeholder="e.g. heavy synth bass, arpeggiated lead keys"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-pink-500/50"
            />
          </div>

          <div>
            <label className="text-xs text-zinc-400 font-medium mb-1.5 block">Tempo Pacing</label>
            <div className="flex gap-1">
              {TEMPOS.map((t) => {
                const isSelected = music.tempo === t;
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => onChange({ ...music, tempo: t })}
                    className={`flex-1 py-1 text-[11px] rounded capitalize transition-all ${
                      isSelected
                        ? 'bg-pink-900/50 border border-pink-500 text-pink-200 font-semibold'
                        : 'bg-zinc-800/60 text-zinc-400 border border-zinc-800 hover:bg-zinc-800'
                    }`}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-xs text-zinc-400 font-medium mb-1 block">Musical Dynamics & Crescendo</label>
            <input
              type="text"
              value={music.dynamics}
              onChange={(e) => onChange({ ...music, dynamics: e.target.value })}
              placeholder="e.g. rapid crescendo reaching peak at the cut"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-pink-500/50"
            />
          </div>
        </div>
      )}
    </div>
  );
};
