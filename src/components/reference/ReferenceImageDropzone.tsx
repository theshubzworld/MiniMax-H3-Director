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
    <div className="space-y-3">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Unified Side-by-Side Reference Gallery & Upload Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
        {/* Uploaded Reference Cards */}
        {project.references.map((ref, index) => {
          const pictureLabel = `Picture ${index + 1}`;
          const isFirst = index === 0;
          const isSecond = index === 1;

          const cleanName = ref.name && ref.name.length > 20
            ? `${ref.name.slice(0, 10)}...${ref.name.slice(-6)}`
            : (ref.name || `Anchor Image ${index + 1}`);

          const subtitleText = isFirst
            ? 'First Frame • 0.00s'
            : isSecond
            ? `Ending Frame • Shot ${project.shots.length}`
            : 'Character Anchor';

          return (
            <div
              key={ref.id}
              className="bg-zinc-900/90 border border-zinc-800 hover:border-cyan-500/40 rounded-2xl p-3 flex items-center gap-3 relative shadow-md group transition-all"
            >
              {/* Large Prominent Thumbnail Preview (Matching Screenshot Size) */}
              <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-zinc-950 border border-zinc-800 shrink-0 flex items-center justify-center shadow-inner">
                {imageErrorMap[ref.id] ? (
                  <ImageIcon className="w-6 h-6 text-zinc-600" />
                ) : (
                  <img
                    src={ref.url}
                    alt={ref.name}
                    onError={() => setImageErrorMap((prev) => ({ ...prev, [ref.id]: true }))}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>

              {/* Clean Metadata Column */}
              <div className="min-w-0 flex-1 space-y-1 pr-6">
                <div>
                  <span className="text-xs font-bold font-mono text-cyan-300 bg-cyan-950 border border-cyan-500/40 px-2 py-0.5 rounded-md shadow-xs">
                    &lt;{pictureLabel}&gt;
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 font-mono font-medium truncate pt-0.5">
                  {subtitleText}
                </p>
                <div className="text-[10px] text-zinc-500 truncate" title={ref.name}>
                  {cleanName}
                </div>
              </div>

              {/* Delete Button (Top-Right) */}
              <button
                type="button"
                onClick={() => removeReference(ref.id)}
                className="absolute top-2.5 right-2.5 p-1 text-zinc-500 hover:text-red-400 hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
                title="Remove Image"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          );
        })}

        {/* Blank Upload Slot (Always on the right side of uploaded images) */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[104px] space-y-1.5 ${
            isDragOver
              ? 'border-cyan-400 bg-cyan-950/40 shadow-lg shadow-cyan-500/10'
              : 'border-zinc-800/90 bg-zinc-950/50 hover:border-cyan-500/60 hover:bg-cyan-950/15'
          }`}
        >
          <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shadow-sm">
            <UploadCloud className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-zinc-200 block">
              + Upload Picture {project.references.length + 1}
            </span>
            <span className="text-[10px] text-zinc-500 font-mono block">
              PNG, JPG, WebP
            </span>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsPickerOpen(true);
            }}
            className="mt-1 px-2.5 py-1 bg-amber-500/15 hover:bg-amber-500 text-amber-300 hover:text-zinc-950 text-[10px] font-bold rounded-lg border border-amber-500/30 transition-all flex items-center gap-1 cursor-pointer"
          >
            <Film className="w-3 h-3 text-amber-400" />
            <span>Gallery ({(sceneKeyframes || []).length})</span>
          </button>
        </div>
      </div>

      <GalleryPickerModal
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
      />
    </div>
  );
};
