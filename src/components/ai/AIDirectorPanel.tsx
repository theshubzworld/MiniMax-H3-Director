import React, { useState } from 'react';
import { useStudioStore } from '../../store/StudioStore';
import { AIEngine } from '../../ai/AIEngine';
import { NarrativeStyle } from '../../ai/interfaces/AIProvider';
import { ReferenceImageDropzone } from '../reference/ReferenceImageDropzone';
import { Sparkles, Video, Loader2, Plus, Trash2, Lightbulb, Image as ImageIcon, Cpu, Brain, Sliders, Gauge, Zap } from 'lucide-react';

const NARRATIVE_STYLES: NarrativeStyle[] = [
  'Live-Action Realism',
  'Cinematic Film',
  'Sultry Romance',
  'Sensual Intimacy',
  'Steamy Thriller',
  'Velvet Boudoir',
  'Erotic Romance',
  'Commercial',
  'Fashion',
  'Action',
  'Music Video',
  'Documentary',
  'Product',
  'Travel',
  'Anime',
  'Sci-Fi Thriller',
  'Dark Fantasy',
  'Horror Suspense',
  'Romance Drama',
  'Gaming Trailer',
  'Sports Hype',
  'Automotive Showcase',
  'Comedy Sketch',
  'Historical Epic',
  'Superhero Origin',
  'Experimental Surrealism',
];

