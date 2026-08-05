import React from 'react';
import { AudioSettings, SoundscapeLayer } from '../../types/audio';
import { Volume2, MicOff } from 'lucide-react';

interface AudioBuilderProps {
  audio: AudioSettings;
  onChange: (updatedAudio: Partial<AudioSettings>) => void;
}

const CATEGORIES: Array<SoundscapeLayer['category']> = [
  'weather',
  'footsteps',
  'machinery',
  'ambient',
  'animals',
  'crowd',
  'impacts',
  'physics',
];

export const AudioBuilder: React.FC<AudioBuilderProps> = ({ audio, onChange }) => {
  const toggleLayer = (index: number) => {
    const newLayers = [...audio.soundscapeLayers];
    newLayers[index].enabled = !newLayers[index].enabled;
    onChange({ soundscapeLayers: newLayers });
  };

  const updateLayerDesc = (index: number, desc: string) => {
    const newLayers = [...audio.soundscapeLayers];
    newLayers[index].description = desc;
    onChange({ soundscapeLayers: newLayers });
  };

  return (
    <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
          <Volume2 className="w-4 h-4" />
          <span>Overall Soundscape Composer (`overall_soundscape`)</span>
        </div>

        <button
          type="button"
          onClick={() => onChange({ isSilent: !audio.isSilent })}
          className={`px-3 py-1 text-xs rounded-lg flex items-center gap-1.5 transition-all ${
            audio.isSilent
              ? 'bg-red-950/80 border border-red-500 text-red-300 font-semibold'
              : 'bg-zinc-800 text-zinc-300 border border-zinc-700 hover:bg-zinc-700'
          }`}
        >
          <MicOff className="w-3.5 h-3.5" />
          <span>{audio.isSilent ? 'Silent Mode (N/A)' : 'Audio Enabled'}</span>
        </button>
      </div>

      {!audio.isSilent && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {audio.soundscapeLayers.map((layer, idx) => (
              <div
                key={layer.category}
                className={`p-3 rounded-lg border transition-all ${
                  layer.enabled
                    ? 'bg-zinc-950 border-emerald-500/40'
                    : 'bg-zinc-950/40 border-zinc-800/60 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold capitalize text-emerald-300">{layer.category} Layer</span>
                  <input
                    type="checkbox"
                    checked={layer.enabled}
                    onChange={() => toggleLayer(idx)}
                    className="accent-emerald-500 w-3.5 h-3.5 cursor-pointer"
                  />
                </div>
                <input
                  type="text"
                  value={layer.description}
                  onChange={(e) => updateLayerDesc(idx, e.target.value)}
                  placeholder={`Describe ${layer.category} sound details...`}
                  disabled={!layer.enabled}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500/50 disabled:opacity-50"
                />
              </div>
            ))}
          </div>

          <div>
            <label className="text-xs text-zinc-400 font-medium mb-1 block">Custom Soundscape Summary Paragraph Override</label>
            <textarea
              rows={2}
              value={audio.customSoundscape || ''}
              onChange={(e) => onChange({ customSoundscape: e.target.value })}
              placeholder="Leave empty to auto-compile active layers above into official soundscape paragraph."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500/50"
            />
          </div>
        </>
      )}
    </div>
  );
};
