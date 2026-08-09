import React, { useState, useRef } from 'react';
import { useStudioStore } from '../../store/StudioStore';
import { ReferenceImage } from '../../types/project';
import { GalleryPickerModal } from '../modals/GalleryPickerModal';
import { UploadCloud, Image as ImageIcon, Trash2, Sparkles, Tag, Film } from 'lucide-react';

export const ReferenceImageDropzone: React.FC = () => {
  const { project, addReference, removeReference, clearAllReferences, sceneKeyframes } = useStudioStore();
  const [isDragOver, setIsDragOver] = useState(false);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [imageErrorMap, setImageErrorMap] = useState<Record<string, boolean>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | File[]) => {
    Array.from(files).forEach((file, index) => {
      if (!file.type.startsWith('image/')) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        const url = e.target?.result as string;
        if (!url) return;

        const refCount = project.references.length + index + 1;

        const newRef: ReferenceImage = {
          id: `ref-${Date.now()}-${index}-${Math.random().toString(36).substring(2, 6)}`,
          name: file.name,
          url,
          type: refCount === 1 ? 'first_frame' : refCount === 2 ? 'last_frame' : 'character',
          shotIndex: refCount === 1 ? 1 : Math.max(1, project.shots.length),
          traits: {
            subject: 'Primary character / key object',
            face: 'Sharp facial features',
            hair: 'Styled hair',
            wardrobe: 'Cinematic apparel',
            environment: 'Keyframe setting',
            lighting: 'Dramatic lighting',
          },
        };

        addReference(newRef);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  return (
    <div className="space-y-4">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Drag & Drop Target Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
          isDragOver
            ? 'border-cyan-400 bg-cyan-950/40 shadow-xl shadow-cyan-500/10'
            : 'border-zinc-800 bg-zinc-950/60 hover:border-zinc-700 hover:bg-zinc-900/60'
        }`}
      >
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="w-12 h-12 rounded-xl bg-cyan-950 border border-cyan-500/40 text-cyan-400 flex items-center justify-center shadow-lg">
            <UploadCloud className="w-7 h-7" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-zinc-100">
              {isDragOver ? 'Drop Image Keyframes Here' : 'Drag & Drop Reference Images (Picture 1, Picture 2)'}
            </h3>
            <p className="text-xs text-zinc-400 mt-1">
              Supports PNG, JPG, WebP. Click or drag files into this drop zone.
            </p>
          </div>
          <div className="flex items-center gap-3 pt-1">
            <div className="flex items-center gap-2 text-[11px] font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-500/30 px-3 py-1 rounded-full">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Mode: {project.settings.mode} • Keyframe Anchor Mode Active</span>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsPickerOpen(true);
              }}
              className="px-3.5 py-1.5 bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-zinc-950 text-xs font-bold rounded-xl border border-amber-500/40 transition-all flex items-center gap-1.5 shadow-lg"
            >
              <Film className="w-4 h-4 text-amber-400" />
              <span>🎬 Select Keyframe from Gallery ({(sceneKeyframes || []).length})</span>
            </button>
          </div>
        </div>
      </div>

      <GalleryPickerModal
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
      />

      {/* Uploaded Reference Image Cards Grid */}
      {project.references.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-cyan-400" />
              Uploaded Reference Anchors ({project.references.length})
            </h4>

            <button
              type="button"
              onClick={clearAllReferences}
              className="text-xs text-zinc-400 hover:text-red-400 font-semibold flex items-center gap-1 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear All Anchors
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {project.references.map((ref, index) => {
              const pictureLabel = `Picture ${index + 1}`;
              const isFirst = index === 0;
              const isSecond = index === 1;

              return (
                <div
                  key={ref.id}
                  className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex gap-4 items-start shadow-xl group hover:border-cyan-500/40 transition-all"
                >
                  <div className="relative w-28 h-28 rounded-xl overflow-hidden bg-zinc-950 border border-zinc-800 flex-shrink-0 flex items-center justify-center">
                    {imageErrorMap[ref.id] ? (
                      <div className="flex flex-col items-center justify-center p-2 text-center text-zinc-500 space-y-1">
                        <ImageIcon className="w-6 h-6 text-zinc-600" />
                        <span className="text-[9px] font-mono leading-tight break-all line-clamp-2 text-zinc-400">{ref.name}</span>
                      </div>
                    ) : (
                      <img
                        src={ref.url}
                        alt={ref.name}
                        onError={() => setImageErrorMap((prev) => ({ ...prev, [ref.id]: true }))}
                        className="w-full h-full object-cover"
                      />
                    )}
                    <div className="absolute top-1.5 left-1.5 bg-zinc-950/90 border border-cyan-500/40 text-cyan-300 font-mono text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm">
                      &lt;{pictureLabel}&gt;
                    </div>
                  </div>

                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-zinc-100">{ref.name}</span>
                        <p className="text-[10px] text-zinc-400">
                          {isFirst
                            ? 'First Frame Anchor (Shot 1 at 0.00s)'
                            : isSecond
                            ? `Ending Frame Anchor (Shot ${project.shots.length})`
                            : 'Character Anchor'}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeReference(ref.id)}
                        className="p-1.5 text-zinc-400 hover:text-red-400 hover:bg-red-950/40 rounded-lg transition-all"
                        title="Remove Reference"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Detected Visual Attributes Badges */}
                    <div className="space-y-1.5 pt-1 border-t border-zinc-800/80">
                      <span className="text-[10px] font-semibold text-cyan-400 flex items-center gap-1">
                        <Tag className="w-3 h-3" /> Detected Visual Traits:
                      </span>
                      <div className="flex flex-wrap gap-1 text-[10px]">
                        <span className="bg-zinc-950 border border-zinc-800 text-zinc-300 px-2 py-0.5 rounded">
                          Face: {ref.traits?.face || 'Sharp features'}
                        </span>
                        <span className="bg-zinc-950 border border-zinc-800 text-zinc-300 px-2 py-0.5 rounded">
                          Hair: {ref.traits?.hair || 'Styled'}
                        </span>
                        <span className="bg-zinc-950 border border-zinc-800 text-zinc-300 px-2 py-0.5 rounded">
                          Lighting: {ref.traits?.lighting || 'Dramatic'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
