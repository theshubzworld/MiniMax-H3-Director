import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { useStudioStore } from '../../store/StudioStore';
import { GeneratedKeyframe } from '../../ai/providers/ImageGenProvider';
import { X, Film, CheckCircle2, ImageIcon, Plus } from 'lucide-react';

interface GalleryPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GalleryPickerModal: React.FC<GalleryPickerModalProps> = ({ isOpen, onClose }) => {
  const { sceneKeyframes, addReference, project } = useStudioStore();
  const [assignedFeedback, setAssignedFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  const keyframes = sceneKeyframes || [];

  const handleSelectKeyframe = (kf: GeneratedKeyframe, target: 'first_frame' | 'last_frame') => {
    addReference({
      id: `ref-${Date.now()}`,
      name: kf.name,
      url: kf.url,
      type: target,
      shotIndex: target === 'first_frame' ? 1 : project.shots.length,
    });

    const targetLabel = target === 'first_frame' ? '<Picture 1> (Start)' : '<Picture 2> (End)';
    setAssignedFeedback(`Added keyframe to ${targetLabel}!`);
    setTimeout(() => setAssignedFeedback(null), 3000);
  };

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 lg:p-8 bg-zinc-950/85 backdrop-blur-md animate-in fade-in">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-5xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden relative">
        {/* Modal Header */}
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-zinc-100 flex items-center gap-2">
                Select Keyframe from Scene Gallery ({keyframes.length})
              </h2>
              <p className="text-xs text-zinc-400">
                Choose generated 4K keyframes to assign as Picture 1 (0.00s start) or Picture 2 (ending mark) for FL2VA mode.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback Alert Toast */}
        {assignedFeedback && (
          <div className="mx-6 mt-4 p-3 bg-emerald-950/80 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{assignedFeedback}</span>
          </div>
        )}

        {/* Modal Body Grid */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {keyframes.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <ImageIcon className="w-12 h-12 text-zinc-600 mx-auto" />
              <h3 className="text-sm font-bold text-zinc-300">No Keyframes Available in Gallery</h3>
              <p className="text-xs text-zinc-500 max-w-md mx-auto">
                Generate keyframes in the Scene Creator tab first, or upload local image files directly into the dropzone.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {keyframes.map((kf) => (
                <div
                  key={kf.id}
                  className="bg-zinc-950 border border-zinc-800 hover:border-amber-500/50 rounded-2xl p-3 space-y-3 group transition-all shadow-xl flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="relative aspect-video rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800">
                      <img src={kf.url} alt={kf.name} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300" />
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-zinc-950/80 backdrop-blur-md text-[10px] font-mono text-amber-400 font-bold border border-amber-500/30">
                        {kf.aspectRatio || '16:9'}
                      </div>
                    </div>

                    <p className="text-[11px] text-zinc-300 font-mono line-clamp-2 leading-relaxed bg-zinc-900/60 p-2 rounded-lg border border-zinc-800/80">
                      {kf.prompt}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-zinc-900 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleSelectKeyframe(kf, 'first_frame')}
                      className="flex-1 py-2 bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-zinc-950 text-xs font-bold rounded-xl border border-amber-500/40 transition-all text-center flex items-center justify-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Set Picture 1</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectKeyframe(kf, 'last_frame')}
                      className="flex-1 py-2 bg-cyan-500/20 hover:bg-cyan-500 text-cyan-300 hover:text-zinc-950 text-xs font-bold rounded-xl border border-cyan-500/40 transition-all text-center flex items-center justify-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Set Picture 2</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};
