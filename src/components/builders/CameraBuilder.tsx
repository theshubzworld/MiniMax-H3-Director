import React from 'react';
import { CameraConfig, CameraMotionType, CameraAmplitude, CameraSpeed } from '../../types/shot';
import { Video, Sliders, Zap, Target } from 'lucide-react';

interface CameraBuilderProps {
  camera: CameraConfig;
  onChange: (updatedCamera: CameraConfig) => void;
}

const MOTION_TYPES: CameraMotionType[] = [
  'Push In',
  'Pull Out',
  'Pan Left',
  'Pan Right',
  'Truck Left',
  'Truck Right',
  'Tilt Up',
  'Tilt Down',
  'Pedestal Up',
  'Pedestal Down',
  'Arc Shot',
  'Tracking Shot',
  'Static Shot',
  'Shake Slightly',
  'Shake Strongly',
  'POV',
  'Zoom In',
  'Zoom Out',
];

const AMPLITUDES: CameraAmplitude[] = ['small amplitude', 'medium amplitude', 'large amplitude'];
const SPEEDS: CameraSpeed[] = ['slow speed', 'normal speed', 'fast speed'];

const FOCAL_ANCHOR_PRESETS = [
  'glowing cybernetic eyes',
  'her short crimson bob hair',
  'energized plasma katana blade',
  'the primary protagonist',
  'black leather trench coat',
  'glowing neon hologram emblem',
  'folded vintage letter',
  'antique golden pocketwatch',
  'drifting hypercar front grille',
  'approaching security drone',
  'steaming espresso cup',
  'soaring crimson dragon rider',
  'alien crystalline monolith',
  'glowing cyber-deck visor',
  'heavy metallic vault door',
  'shattering glass reflection',
  'flowing silk evening gown',
  'intense determined expression',
  'glowing magic spell pendant',
  'rain-soaked alleyway neon sign',
  'spinning vinyl record player',
  'military mecha shoulder cannon',
  'swirling cherry blossom leaves',
  'high-tech wristwatch display',
  'gleaming silver revolver',
  'glowing tactical visor optics',
  'distanced city skyline illumination',
  'vintage leather camera lens',
  'pulsing power core reactor',
  'heroic standing silhouette',
];

export const CameraBuilder: React.FC<CameraBuilderProps> = ({ camera, onChange }) => {
  return (
    <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-4 space-y-4">
      <div className="flex items-center gap-2 text-cyan-400 font-semibold text-sm">
        <Video className="w-4 h-4" />
        <span>3D Camera Motion Direction Engine</span>
      </div>

      {/* Motion Type Chips */}
      <div>
        <label className="text-xs text-zinc-400 font-medium mb-1.5 block">Camera Movement Type</label>
        <div className="flex flex-wrap gap-1.5">
          {MOTION_TYPES.map((type) => {
            const isSelected = camera.motionType === type;
            return (
              <button
                key={type}
                type="button"
                onClick={() => onChange({ ...camera, motionType: type })}
                className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all ${
                  isSelected
                    ? 'bg-cyan-500 text-zinc-950 font-semibold shadow-lg shadow-cyan-500/20 scale-[1.02]'
                    : 'bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700 hover:text-white border border-zinc-700/50'
                }`}
              >
                {type}
              </button>
            );
          })}
        </div>
      </div>

      {/* Amplitude & Speed Chips */}
      {camera.motionType !== 'Static Shot' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          <div>
            <label className="text-xs text-zinc-400 font-medium mb-1.5 flex items-center gap-1">
              <Sliders className="w-3 h-3 text-cyan-400" />
              Amplitude Range
            </label>
            <div className="flex gap-1.5">
              {AMPLITUDES.map((amp) => {
                const isSelected = camera.amplitude === amp;
                return (
                  <button
                    key={amp}
                    type="button"
                    onClick={() => onChange({ ...camera, amplitude: amp })}
                    className={`flex-1 py-1 text-xs rounded-md capitalize transition-all ${
                      isSelected
                        ? 'bg-cyan-900/50 border border-cyan-500 text-cyan-200 font-medium'
                        : 'bg-zinc-800/60 text-zinc-400 border border-zinc-800 hover:bg-zinc-800'
                    }`}
                  >
                    {amp.replace(' amplitude', '')}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-xs text-zinc-400 font-medium mb-1.5 flex items-center gap-1">
              <Zap className="w-3 h-3 text-cyan-400" />
              Movement Pacing
            </label>
            <div className="flex gap-1.5">
              {SPEEDS.map((sp) => {
                const isSelected = camera.speed === sp;
                return (
                  <button
                    key={sp}
                    type="button"
                    onClick={() => onChange({ ...camera, speed: sp })}
                    className={`flex-1 py-1 text-xs rounded-md capitalize transition-all ${
                      isSelected
                        ? 'bg-cyan-900/50 border border-cyan-500 text-cyan-200 font-medium'
                        : 'bg-zinc-800/60 text-zinc-400 border border-zinc-800 hover:bg-zinc-800'
                    }`}
                  >
                    {sp.replace(' speed', '')}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Target Subject Field & 30 Focal Anchor Presets */}
      <div className="space-y-2">
        <label className="text-xs text-zinc-400 font-medium flex items-center gap-1.5">
          <Target className="w-3.5 h-3.5 text-cyan-400" />
          Target Subject / Focal Anchor (30 Presets Available)
        </label>

        <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pr-1">
          {FOCAL_ANCHOR_PRESETS.map((preset) => {
            const isSelected = camera.targetSubject === preset;
            return (
              <button
                key={preset}
                type="button"
                onClick={() => onChange({ ...camera, targetSubject: preset })}
                className={`px-2.5 py-0.5 text-[11px] rounded-lg transition-all ${
                  isSelected
                    ? 'bg-cyan-500 text-zinc-950 font-bold shadow-md shadow-cyan-500/20'
                    : 'bg-zinc-950 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 hover:border-cyan-500/40'
                }`}
              >
                {preset}
              </button>
            );
          })}
        </div>

        <input
          type="text"
          value={camera.targetSubject || ''}
          onChange={(e) => onChange({ ...camera, targetSubject: e.target.value })}
          placeholder="e.g. her glowing eyes, folded letter, moving sports car"
          className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-cyan-500/50 font-mono"
        />
      </div>
    </div>
  );
};
