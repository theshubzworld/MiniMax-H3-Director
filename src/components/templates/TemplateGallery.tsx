import React, { useState } from 'react';
import { TEMPLATES_LIBRARY } from '../../data/templates';
import { useStudioStore } from '../../store/StudioStore';
import { PromptTemplate, TemplateCategory } from '../../types/template';
import { Sparkles, ArrowRight } from 'lucide-react';
import { PromptCompiler } from '../../engine/PromptCompiler';
import { Shot } from '../../types/shot';

const CATEGORIES: Array<TemplateCategory | 'All'> = [
  'All',
  'Raw & Amateur',
  'Sultry & Romance',
  'Boudoir',
  'Social Media',
  'Cinematic Film',
  'Fashion',
  'Luxury',
  'Action',
  'Sci-Fi',
  'Cars',
  'Food',
  'Travel',
  'Sports',
  'Music Video',
];

export const TemplateGallery: React.FC = () => {
  const { setProject, setActiveView } = useStudioStore();
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | 'All'>('All');

  const filteredTemplates =
    selectedCategory === 'All'
      ? TEMPLATES_LIBRARY
      : TEMPLATES_LIBRARY.filter((tpl) => tpl.category === selectedCategory);

  const applyTemplate = (template: PromptTemplate) => {
    const fullShots: Shot[] = template.presetShots.map((s, idx) => ({
      id: `shot-tpl-${idx}`,
      shotNumber: idx + 1,
      startTimeSeconds: idx * (s.durationSeconds || 3),
      durationSeconds: s.durationSeconds || 3,
      transitionToNext: 'cut',
      camera: s.camera || { motionType: 'Push In', amplitude: 'small amplitude', speed: 'slow speed' },
      character: s.character || { identity: 'The primary subject' },
      environment: s.environment || { location: 'Cinematic environment' },
      rawActionDescription: s.rawActionDescription || 'Performs cinematic movement.',
      dialogue: s.dialogue
        ? {
            hasDialogue: s.dialogue.hasDialogue ?? false,
            speakerId: s.dialogue.speakerId || 'S1',
            languageTag: s.dialogue.languageTag || 'English',
            dialogueText: s.dialogue.dialogueText || '',
            isOffScreenVoiceover: s.dialogue.isOffScreenVoiceover ?? false,
            lipsClosedDuringVoiceover: s.dialogue.lipsClosedDuringVoiceover ?? false,
            carriesAcrossCut: s.dialogue.carriesAcrossCut ?? false,
          }
        : {
            hasDialogue: false,
            speakerId: 'S1',
            languageTag: 'English',
            dialogueText: '',
            isOffScreenVoiceover: false,
            lipsClosedDuringVoiceover: false,
            carriesAcrossCut: false,
          },
    }));

    const projectToSet = {
      id: `proj-${Date.now()}`,
      name: template.title,
      description: template.description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      settings: {
        mode: template.presetSettings.mode,
        durationSeconds: template.presetSettings.durationSeconds,
        aspectRatio: template.presetSettings.aspectRatio,
        style: template.presetSettings.style,
        fps: 24,
        resolution: '1080p',
      },
      references: [],
      shots: fullShots,
      audio: {
        isSilent: template.presetAudio.isSilent || false,
        soundscapeLayers: [
          { category: 'ambient' as const, description: 'Natural ambient room acoustics.', enabled: true },
        ],
        music: template.presetAudio.music || {
          hasMusic: true,
          genreStyle: 'Cinematic',
          instrumentation: ['strings', 'piano'],
          tempo: 'moderate' as const,
          dynamics: 'smooth balance',
          rhythmPattern: 'steady rhythm',
          layeringDescription: 'Ambient pads underneath.',
        },
      },
      compiledPrompt: '',
    };

    projectToSet.compiledPrompt = PromptCompiler.compile(projectToSet);
    setProject(projectToSet);
    setActiveView('studio');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-400" />
          20+ Category MiniMax H3 Template Library
        </h2>
        <p className="text-xs text-zinc-400">Select a production-grade preset to instantly pre-fill studio workspace.</p>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                isSelected
                  ? 'bg-amber-500 text-zinc-950 shadow-lg shadow-amber-500/20'
                  : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Template Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTemplates.map((tpl) => (
          <div
            key={tpl.id}
            className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden group hover:border-amber-500/50 transition-all flex flex-col justify-between"
          >
            <div className="relative h-40 overflow-hidden bg-zinc-950">
              <img
                src={tpl.thumbnailUrl}
                alt={tpl.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80 group-hover:opacity-100"
              />
              <div className="absolute top-3 left-3 bg-zinc-950/80 backdrop-blur-sm border border-zinc-800 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-amber-300">
                {tpl.category}
              </div>
              <div className="absolute top-3 right-3 bg-zinc-950/80 backdrop-blur-sm border border-zinc-800 px-2 py-0.5 rounded-md text-[10px] font-mono text-cyan-300">
                {tpl.presetSettings.mode} • {tpl.presetSettings.durationSeconds}s
              </div>
            </div>

            <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-sm text-zinc-100 group-hover:text-amber-300 transition-colors">
                  {tpl.title}
                </h3>
                <p className="text-xs text-zinc-400 mt-1 line-clamp-2">{tpl.description}</p>
              </div>

              <div className="pt-3 border-t border-zinc-800 flex items-center justify-between">
                <div className="flex flex-wrap gap-1">
                  {tpl.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded">
                      #{tag}
                    </span>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => applyTemplate(tpl)}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 rounded-xl text-xs font-bold flex items-center gap-1 shadow-md transition-all"
                >
                  <span>Load Preset</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
