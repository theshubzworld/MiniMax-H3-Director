import React, { useState } from 'react';
import { useStudioStore } from '../../store/StudioStore';
import { AIEngine } from '../../ai/AIEngine';
import { NarrativeStyle } from '../../ai/interfaces/AIProvider';
import { ReferenceImageDropzone } from '../reference/ReferenceImageDropzone';
import { Sparkles, Video, Loader2, Plus, Trash2, Lightbulb, Image as ImageIcon, Cpu } from 'lucide-react';

const NARRATIVE_STYLES: NarrativeStyle[] = [
  'Live-Action Realism',
  'Cinematic Film',
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
  { label: '🛏️ Bedroom Sunbeam Romance', prompt: 'A romantic couple waking up in white linen sheets as warm morning sunbeams stream through linen curtains. Include whispered intimate dialogue, soft sheet rustle foley, and acoustic guitar score.' },
  { label: '🛁 Candlelit Bath Spa Romance', prompt: 'A romantic couple relaxing in a steamy freestanding marble bathtub surrounded by glowing candles and rose petals. Include soft whispered dialogue, gentle water splash foley, and ambient piano music.' },
  { label: '🏡 Kitchen Morning Coffee Romance', prompt: 'A couple laughing together in a sun-drenched modern kitchen while making morning coffee in silk loungewear. Include playful dialogue, clinking coffee cups foley, and warm lo-fi lounge beats.' },
  { label: '🌊 Sunset Beach Couple Romance', prompt: 'A couple strolling hand-in-hand along the shoreline during a vibrant golden-hour sunset as ocean waves lap their bare feet. Include romantic whispered voiceover, ocean waves foley, and ambient piano orchestra.' },
  { label: '🌧️ Rainy Window Blanket Snuggle', prompt: 'A couple wrapped in a plush knit blanket on a window seat watching rain drum against glass with steaming mugs. Include cozy dialogue, rain drumming on glass foley, and acoustic folk music.' },
  { label: '🌳 Wildflower Meadow Picnic', prompt: 'A couple lounging on a checkered blanket in a sun-dappled wildflower meadow under a large oak tree. Include happy shared laughter, warm summer breeze foley, and romantic acoustic guitar music.' },
  { label: '🏛️ Amazonian Battle & Narration', prompt: 'An Amazonian warrior princess in bronze armor standing before Greek temple pillars as sunlight glints off her sword. Include inspiring warrior narration, metal armor clanking foley, and orchestral brass music.' },
  { label: '🌅 Beach Sunset Waves & Voiceover', prompt: 'A serene woman walking along a wet sand shoreline during golden-hour sunset, her wrap catching sea breeze. Include soft reflective voiceover, gentle ocean waves, and ambient piano music.' },
  { label: '🗡️ Cyborg Katana Rain & Dialogue', prompt: 'A female cyborg warrior drawing a glowing plasma katana in a rain-soaked neon Neo-Tokyo alleyway. Include spoken battle dialogue, sizzle rain foley, and heavy dark synthwave music.' },
  { label: '👗 Fashion Runway Spotlights & Music', prompt: 'A haute couture supermodel walking an obsidian mirror runway surrounded by spotlights. Include camera shutter clicks foley, director voiceover cues, and deep house electronic music.' },
  { label: '🕵️ Noir Rain Investigation & Narration', prompt: 'A weary detective in a trenchcoat under a streetlamp smoking in rain-drenched 1950s Tokyo. Include gritty noir voiceover, rain drumming foley, and slow melancholy jazz trumpet.' },
  { label: '🌌 Deep Space Monolith & Radio Transmissions', prompt: 'An astronaut discovering a glowing crystalline monolith on an alien moon under a purple nebula sky. Include static radio voiceover, helmet breathing foley, and dark atmospheric synth pads.' },
  { label: '🥋 Bamboo Forest Sword Duel & Kiai', prompt: 'Two martial arts masters facing off in a mist-covered bamboo forest at twilight as cherry blossom petals swirl. Include a sharp battle kiai shout, katana steel clashing foley, and traditional koto flute music.' },
  { label: '🏎️ Cyberpunk Tunnel Drift & Engine Roar', prompt: 'A matte-black hypercar drifting through a neon highway tunnel with light trails. Include a roaring V12 engine turbo blowoff foley, futuristic radio chatter, and driving synthwave music.' },
  { label: '⚡ Superhero Rooftop Vigil & Heroic Speech', prompt: 'An armored heroine standing on a skyscraper ledge overseeing a stormy metropolis as lightning strikes. Include heroic voiceover, thunder rumble foley, and swelling cinematic brass score.' },
  { label: '🐉 Dragon Siege & Battle Cry', prompt: 'A warrior riding an armored crimson dragon soaring through stormy clouds above a mountain fortress. Include dragon roar and wind howl foley, warrior shout, and epic orchestral drums.' },
  { label: '💼 Penthouse Espionage & Whispered Dialogue', prompt: 'A sleek operative hacking a glass server terminal inside a high-rise Tokyo penthouse. Include tense whispered dialogue, keypress clicks foley, and suspenseful pulse synth score.' },
  { label: '🏛️ Jungle Temple Discovery & Ambient Foley', prompt: 'An explorer stepping through sunlit stone archways of a lost jungle temple covered in ancient moss. Include soft whispered commentary, jungle birds and crumbling stone foley, and acoustic guitar score.' },
  { label: '🎭 Venetian Masquerade & Waltz Narration', prompt: 'A mysterious figure in a gilded Venetian mask stepping across a marble ballroom floor under candlelight. Include poetic voiceover about secrets, rustling silk dress foley, and grand classical waltz.' },
  { label: '🌋 Volcanic Wasteland Trek & Heavy Breaths', prompt: 'A lone traveler in a hooded cloak trekking across cracked obsidian volcanic ground under an orange ash sky. Include heavy breathing under hood, crunching ash footsteps foley, and dark drone music.' },
  { label: '🎶 Rooftop Music Video Vocal & Guitar', prompt: 'A singer performing on a rooftop helipad at dusk as warm lens flares reflect off vintage microphones. Include vocal singing melody, wind microphone pop foley, and indie pop guitar music.' },
  { label: '🤖 Mecha Power-Up & System Voice', prompt: 'A 50-foot military mecha powering up its shoulder cannons as alarm strobes illuminate a hangar bay. Include robotic AI voice, heavy hydraulic servo foley, and industrial metal beat.' },
  { label: '🌲 Deep Forest Creature Hunt & Whispers', prompt: 'A ranger moving silently through a misty ancient forest, her bow drawn. Include urgent whispered voiceover, twig snap foley, and suspenseful eerie cello score.' },
  { label: '⛵ Stormy Ocean Ship & Captain\'s Shout', prompt: 'A sea captain bracing against the wooden ship wheel as massive waves crash over the deck during a hurricane. Include loud captain command, roaring ocean storm foley, and dramatic sea shanty orchestra.' },
  { label: '🚀 Warp Speed Takeoff & Countdown', prompt: 'A pilot pulling back flight controls in a starfighter as hyperspace stars stretch into light beams. Include cockpit voice countdown, engine hum foley, and cinematic sci-fi theme.' },
  { label: '🏎️ Formula 1 Pit Stop & Air Wrenches', prompt: 'A pit crew changing tires on a Formula 1 racecar in 2 seconds flat under stadium floodlights. Include mechanic leader shout, pneumatic air wrench foley, and high-energy rock score.' },
  { label: '🌇 Rooftop Sunset Cafe & Casual Dialogue', prompt: 'Two friends laughing and sipping espresso at a Mediterranean rooftop bistro overlooking a coastal town at sunset. Include natural conversational dialogue, clinking coffee cups foley, and chill lo-fi beats.' },
  { label: '🧙‍♂️ Wizard Spell Casting & Chants', prompt: 'An ancient wizard raising his carved wooden staff as golden arcane runes swirl in the air. Include Latin spell chant voiceover, crackling magic energy foley, and mystical fantasy orchestra.' },
  { label: '🧟 Zombie Apocalypse Alley & Breathing', prompt: 'A survivor creeping past rusted cars in a ruined overgrown city street. Include terrified panting breath, distant zombie groans foley, and minimal nerve-wracking synth drone.' },
  { label: '🪐 Saturn Ring Flyby & Astronaut Logs', prompt: 'A research vessel gliding past the icy rings of Saturn with the gas giant filling the background. Include captain log narration, ship hum foley, and ambient space soundscape.' },
  { label: '🐺 Arctic Snow Hunt & Howling Winds', prompt: 'A hunter clad in heavy furs tracking a majestic white wolf across a blinding blizzard snowscape. Include crunching snow footsteps foley, howling wind, and cold atmospheric string quartet.' },
  { label: '🎆 New Year Skyline & Countdown Cheers', prompt: 'A crowd cheering on a skyscraper balcony as colorful fireworks explode over the city bay at midnight. Include crowd 10-second countdown and cheering foley, fireworks booms, and festive synth pop.' },
  { label: '🏜️ Desert Highway Ride & Engine Thunder', prompt: 'A biker riding a custom chrome chopper down a endless desert highway as red rock mesas pass. Include leather jacket wind flap and engine roar foley, and southern rock slide guitar music.' },
  { label: '🧪 Cyber Lab Awakening & AI Voice', prompt: 'A bio-android opening glowing blue eyes inside a glass fluid chamber as wires disconnect. Include synthetic female voice, glass hiss foley, and pulsing ambient electronic beat.' },
  { label: '🧗 Mountain Peak Conquest & Exhale', prompt: 'A climber reaching the sharp summit of a snowy peak and planting a flag as sunrise breaks over the clouds. Include triumphant exhaled breath, wind gust foley, and inspiring piano orchestra.' },
  { label: '⚔️ Gladiator Arena Entrance & Crowd Roar', prompt: 'A warrior stepping into a sun-drenched Roman arena through heavy iron gates. Include gladiator battle cry, roaring stadium crowd and clanging iron gates foley, and epic cinematic percussion.' },
];