const STORY_SEED_PRESETS = [
  // 💋 Sultry & Romance
  { category: 'sultry', label: '💋 Velvet Bedside Caress', prompt: 'A sultry romantic couple relaxing on a plush velvet bed under soft golden candle glow. In a slow tracking close-up, his fingers gently trace down her shoulder as she exhales with eyes fluttering closed. Include whispered passionate dialogue, soft breathing foley, and sultry ambient piano score.' },
  { category: 'sultry', label: '🔥 Steamy Mirror Silhouette', prompt: 'A sensual couple in a mist-covered bathroom after a hot shower under warm backlight. Her fingers trace patterns on the steamy mirror as he embraces her from behind, resting his chin on her shoulder. Include whispered romantic commentary, water droplet foley, and deep atmospheric lo-fi synth beats.' },
  { category: 'sultry', label: '🌹 Silk Loungewear Sunset', prompt: 'A couple in a high-rise penthouse suite overlooking a glowing city sunset, dressed in silk loungewear. She arches her back gently as he pulls her close in a lingering intimate embrace. Include whispered dialogue cues, rustling silk foley, and slow sensual acoustic guitar.' },
  { category: 'sultry', label: '🛏️ Bedroom Sunbeam Romance', prompt: 'A romantic couple waking up in white linen sheets as warm morning sunbeams stream through linen curtains. Include whispered intimate dialogue, soft sheet rustle foley, and acoustic guitar score.' },
  { category: 'sultry', label: '🛁 Candlelit Bath Spa Romance', prompt: 'A romantic couple relaxing in a steamy freestanding marble bathtub surrounded by glowing candles and rose petals. Include soft whispered dialogue, gentle water splash foley, and ambient piano music.' },
  { category: 'sultry', label: '🏡 Kitchen Morning Coffee Romance', prompt: 'A couple laughing together in a sun-drenched modern kitchen while making morning coffee in silk loungewear. Include playful dialogue, clinking coffee cups foley, and warm lo-fi lounge beats.' },
  { category: 'sultry', label: '🌊 Sunset Beach Couple Romance', prompt: 'A couple strolling hand-in-hand along the shoreline during a vibrant golden-hour sunset as ocean waves lap their bare feet. Include romantic whispered voiceover, ocean waves foley, and ambient piano orchestra.' },
  { category: 'sultry', label: '🌧️ Rainy Window Blanket Snuggle', prompt: 'A couple wrapped in a plush knit blanket on a window seat watching rain drum against glass with steaming mugs. Include cozy dialogue, rain drumming on glass foley, and acoustic folk music.' },
  { category: 'sultry', label: '🌳 Wildflower Meadow Picnic', prompt: 'A couple lounging on a checkered blanket in a sun-dappled wildflower meadow under a large oak tree. Include happy shared laughter, warm summer breeze foley, and romantic acoustic guitar music.' },

  // 👤 Solo Protagonist
  { category: 'solo', label: '💃 Solo Sultry Silk Boudoir', prompt: 'A solo woman in a blush-pink silk slip dress relaxing on a velvet chaise lounge in a sun-drenched penthouse. In a slow tracking close-up, she runs her fingers through her hair while gazing softly into the camera. Include whispered solo reflection voiceover, silk rustle foley, and sultry lo-fi piano score.' },
  { category: 'solo', label: '🕯️ Solo Candlelit Mirror Glamour', prompt: 'A solo female model seated before a gilded vanity mirror surrounded by soft candle glow and warm tungsten bulbs. She applies perfume to her collarbone as the camera slowly dollies closer. Include reflective inner monologue narration, glass perfume bottle clink foley, and ambient jazz saxophone.' },
  { category: 'solo', label: '🌅 Solo Golden Hour Shoreline', prompt: 'A solo woman walking gracefully along wet sand during a vibrant golden-hour ocean sunset, her white linen dress catching the sea breeze. Include soft reflective monologue narration, gentle ocean waves, and acoustic guitar score.' },
  { category: 'solo', label: '☕ Solo Cozy Rain Window', prompt: 'A solo woman wrapped in an oversized knit sweater sitting on a window seat sipping tea while watching raindrops stream down glass. Include cozy solo voiceover, rain drumming foley, and acoustic guitar music.' },
  { category: 'solo', label: '👗 Fashion Runway Spotlights', prompt: 'A haute couture supermodel walking an obsidian mirror runway surrounded by spotlights. Include camera shutter clicks foley, director voiceover cues, and deep house electronic music.' },
  { category: 'solo', label: '🍷 Solo Penthouse Fireside', prompt: 'A solo protagonist swirling a glass of red wine in a cozy penthouse lounge by a roaring stone fireplace. Include quiet reflective monologue, crackling fire foley, and smooth ambient jazz piano.' },

  // ⚔️ Action & Sci-Fi
  { category: 'action', label: '🗡️ Cyborg Katana Rain & Dialogue', prompt: 'A female cyborg warrior drawing a glowing plasma katana in a rain-soaked neon Neo-Tokyo alleyway. Include spoken battle dialogue, sizzle rain foley, and heavy dark synthwave music.' },
  { category: 'action', label: '🏎️ Cyberpunk Tunnel Drift', prompt: 'A matte-black hypercar drifting through a neon highway tunnel with light trails. Include a roaring V12 engine turbo blowoff foley, futuristic radio chatter, and driving synthwave music.' },
  { category: 'action', label: '⚡ Superhero Rooftop Vigil', prompt: 'An armored heroine standing on a skyscraper ledge overseeing a stormy metropolis as lightning strikes. Include heroic voiceover, thunder rumble foley, and swelling cinematic brass score.' },
  { category: 'action', label: '🐉 Dragon Siege & Battle Cry', prompt: 'A warrior riding an armored crimson dragon soaring through stormy clouds above a mountain fortress. Include dragon roar and wind howl foley, warrior shout, and epic orchestral drums.' },
  { category: 'action', label: '💼 Penthouse Espionage', prompt: 'A sleek operative hacking a glass server terminal inside a high-rise Tokyo penthouse. Include tense whispered dialogue, keypress clicks foley, and suspenseful pulse synth score.' },
  { category: 'action', label: '🤖 Mecha Power-Up & System Voice', prompt: 'A 50-foot military mecha powering up its shoulder cannons as alarm strobes illuminate a hangar bay. Include robotic AI voice, heavy hydraulic servo foley, and industrial metal beat.' },
  { category: 'action', label: '🥋 Bamboo Forest Sword Duel', prompt: 'Two martial arts masters facing off in a mist-covered bamboo forest at twilight as cherry blossom petals swirl. Include a sharp battle kiai shout, katana steel clashing foley, and traditional koto flute music.' },
  { category: 'action', label: '🧪 Cyber Lab Awakening', prompt: 'A bio-android opening glowing blue eyes inside a glass fluid chamber as wires disconnect. Include synthetic female voice, glass hiss foley, and pulsing ambient electronic beat.' },
  { category: 'action', label: '⚔️ Gladiator Arena Entrance', prompt: 'A warrior stepping into a sun-drenched Roman arena through heavy iron gates. Include gladiator battle cry, roaring stadium crowd and clanging iron gates foley, and epic cinematic percussion.' },

  // 🌿 Nature & Cinematic
  { category: 'cinematic', label: '🏛️ Amazonian Battle & Narration', prompt: 'An Amazonian warrior princess in bronze armor standing before Greek temple pillars as sunlight glints off her sword. Include inspiring warrior narration, metal armor clanking foley, and orchestral brass music.' },
  { category: 'cinematic', label: '🕵️ Noir Rain Investigation', prompt: 'A weary detective in a trenchcoat under a streetlamp smoking in rain-drenched 1950s Tokyo. Include gritty noir voiceover, rain drumming foley, and slow melancholy jazz trumpet.' },
  { category: 'cinematic', label: '🌌 Deep Space Monolith', prompt: 'An astronaut discovering a glowing crystalline monolith on an alien moon under a purple nebula sky. Include static radio voiceover, helmet breathing foley, and dark atmospheric synth pads.' },
  { category: 'cinematic', label: '🏛️ Jungle Temple Discovery', prompt: 'An explorer stepping through sunlit stone archways of a lost jungle temple covered in ancient moss. Include soft whispered commentary, jungle birds and crumbling stone foley, and acoustic guitar score.' },
  { category: 'cinematic', label: '🎭 Venetian Masquerade', prompt: 'A mysterious figure in a gilded Venetian mask stepping across a marble ballroom floor under candlelight. Include poetic voiceover about secrets, rustling silk dress foley, and grand classical waltz.' },
  { category: 'cinematic', label: '🌋 Volcanic Wasteland Trek', prompt: 'A lone traveler in a hooded cloak trekking across cracked obsidian volcanic ground under an orange ash sky. Include heavy breathing under hood, crunching ash footsteps foley, and dark drone music.' },
  { category: 'cinematic', label: '🌲 Deep Forest Creature Hunt', prompt: 'A ranger moving silently through a misty ancient forest, her bow drawn. Include urgent whispered voiceover, twig snap foley, and suspenseful eerie cello score.' },
  { category: 'cinematic', label: '⛵ Stormy Ocean Ship', prompt: 'A sea captain bracing against the wooden ship wheel as massive waves crash over the deck during a hurricane. Include loud captain command, roaring ocean storm foley, and dramatic sea shanty orchestra.' },
  { category: 'cinematic', label: '🚀 Warp Speed Takeoff', prompt: 'A pilot pulling back flight controls in a starfighter as hyperspace stars stretch into light beams. Include cockpit voice countdown, engine hum foley, and cinematic sci-fi theme.' },
  { category: 'cinematic', label: '🧙‍♂️ Wizard Spell Casting', prompt: 'An ancient wizard raising his carved wooden staff as golden arcane runes swirl in the air. Include Latin spell chant voiceover, crackling magic energy foley, and mystical fantasy orchestra.' },
  { category: 'cinematic', label: '🪐 Saturn Ring Flyby', prompt: 'A research vessel gliding past the icy rings of Saturn with the gas giant filling the background. Include captain log narration, ship hum foley, and ambient space soundscape.' },
  { category: 'cinematic', label: '🐺 Arctic Snow Hunt', prompt: 'A hunter clad in heavy furs tracking a majestic white wolf across a blinding blizzard snowscape. Include crunching snow footsteps foley, howling wind, and cold atmospheric string quartet.' },
  { category: 'cinematic', label: '🧗 Mountain Peak Conquest', prompt: 'A climber reaching the sharp summit of a snowy peak and planting a flag as sunrise breaks over the clouds. Include triumphant exhaled breath, wind gust foley, and inspiring piano orchestra.' },
];

