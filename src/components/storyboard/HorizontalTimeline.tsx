import React from 'react';
import { Shot } from '../../types/shot';
import { Clock, Plus } from 'lucide-react';
import { TimelineEngine } from '../../engine/TimelineEngine';

interface HorizontalTimelineProps {
  shots: Shot[];
  totalDuration: number;
  onAddShot: () => void;
}

export const HorizontalTimeline: React.FC<HorizontalTimelineProps> = ({
  shots,
  totalDuration,
  onAddShot,
}) => {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-cyan-400 font-semibold text-xs uppercase tracking-wider">
          <Clock className="w-4 h-4" />
          <span>Timeline Overview — Total Duration: {totalDuration}s</span>
        </div>

        <button
          type="button"
          onClick={onAddShot}
          className="bg-cyan-500 hover:bg-cyan-400 text-zinc-950 px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 shadow-lg shadow-cyan-500/20 transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Shot</span>
        </button>
      </div>

      {/* Visual Timeline Bar */}
      <div className="w-full bg-zinc-950 border border-zinc-800 h-16 rounded-lg p-1.5 flex gap-1.5 overflow-x-auto relative">
        {shots.map((shot, idx) => {
          const formattedTime = TimelineEngine.formatTimestamp(shot.startTimeSeconds);
          return (
            <div
              key={shot.id}
              className="flex-1 bg-gradient-to-r from-zinc-900 to-zinc-800 border border-zinc-700/60 rounded-md p-2 flex flex-col justify-between min-w-[120px] group hover:border-cyan-500 transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-cyan-300">Shot #{shot.shotNumber}</span>
                <span className="text-[10px] text-zinc-400 font-mono">
                  {idx === 0 ? '0.00s' : formattedTime}
                </span>
              </div>
              <p className="text-[10px] text-zinc-300 truncate">
                {shot.camera?.motionType || 'Push In'}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
