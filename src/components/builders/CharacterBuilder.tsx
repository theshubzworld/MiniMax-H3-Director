import React from 'react';
import { CharacterConfig } from '../../types/shot';
import { User, MessageSquare } from 'lucide-react';

interface CharacterBuilderProps {
  character: CharacterConfig;
  onChange: (updatedChar: CharacterConfig) => void;
}

export const CharacterBuilder: React.FC<CharacterBuilderProps> = ({ character, onChange }) => {
  return (
    <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-purple-400 font-semibold text-sm">
          <User className="w-4 h-4" />
          <span>Character & Identity Builder</span>
        </div>
        <div className="flex items-center gap-1.5 bg-zinc-800 px-2 py-0.5 rounded text-xs text-zinc-300">
          <MessageSquare className="w-3 h-3 text-purple-400" />
          <span>Speaker Tag:</span>
          <input
            type="text"
            value={character.speakerId || ''}
            onChange={(e) => onChange({ ...character, speakerId: e.target.value })}
            placeholder="S1"
            className="w-8 bg-zinc-950 border border-zinc-700 rounded text-center text-xs text-purple-300 focus:outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-zinc-400 font-medium mb-1 block">Identity / Character Description</label>
          <input
            type="text"
            value={character.identity || ''}
            onChange={(e) => onChange({ ...character, identity: e.target.value })}
            placeholder="e.g. A young female cyborg warrior with short raven hair"
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-purple-500/50"
          />
        </div>

        <div>
          <label className="text-xs text-zinc-400 font-medium mb-1 block">Wardrobe & Apparel</label>
          <input
            type="text"
            value={character.wardrobe || ''}
            onChange={(e) => onChange({ ...character, wardrobe: e.target.value })}
            placeholder="e.g. black leather trench coat over high-tech armor"
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-purple-500/50"
          />
        </div>

        <div>
          <label className="text-xs text-zinc-400 font-medium mb-1 block">Facial Expression</label>
          <input
            type="text"
            value={character.expression || ''}
            onChange={(e) => onChange({ ...character, expression: e.target.value })}
            placeholder="e.g. stoic, fierce, determined grin"
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-purple-500/50"
          />
        </div>

        <div>
          <label className="text-xs text-zinc-400 font-medium mb-1 block">Physical Pose & Motion</label>
          <input
            type="text"
            value={character.motion || ''}
            onChange={(e) => onChange({ ...character, motion: e.target.value })}
            placeholder="e.g. slowly un-sheathes glowing plasma blade"
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-purple-500/50"
          />
        </div>
      </div>
    </div>
  );
};
