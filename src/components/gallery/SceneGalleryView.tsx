import React, { useState } from 'react';
import { useStudioStore } from '../../store/StudioStore';
import { GeneratedKeyframe } from '../../ai/providers/ImageGenProvider';
import { Film, Download, Copy, Trash2, CheckCircle2, Eye, X, Filter, Sparkles, PlusCircle } from 'lucide-react';

export const SceneGalleryView: React.FC = () => {
  const { sceneKeyframes, removeSceneKeyframe, addReference, setActiveView, setActiveSceneStep } = useStudioStore();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [assignedStatus, setAssignedStatus] = useState<string | null>(null);
  const [previewKeyframe, setPreviewKeyframe] = useState<GeneratedKeyframe | null>(null);
  const [filterRatio, setFilterRatio] = useState<string>('all');

  const keyframes = sceneKeyframes || [];

  const filteredKeyframes = keyframes.filter((kf) => {
    if (filterRatio === 'all') return true;
    return kf.aspectRatio === filterRatio;
  });

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleDownload = (keyframe: GeneratedKeyframe) => {
    const a = document.createElement('a');
    a.href = keyframe.url;
    a.download = keyframe.name.endsWith('.png') ? keyframe.name : `${keyframe.name}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDownloadAll = () => {
    filteredKeyframes.forEach((kf, idx) => {
      setTimeout(() => handleDownload(kf), idx * 250);
    });
  };

  const handleAssign = (kf: GeneratedKeyframe, type: 'first_frame' | 'last_frame') => {
    addReference({
      id: `ref-${Date.now()}`,
      name: kf.name,
      url: kf.url,
      type,
      shotIndex: 0,
    });
    setAssignedStatus(`Assigned keyframe to <Picture ${type === 'first_frame' ? '1' : '2'}> reference!`);
    setTimeout(() => setAssignedStatus(null), 3500);
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto animate-in fade-in">
      {/* Compact Single-Row Toolbar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-900/90 border border-zinc-800/90 rounded-2xl p-3.5 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <Film className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm font-extrabold text-zinc-100 flex items-center gap-2">
              Scene Keyframe Gallery
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-mono font-bold border border-amber-500/30">
                {keyframes.length} Keyframes
              </span>
            </h1>
          </div>
        </div>

        {/* Compact Aspect Ratio Filter Pills + Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800">
            {['all', '16:9', '9:16', '1:1', '2.39:1', '4:3'].map((ratio) => (
              <button
                key={ratio}
                type="button"
                onClick={() => setFilterRatio(ratio)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                  filterRatio === ratio
                    ? 'bg-amber-500 text-zinc-950 font-extrabold shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {ratio === 'all' ? 'All' : ratio}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => {
              setActiveView('scene-creator');
              setActiveSceneStep(1);
            }}
            className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold rounded-xl text-xs flex items-center gap-1.5 border border-zinc-700 transition-all"
          >
            <PlusCircle className="w-3.5 h-3.5 text-cyan-400" />
            <span>New Scene</span>
          </button>

          {keyframes.length > 0 && (
            <button
              type="button"
              onClick={handleDownloadAll}
              className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-extrabold rounded-xl text-xs flex items-center gap-1.5 shadow-md transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Save All ({keyframes.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* Status Feedback Toast */}
      {assignedStatus && (
        <div className="p-2.5 bg-emerald-950/70 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in shadow-xl">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{assignedStatus}</span>
        </div>
      )}

      {/* Main Full Grid View */}
      {filteredKeyframes.length === 0 ? (
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-3xl p-16 text-center space-y-4">
          <Film className="w-12 h-12 text-zinc-600 mx-auto" />
          <h3 className="text-base font-bold text-zinc-300">No Keyframe Images in Gallery</h3>
          <p className="text-xs text-zinc-400 max-w-md mx-auto">
            Generate 4K keyframe pairs in the Scene Creator tab to store and inspect them here in your gallery!
          </p>
          <button
            type="button"
            onClick={() => {
              setActiveView('scene-creator');
              setActiveSceneStep(1);
            }}
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-extrabold rounded-xl text-xs inline-flex items-center gap-2 shadow-lg transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>Open Scene Creator Workstation</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredKeyframes.map((kf) => (
            <div
              key={kf.id}
              className="bg-zinc-900 border border-zinc-800 hover:border-amber-500/50 rounded-2xl overflow-hidden shadow-xl group transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div
                  className="relative aspect-video bg-zinc-950 overflow-hidden cursor-pointer group/img"
                  onClick={() => setPreviewKeyframe(kf)}
                >
                  <img
                    src={kf.url}
                    alt={kf.name}
                    className="w-full h-full object-contain group-hover/img:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3 bg-zinc-950/85 backdrop-blur-md border border-zinc-800 text-[10px] text-amber-400 font-mono px-2 py-0.5 rounded-full font-bold shadow-md">
                    {kf.aspectRatio || '16:9'} • {kf.model ? kf.model.replace('gemini-', '') : 'Nano Banana'}
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreviewKeyframe(kf);
                    }}
                    className="absolute top-3 right-3 p-2 bg-zinc-950/85 hover:bg-amber-500 hover:text-zinc-950 text-zinc-300 rounded-xl backdrop-blur-md transition-all shadow-md"
                    title="Inspect HD Fullscreen"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-4 pt-1 space-y-2">
                  <p className="text-xs text-zinc-300 font-mono line-clamp-3 leading-relaxed bg-zinc-950/60 p-2.5 rounded-xl border border-zinc-800/80">
                    {kf.prompt}
                  </p>
                </div>
              </div>

              <div className="p-4 pt-0 space-y-3">
                <div className="pt-2 border-t border-zinc-800/80 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleAssign(kf, 'first_frame')}
                    className="flex-1 py-1.5 bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-zinc-950 text-xs font-bold rounded-xl border border-amber-500/40 transition-all text-center"
                  >
                    &lt;Picture 1&gt;
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAssign(kf, 'last_frame')}
                    className="flex-1 py-1.5 bg-cyan-500/20 hover:bg-cyan-500 text-cyan-300 hover:text-zinc-950 text-xs font-bold rounded-xl border border-cyan-500/40 transition-all text-center"
                  >
                    &lt;Picture 2&gt;
                  </button>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopy(kf.id, kf.prompt)}
                    className="px-3 py-1 bg-zinc-950 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 text-xs font-medium rounded-lg flex items-center gap-1.5 border border-zinc-800 transition-all"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedId === kf.id ? 'Copied!' : 'Copy Prompt'}</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleDownload(kf)}
                      className="p-2 bg-zinc-800 hover:bg-emerald-500 hover:text-zinc-950 text-zinc-300 rounded-xl transition-all"
                      title="Download PNG"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeSceneKeyframe(kf.id)}
                      className="p-2 bg-zinc-800 hover:bg-rose-500 hover:text-white text-zinc-400 rounded-xl transition-all"
                      title="Delete Keyframe"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Fullscreen Inspector Modal */}
      {previewKeyframe && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/90 backdrop-blur-md animate-in fade-in">
          <div className="relative max-w-5xl w-full bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl space-y-4 p-6">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-zinc-200 flex items-center gap-2">
                <Film className="w-4 h-4 text-amber-400" />
                {previewKeyframe.name}
              </h3>
              <button
                type="button"
                onClick={() => setPreviewKeyframe(null)}
                className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative aspect-video rounded-2xl overflow-hidden bg-zinc-950 border border-zinc-800">
              <img src={previewKeyframe.url} alt="Fullscreen Preview" className="w-full h-full object-contain" />
            </div>

            <p className="text-xs text-zinc-300 font-mono bg-zinc-950 p-3 rounded-xl border border-zinc-800">
              {previewKeyframe.prompt}
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => handleDownload(previewKeyframe)}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded-xl text-xs flex items-center gap-2 shadow-md transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Download PNG</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