export const AIDirectorPanel: React.FC = () => {
  const { project, setProject, updateSettings, addShot, removeShot, autoFixProject } = useStudioStore();
  const [idea, setIdea] = useState('');
  const [narrativeStyle, setNarrativeStyle] = useState<NarrativeStyle>('Live-Action Realism');
  const [isGenerating, setIsGenerating] = useState(false);
  const [directorModel, setDirectorModel] = useState<'gemini-2.5-pro' | 'gemini-3.5-flash'>('gemini-2.5-pro');

  const activeShots = project.shots;
  const currentShotCount = activeShots.length;
  const totalDuration = project.settings.durationSeconds;
  const isImageMode = project.settings.mode !== 'T2VA';
  const hasReferences = project.references && project.references.length > 0;

  const handleSelectSeed = (seedPrompt: string) => {
    setIdea(seedPrompt);
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
        durationSeconds: totalDuration,
        shotsCount: currentShotCount,
        narrativeStyle,
        directorModel,
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
          <label className="text-xs text-zinc-400 font-medium mb-1.5 flex items-center gap-1.5">
            <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
            Quick Story Seed Presets (Click to Load Idea)
          </label>
          <div className="flex flex-wrap gap-1.5">
            {STORY_SEED_PRESETS.map((seed) => (
              <button
                key={seed.label}
                type="button"
                onClick={() => handleSelectSeed(seed.prompt)}
                className="px-2.5 py-1 text-[11px] bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 hover:border-cyan-500/40 text-zinc-300 rounded-lg transition-all"
              >
                {seed.label}
              </button>
            ))}
          </div>
        </div>

        {/* Vision Prompt Hints Textbox */}
        <div>
          <label className="text-xs text-zinc-400 font-medium mb-1.5 block">
            Creative Vision Story Hints & Prompt Idea
          </label>
          <textarea
            rows={3}
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            placeholder="e.g. A young female cyborg warrior drawing her katana in a rain-soaked neon Neo-Tokyo alleyway..."
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-200 focus:outline-none focus:border-cyan-500/50 font-mono"
          />
        </div>
      </div>

      {/* Director Model Selection & Action Buttons */}
      <div className="space-y-3 pt-2 border-t border-zinc-800">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-cyan-400 flex-shrink-0" />
          <span className="text-xs text-zinc-300 font-semibold">Director AI Model:</span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setDirectorModel('gemini-2.5-pro')}
              className={`px-3 py-1 text-xs font-bold rounded-lg border transition-all ${
                directorModel === 'gemini-2.5-pro'
                  ? 'bg-violet-500/30 border-violet-500/60 text-violet-300 shadow-md shadow-violet-500/10'
                  : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
              }`}
            >
              Gemini 2.5 Pro
            </button>
            <button
              type="button"
              onClick={() => setDirectorModel('gemini-3.5-flash')}
              className={`px-3 py-1 text-xs font-bold rounded-lg border transition-all ${
                directorModel === 'gemini-3.5-flash'
                  ? 'bg-cyan-500/30 border-cyan-500/60 text-cyan-300 shadow-md shadow-cyan-500/10'
                  : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
              }`}
            >
              3.5 Flash ⚡
            </button>
          </div>
          <span className="text-[11px] text-zinc-500 hidden sm:inline font-mono">
            {directorModel === 'gemini-2.5-pro' ? '(Highest Quality & Deep Reasoning)' : '(Ultra Fast Generation)'}
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleAutoBuild}
            disabled={isGenerating}
            className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-zinc-950 font-extrabold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20 disabled:opacity-50 transition-all"
          >
            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>
              {isGenerating
                ? `Gemini Director (${directorModel === 'gemini-3.5-flash' ? '3.5 Flash' : '2.5 Pro'}) Generating...`
                : hasReferences
                ? `✨ Build ${currentShotCount}-Shot Storyboard Using Visual Keyframes (${project.references.length})`
                : `✨ Build ${currentShotCount}-Shot Storyboard with ${directorModel === 'gemini-3.5-flash' ? '3.5 Flash ⚡' : 'Gemini 2.5 Pro'}`}
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