export const AIDirectorPanel: React.FC = () => {
  const {
    project,
    setProject,
    updateSettings,
    addShot,
    removeShot,
    autoFixProject,
    directorModel,
    setDirectorModel,
    directorThinkingBudget,
    setDirectorThinkingBudget,
    directorMode,
    setDirectorMode,
  } = useStudioStore();

  const [idea, setIdea] = useState('');
  const [narrativeStyle, setNarrativeStyle] = useState<NarrativeStyle>('Live-Action Realism');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAllSeeds, setShowAllSeeds] = useState(false);
  const [seedCategoryFilter, setSeedCategoryFilter] = useState<'all' | 'solo' | 'sultry' | 'action' | 'cinematic'>('all');

  const activeShots = project.shots;
  const currentShotCount = activeShots.length;
  const totalDuration = project.settings.durationSeconds;
  const isImageMode = project.settings.mode !== 'T2VA';
  const hasReferences = project.references && project.references.length > 0;

  const handleSelectSeed = (seed: { label: string; prompt: string; category?: string }) => {
    setIdea(seed.prompt);
    if (seed.category === 'solo' || seed.prompt.toLowerCase().includes('solo ')) {
      updateSettings({ subjectComposition: 'solo' });
    } else if (seed.category === 'sultry' || seed.prompt.toLowerCase().includes('couple') || seed.prompt.toLowerCase().includes('two ')) {
      updateSettings({ subjectComposition: 'couple' });
    }
  };

  const handleAutoBuild = async () => {
    setIsGenerating(true);
    const provider = AIEngine.getActiveProvider();
    const apiKey = (localStorage.getItem('minimax_gemini_api_key') || import.meta.env.VITE_GEMINI_API_KEY || '').trim();
    const imageUrls = project.references ? project.references.map((r) => r.url) : [];

    // Directly generate Multimodal Storyboard in 1 fast step using direct multimodal image input
    const result = await provider.generateStoryboard(
      {
        idea: idea || project.description || 'Cyberpunk action standoff scene',
        images: imageUrls,
        mode: project.settings.mode,
        referenceMode: project.settings.referenceMode || 'strict',
        subjectComposition: project.settings.subjectComposition || 'solo',
        durationSeconds: totalDuration,
        shotsCount: currentShotCount,
        narrativeStyle,
        directorModel,
        thinkingBudget: directorThinkingBudget,
        directorMode,
      },
      apiKey
    );

    if (result.shots && result.shots.length > 0) {
      const updatedProj = {
        ...project,
        shots: result.shots as any,
        audio: result.audio ? { ...project.audio, ...result.audio } : project.audio,
      };
      setProject(updatedProj);

      // Auto-save generated storyboard prompt to Prompt Library
      useStudioStore.getState().savePromptToLibrary({
        title: idea ? (idea.length > 45 ? `${idea.substring(0, 45)}...` : idea) : `${narrativeStyle} Scene`,
        idea: idea || project.description || `${narrativeStyle} Scene`,
        narrativeStyle,
        mode: project.settings.mode,
        shotsCount: currentShotCount,
        durationSeconds: totalDuration,
      });
    }

    setIsGenerating(false);
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-6">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
        <div>
          <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            AI Director Workstation (100% Automated Visual Storyboarding)
          </h2>
          <p className="text-xs text-zinc-400">
            Set your mode, total duration ({totalDuration}s), shots count, and presets. Gemini auto-fills camera 3D, character identity, environment, and action prose for all shots.
          </p>
        </div>

        <span className="text-xs bg-cyan-950 border border-cyan-500/40 text-cyan-300 px-3 py-1 rounded-full font-mono font-bold">
          {currentShotCount} {currentShotCount === 1 ? 'Shot' : 'Shots'} ({(totalDuration / currentShotCount).toFixed(1)}s / shot)
        </span>
      </div>

      {/* Keyframe Reference Dropzone (Embedded for I2VA / FL2VA / L2VA) */}
      {isImageMode && (
        <div className="bg-zinc-950/80 border border-cyan-500/30 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-cyan-400" />
              Keyframe Anchor Dropzone ({project.settings.mode} Mode Active)
            </h4>
            <span className="text-[11px] text-zinc-400">
              Upload Picture 1 (0.00s) {project.settings.mode === 'FL2VA' ? '& Picture 2 (ending)' : ''}
            </span>
          </div>

          <ReferenceImageDropzone />
        </div>
      )}

      {/* Inputs & Presets */}
      <div className="space-y-4">
        {/* Dynamic Shot Chips + Add Shot Button */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs text-zinc-400 font-medium block">
              Active Storyboard Shots ({currentShotCount} Shot{currentShotCount > 1 ? 's' : ''} divided evenly across {totalDuration}s)
            </label>
            <span className="text-[11px] text-cyan-400 font-medium">Max 9 Shots</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {activeShots.map((shot, idx) => (
              <div
                key={shot.id}
                className="bg-cyan-950/60 border border-cyan-500/50 text-cyan-300 rounded-xl px-3.5 py-2 text-xs font-bold flex items-center gap-2 shadow-md shadow-cyan-500/10"
              >
                <span>Shot {idx + 1} ({shot.durationSeconds.toFixed(1)}s)</span>
                {currentShotCount > 1 && (
                  <button
                    type="button"
                    onClick={() => removeShot(idx)}
                    title="Remove Shot"
                    className="text-cyan-400 hover:text-red-400 transition-colors p-0.5 rounded"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}

            {currentShotCount < 9 && (
              <button
                type="button"
                onClick={() => addShot()}
                className="bg-zinc-950 hover:bg-zinc-800 border border-dashed border-zinc-700 hover:border-cyan-500/50 text-zinc-300 hover:text-cyan-300 rounded-xl px-4 py-2 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
              >
                <Plus className="w-4 h-4 text-cyan-400" />
                <span>+ Add Shot</span>
              </button>
            )}
          </div>
        </div>

        {/* Image Reference Behavior Mode Selector */}
        {project.settings.mode !== 'T2VA' && (
          <div>
            <label className="text-xs text-zinc-400 font-medium mb-1.5 block">Image Reference Anchor Behavior</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => updateSettings({ referenceMode: 'strict' })}
                className={`p-3 rounded-xl border text-left transition-all ${
                  (project.settings.referenceMode || 'strict') === 'strict'
                    ? 'bg-cyan-950/60 border-cyan-500 text-cyan-300 shadow-md shadow-cyan-500/10'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <div className="font-bold text-xs flex items-center gap-1.5">
                  <span>🔒 Strict Keyframe Lock</span>
                </div>
                <p className="text-[11px] text-zinc-400 mt-1 leading-normal">
                  Shot 1 begins exactly from Picture 1, preserving its original environment, lighting, wardrobe, and composition.
                </p>
              </button>

              <button
                type="button"
                onClick={() => updateSettings({ referenceMode: 'creative' })}
                className={`p-3 rounded-xl border text-left transition-all ${
                  project.settings.referenceMode === 'creative'
                    ? 'bg-purple-950/60 border-purple-500 text-purple-300 shadow-md shadow-purple-500/10'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <div className="font-bold text-xs flex items-center gap-1.5">
                  <span>🎨 Identity Lock Only</span>
                </div>
                <p className="text-[11px] text-zinc-400 mt-1 leading-normal">
                  Preserves the character's facial identity and hairstyle while allowing a new environment, lighting, and wardrobe.
                </p>
              </button>
            </div>
          </div>
        )}

        {/* Scene Subject & Character Composition Selector */}
        <div>
          <label className="text-xs text-zinc-300 font-bold mb-1.5 block">Scene Subject Composition</label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => updateSettings({ subjectComposition: 'solo' })}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                (project.settings.subjectComposition || 'solo') === 'solo'
                  ? 'bg-amber-950/60 border-amber-500 text-amber-300 shadow-md shadow-amber-500/10'
                  : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
              }`}
            >
              <div className="font-bold text-xs flex items-center gap-1.5">
                <span>👤 Solo Character (Single S1)</span>
              </div>
              <p className="text-[10px] text-zinc-400 mt-0.5 leading-normal">
                Strictly 1 solo protagonist. Zero couple or secondary character dialogue.
              </p>
            </button>

            <button
              type="button"
              onClick={() => updateSettings({ subjectComposition: 'couple' })}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                project.settings.subjectComposition === 'couple'
                  ? 'bg-cyan-950/60 border-cyan-500 text-cyan-300 shadow-md shadow-cyan-500/10'
                  : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
              }`}
            >
              <div className="font-bold text-xs flex items-center gap-1.5">
                <span>👩‍❤️‍👨 Couple / Duo (S1 + S2)</span>
              </div>
              <p className="text-[10px] text-zinc-400 mt-0.5 leading-normal">
                Dual interaction between 2 main characters with shared spoken dialogue.
              </p>
            </button>

            <button
              type="button"
              onClick={() => updateSettings({ subjectComposition: 'ensemble' })}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                project.settings.subjectComposition === 'ensemble'
                  ? 'bg-purple-950/60 border-purple-500 text-purple-300 shadow-md shadow-purple-500/10'
                  : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
              }`}
            >
              <div className="font-bold text-xs flex items-center gap-1.5">
                <span>👥 Group Ensemble</span>
              </div>
              <p className="text-[10px] text-zinc-400 mt-0.5 leading-normal">
                Multi-character scene with group interaction and environmental crowd.
              </p>
            </button>
          </div>
        </div>

        {/* Narrative Style Selector (Expanded Presets) */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs text-zinc-300 font-bold block">Narrative & Motion Style Presets ({NARRATIVE_STYLES.length} Presets)</label>
            <span className="text-[10px] text-cyan-400 font-mono">Select "Live-Action Realism" for 100% natural human motion & real-world physics</span>
          </div>
          <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
            {NARRATIVE_STYLES.map((style) => {
              const isSelected = narrativeStyle === style;
              return (
                <button
                  key={style}
                  type="button"
                  onClick={() => setNarrativeStyle(style)}
                  className={`px-3 py-1.5 text-xs rounded-xl font-semibold transition-all ${
                    isSelected
                      ? 'bg-cyan-500 text-zinc-950 shadow-lg shadow-cyan-500/20'
                      : 'bg-zinc-950 text-zinc-400 border border-zinc-800 hover:text-zinc-200'
                  }`}
                >
                  {style}
                </button>
              );
            })}
          </div>
        </div>

        {/* Story Vision Seed Quick Presets */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs text-zinc-400 font-medium flex items-center gap-1.5">
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
              <span>Quick Story Seed Presets (Click to Load Idea)</span>
            </label>
            <button
              type="button"
              onClick={() => setShowAllSeeds(!showAllSeeds)}
              className="text-[11px] text-cyan-400 hover:text-cyan-300 font-bold transition-all flex items-center gap-1"
            >
              <span>{showAllSeeds ? 'Show Less ▴' : `Browse All (${STORY_SEED_PRESETS.length}) ▾`}</span>
            </button>
          </div>

          {/* Seed Category Filter Pills */}
          <div className="flex flex-wrap gap-1.5 mb-2.5">
            {[
              { id: 'all', label: `✨ All (${STORY_SEED_PRESETS.length})` },
              { id: 'solo', label: '👤 Solo Protagonist' },
              { id: 'sultry', label: '💋 Sultry & Romance' },
              { id: 'action', label: '⚔️ Action & Sci-Fi' },
              { id: 'cinematic', label: '🌿 Nature & Cinema' },
            ].map((cat) => {
              const isActive = seedCategoryFilter === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSeedCategoryFilter(cat.id as any)}
                  className={`px-2.5 py-1 text-[11px] font-medium rounded-lg transition-all ${
                    isActive
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-xs'
                      : 'bg-zinc-950 text-zinc-400 border border-zinc-800 hover:text-zinc-200'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          <div className={`flex flex-wrap gap-1.5 transition-all ${showAllSeeds ? 'max-h-56 overflow-y-auto pr-1 p-2 bg-zinc-950/80 rounded-xl border border-zinc-800' : ''}`}>
            {(
              seedCategoryFilter === 'all'
                ? (showAllSeeds ? STORY_SEED_PRESETS : STORY_SEED_PRESETS.slice(0, 8))
                : STORY_SEED_PRESETS.filter((s) => s.category === seedCategoryFilter)
            ).map((seed) => (
              <button
                key={seed.label}
                type="button"
                onClick={() => handleSelectSeed(seed)}
                className="px-2.5 py-1 text-[11px] bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 hover:border-cyan-500/40 text-zinc-300 rounded-lg transition-all"
              >
                {seed.label}
              </button>
            ))}
          </div>
        </div>

        {/* Vision Prompt Hints Textbox */}
        <div className="space-y-2">
          <label className="text-xs text-zinc-400 font-medium block">
            Creative Vision Story Hints & Prompt Idea
          </label>
          <textarea
            rows={3}
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            placeholder="e.g. A young female cyborg warrior drawing her katana in a rain-soaked neon Neo-Tokyo alleyway..."
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-200 focus:outline-none focus:border-cyan-500/50 font-mono"
          />

          {/* Smart Contradiction Warning Alert */}
          {(() => {
            const isSoloSelected = (project.settings.subjectComposition || 'solo') === 'solo';
            const hasCoupleKeywords = /\b(couple|lovers|husband|wife|together|embrace her|his fingers|two friends|dual|pair)\b/i.test(idea);
            const isContradiction = isSoloSelected && hasCoupleKeywords;

            if (isContradiction) {
              return (
                <div className="p-3 bg-amber-500/15 border border-amber-500/40 rounded-xl flex items-center justify-between gap-3 text-xs text-amber-300 shadow-sm animate-fade-in">
                  <div className="flex items-center gap-2">
                    <span className="text-base">⚠️</span>
                    <span>
                      <strong>Setting Contradiction Detected:</strong> Your prompt describes a couple, but <strong>Solo Character</strong> is selected.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => updateSettings({ subjectComposition: 'couple' })}
                    className="px-3 py-1 bg-amber-500 text-zinc-950 font-bold rounded-lg hover:bg-amber-400 transition-all text-xs shrink-0 shadow-sm"
                  >
                    Switch to Couple Mode
                  </button>
                </div>
              );
            }

            const isCoupleSelected = project.settings.subjectComposition === 'couple';
            const hasSoloKeywords = /\b(solo woman|solo female|solo male|solo protagonist|lone traveler|single person)\b/i.test(idea);
            if (isCoupleSelected && hasSoloKeywords) {
              return (
                <div className="p-3 bg-cyan-500/15 border border-cyan-500/40 rounded-xl flex items-center justify-between gap-3 text-xs text-cyan-300 shadow-sm animate-fade-in">
                  <div className="flex items-center gap-2">
                    <span className="text-base">💡</span>
                    <span>
                      <strong>Setting Notice:</strong> Your prompt describes a solo person, but <strong>Couple Mode</strong> is selected.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => updateSettings({ subjectComposition: 'solo' })}
                    className="px-3 py-1 bg-cyan-500 text-zinc-950 font-bold rounded-lg hover:bg-cyan-400 transition-all text-xs shrink-0 shadow-sm"
                  >
                    Switch to Solo Mode
                  </button>
                </div>
              );
            }

            return null;
          })()}
        </div>
      </div>

      {/* Advanced AI Director Controls (Model, Thinking Level & Director Mode) */}
      <div className="space-y-4 pt-4 border-t border-zinc-800/80 bg-zinc-950/60 p-4 rounded-2xl border border-zinc-800">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 1. AI Director Model */}
          <div className="space-y-1.5">
            <label className="text-[11px] text-zinc-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              Director AI Model
            </label>
            <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-xl border border-zinc-800">
              <button
                type="button"
                onClick={() => setDirectorModel('gemini-2.5-pro')}
                className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-all ${
                  directorModel === 'gemini-2.5-pro'
                    ? 'bg-violet-500/30 text-violet-300 border border-violet-500/50 shadow-md'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                2.5 Pro 🧠
              </button>
              <button
                type="button"
                onClick={() => setDirectorModel('gemini-3.5-flash')}
                className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-all ${
                  directorModel === 'gemini-3.5-flash'
                    ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-500/50 shadow-md'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                3.5 Flash ⚡
              </button>
              <button
                type="button"
                onClick={() => setDirectorModel('gemini-2.5-flash')}
                className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-all ${
                  directorModel === 'gemini-2.5-flash'
                    ? 'bg-blue-500/30 text-blue-300 border border-blue-500/50 shadow-md'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                2.5 Flash
              </button>
            </div>
          </div>

          {/* 2. Thinking Level / Reasoning Budget */}
          <div className="space-y-1.5">
            <label className="text-[11px] text-zinc-400 font-bold uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Brain className="w-3.5 h-3.5 text-purple-400" />
                Thinking Level
              </span>
              <span className="text-[10px] text-purple-300 font-mono font-bold">
                {directorThinkingBudget >= 8192
                  ? 'Deep (8k)'
                  : directorThinkingBudget >= 4096
                  ? 'Standard (4k)'
                  : directorThinkingBudget >= 1024
                  ? 'Fast (1k)'
                  : 'Off (0)'}
              </span>
            </label>

            <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-xl border border-zinc-800">
              {[
                { budget: 8192, label: 'Deep 🧠' },
                { budget: 4096, label: 'Std ⚖️' },
                { budget: 1024, label: 'Fast ⚡' },
                { budget: 0, label: 'Off 🚀' },
              ].map((t) => (
                <button
                  key={t.budget}
                  type="button"
                  onClick={() => setDirectorThinkingBudget(t.budget)}
                  className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-all ${
                    directorThinkingBudget === t.budget
                      ? 'bg-purple-500/30 text-purple-300 border border-purple-500/50 shadow-md'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Director Creative Mode */}
          <div className="space-y-1.5">
            <label className="text-[11px] text-zinc-400 font-bold uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Gauge className="w-3.5 h-3.5 text-amber-400" />
                Director Creative Mode
              </span>
              <span className="text-[10px] text-amber-300 font-mono font-bold">
                {directorMode === 'strict' ? 'Temp 0.2' : directorMode === 'creative' ? 'Temp 0.8' : 'Temp 0.5'}
              </span>
            </label>

            <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-xl border border-zinc-800">
              {[
                { mode: 'strict', label: 'Strict 🎯' },
                { mode: 'balanced', label: 'Balanced 🎬' },
                { mode: 'creative', label: 'Creative 🎨' },
              ].map((m) => (
                <button
                  key={m.mode}
                  type="button"
                  onClick={() => setDirectorMode(m.mode as any)}
                  className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-all ${
                    directorMode === m.mode
                      ? 'bg-amber-500/30 text-amber-300 border border-amber-500/50 shadow-md'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Action Button Bar */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-zinc-800/60">
          <button
            type="button"
            onClick={handleAutoBuild}
            disabled={isGenerating}
            className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-zinc-950 font-extrabold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20 disabled:opacity-50 transition-all flex-1 justify-center"
          >
            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>
              {isGenerating
                ? `Gemini Director (${directorModel}) Generating...`
                : hasReferences
                ? `✨ Build ${currentShotCount}-Shot Storyboard Using Visual Keyframes (${project.references.length})`
                : `✨ Build ${currentShotCount}-Shot Storyboard with ${directorModel}`}
            </span>
          </button>

          <button
            type="button"
            onClick={autoFixProject}
            className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            <Video className="w-4 h-4 text-cyan-400" />
            <span>✨ Polish Camera 3D</span>
          </button>
        </div>
      </div>
    </div>
  );
};
