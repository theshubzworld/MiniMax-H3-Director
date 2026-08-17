import React, { useState } from 'react';
import { Shot } from '../../types/shot';
import { CameraBuilder } from '../builders/CameraBuilder';
import { CharacterBuilder } from '../builders/CharacterBuilder';
import { EnvironmentBuilder } from '../builders/EnvironmentBuilder';
import { ChevronDown, ChevronUp, Trash2, Film, Clock, MessageSquare, Video, User, Sun } from 'lucide-react';
import { TimelineEngine } from '../../engine/TimelineEngine';

interface ShotCardProps {
  shot: Shot;
  index: number;
  totalShots: number;
  onUpdate: (updatedShot: Partial<Shot>) => void;
  onRemove: () => void;
}

export const ShotCard: React.FC<ShotCardProps> = ({
  shot,
  index,
  totalShots,
  onUpdate,
  onRemove,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState<'camera' | 'character' | 'environment' | 'dialogue' | 'action'>('camera');

  const formattedTime = TimelineEngine.formatTimestamp(shot.startTimeSeconds);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-lg transition-all">
      {/* Premiere-style Header Bar */}
      <div
        className="bg-zinc-950 px-4 py-3 flex items-center justify-between border-b border-zinc-800 cursor-pointer hover:bg-zinc-900/60"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-300 font-bold text-xs">
            #{shot.shotNumber}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-sm text-zinc-100">Shot {shot.shotNumber}</span>
              <span className="text-xs bg-zinc-800 text-cyan-400 px-2 py-0.5 rounded font-mono flex items-center gap-1">
                <Clock className="w-3 h-3 text-cyan-400" />
                {index === 0 ? 'Start 0.00s' : formattedTime}
              </span>

              {/* Per-Shot Duration Selector Dropdown */}
              <div
                className="flex items-center gap-1 bg-cyan-950/80 border border-cyan-500/40 rounded px-2 py-0.5 text-xs text-cyan-300 font-mono shadow-xs"
                onClick={(e) => e.stopPropagation()}
              >
                <span className="text-[10px] text-zinc-400 font-sans font-medium">Duration:</span>
                <select
                  value={Number((shot.durationSeconds || 2).toFixed(1))}
                  onChange={(e) => onUpdate({ durationSeconds: parseFloat(e.target.value) || 2 })}
                  className="bg-transparent text-cyan-300 font-bold focus:outline-none cursor-pointer text-xs"
                >
                  {Array.from(new Set([0.5, 0.8, 1.0, 1.2, 1.5, 1.8, 2.0, 2.2, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0, 6.0, Number((shot.durationSeconds || 2).toFixed(1))]))
                    .sort((a, b) => a - b)
                    .map((sec) => (
                      <option key={sec} value={sec} className="bg-zinc-950 text-zinc-100">
                        {sec.toFixed(1)}s
                      </option>
                    ))}
                </select>
              </div>
            </div>
            <p className="text-xs text-zinc-400 truncate max-w-md mt-0.5">
              {shot.rawActionDescription || 'Action details...'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={onRemove}
            disabled={totalShots <= 1}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-950/40 disabled:opacity-30 transition-all"
            title="Delete Shot"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expanded Editing Body */}
      {isExpanded && (
        <div className="p-4 space-y-4">
          {/* Sub-tab Switcher */}
          <div className="flex border-b border-zinc-800 gap-1">
            <button
              type="button"
              onClick={() => setActiveTab('camera')}
              className={`px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-all ${
                activeTab === 'camera'
                  ? 'border-cyan-500 text-cyan-300'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Video className="w-3.5 h-3.5" />
              Camera ({shot.camera?.motionType || 'Push In'})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('character')}
              className={`px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-all ${
                activeTab === 'character'
                  ? 'border-purple-500 text-purple-300'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              Character
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('environment')}
              className={`px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-all ${
                activeTab === 'environment'
                  ? 'border-amber-500 text-amber-300'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
              Environment
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('dialogue')}
              className={`px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-all ${
                activeTab === 'dialogue'
                  ? 'border-emerald-500 text-emerald-300'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Dialogue Tag ({'<d>'})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('action')}
              className={`px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-all ${
                activeTab === 'action'
                  ? 'border-blue-500 text-blue-300'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              Raw Action Prose
            </button>
          </div>

          {/* Tab Contents */}
          {activeTab === 'camera' && (
            <CameraBuilder camera={shot.camera} onChange={(camera) => onUpdate({ camera })} />
          )}

          {activeTab === 'character' && (
            <CharacterBuilder character={shot.character} onChange={(character) => onUpdate({ character })} />
          )}

          {activeTab === 'environment' && (
            <EnvironmentBuilder environment={shot.environment} onChange={(environment) => onUpdate({ environment })} />
          )}

          {activeTab === 'dialogue' && (
            <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs text-zinc-300 font-semibold flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={shot.dialogue?.hasDialogue || false}
                    onChange={(e) =>
                      onUpdate({
                        dialogue: {
                          hasDialogue: e.target.checked,
                          speakerId: shot.dialogue?.speakerId || 'S1',
                          languageTag: shot.dialogue?.languageTag || 'English',
                          dialogueText: shot.dialogue?.dialogueText || '',
                          isOffScreenVoiceover: shot.dialogue?.isOffScreenVoiceover || false,
                          lipsClosedDuringVoiceover: shot.dialogue?.lipsClosedDuringVoiceover || true,
                          carriesAcrossCut: shot.dialogue?.carriesAcrossCut || false,
                        },
                      })
                    }
                    className="accent-emerald-500 w-4 h-4 rounded"
                  />
                  <span>Enable Character Dialogue Tag ({'`<d>[Language] Text</d>`'})</span>
                </label>

                {shot.dialogue?.hasDialogue && (
                  <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded">
                    {'<d>['}{shot.dialogue.languageTag}{'] '} {shot.dialogue.dialogueText || '...'}{'</d>'}
                  </span>
                )}
              </div>

              {shot.dialogue?.hasDialogue && (
                <div className="space-y-3 pt-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-zinc-400 font-medium mb-1 block">Speaker ID</label>
                      <input
                        type="text"
                        value={shot.dialogue.speakerId}
                        onChange={(e) =>
                          onUpdate({ dialogue: { ...shot.dialogue!, speakerId: e.target.value } })
                        }
                        placeholder="S1"
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-200 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-zinc-400 font-medium mb-1 block">Language Tag</label>
                      <input
                        type="text"
                        value={shot.dialogue.languageTag}
                        onChange={(e) =>
                          onUpdate({ dialogue: { ...shot.dialogue!, languageTag: e.target.value } })
                        }
                        placeholder="English"
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-200 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-zinc-400 font-medium mb-1 block">Spoken Text Content (Verbatim)</label>
                    <input
                      type="text"
                      value={shot.dialogue.dialogueText}
                      onChange={(e) =>
                        onUpdate({ dialogue: { ...shot.dialogue!, dialogueText: e.target.value } })
                      }
                      placeholder="e.g. System online. Objective locked."
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500/50 font-mono"
                    />
                  </div>

                  <div className="flex items-center gap-4 text-xs text-zinc-300">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={shot.dialogue.isOffScreenVoiceover}
                        onChange={(e) =>
                          onUpdate({ dialogue: { ...shot.dialogue!, isOffScreenVoiceover: e.target.checked } })
                        }
                        className="accent-emerald-500"
                      />
                      <span>Off-screen Voiceover (adds lips remain closed clause)</span>
                    </label>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'action' && (
            <div>
              <label className="text-xs text-zinc-400 font-medium mb-1.5 block">
                Continuous Storyboard Action Prose
              </label>
              <textarea
                rows={3}
                value={shot.rawActionDescription}
                onChange={(e) => onUpdate({ rawActionDescription: e.target.value })}
                placeholder="Describe subject motion, physical reactions, and key prop interactions..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-200 focus:outline-none focus:border-cyan-500/50 leading-relaxed"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
