import React, { useState, useMemo } from 'react';
import { useStudioStore } from '../../store/StudioStore';
import { AIEngine } from '../../ai/AIEngine';
import { GeminiProvider, NARRATIVE_STYLE_DIRECTIVES } from '../../ai/providers/GeminiProvider';
import { NarrativeStyle } from '../../ai/interfaces/AIProvider';
import { ReferenceImageDropzone } from '../reference/ReferenceImageDropzone';
import { Sparkles, Video, Loader2, Plus, Trash2, Lightbulb, Image as ImageIcon, Cpu, Brain, Sliders, Gauge, Zap, Clock } from 'lucide-react';
import { ALL_VISUAL_STYLES, VisualStyle, AspectRatio } from '../../types/project';

export interface NarrativePresetItem {
  id: NarrativeStyle;
  category: 'raw' | 'sultry' | 'cinema' | 'action' | 'artistic';
}

export const NARRATIVE_STYLE_PREVIEWS: Record<string, string> = {
  'None': 'Unstyled - Allow AI Director to infer camera motion, lighting, and soundscape purely from your raw story idea without rigid style directives.',
  'Live-Action Realism': '100% natural human motion, realistic skin textures, 35mm optical lens physics, and authentic real-world environmental lighting.',
  'Raw Home Amateur Mobile': 'Authentic home environment amateur mobile video switching seamlessly between handheld selfie angles and propped-up 3rd-person phone placement, casual unpolished room lighting, subtle mobile sensor grain noise, and 100% everyday real-world realism.',
  'Raw Third-Person Mobile': 'Candid 3rd-person handheld mobile camera tracking focusing mostly on body movement, natural depth of field, subtle handheld micro-shake, and authentic unpolished room lighting.',
  'Candid Third-Person Sensual': 'Soft 3rd-person handheld body-focused camera tracking around waist, back, and torso contours, backlit golden sunbeams through delicate fabrics, and warm tungsten lamp falloff.',
  'Raw Smartphone Amateur': 'Direct mobile phone flash glow, slight sensor grain noise, casual unpolished indoor lighting, and authentic everyday Instagram story video physics.',
  'Amateur Mobile Vlog': 'Arm-length handheld selfie angle, natural outdoor daylight glare, subtle focus hunting, and casual conversational vlog movement.',
  'Candid Selfie Motion': 'Dim mobile screen glow, Instagram story flash highlights, subtle facial micro-expressions, and authentic front-camera mobile noise.',
  'Cinematic Film': 'Dramatic 35mm anamorphic widescreen framing, moody chiaroscuro shadow falloff, cinematic depth of field, and soft warm tungsten key lighting.',
  'Sultry Romance': 'Body-focused framing prioritizing torso, back, and silhouette contours, soft warm candlelit glow, sensual low-key side lighting, and slow intimate camera tracking.',
  'Sensual Intimacy': 'Dim romantic lamplight, soft warm rim light tracing waist and shoulder contours, body-centric camera dolly movement, and moody twilight bedroom atmosphere.',
  'Steamy Thriller': 'Steamy neon magenta backlight, body-focused shadow contrast on torso and shoulders, wet skin reflections, and intense low-angle camera push-in.',
  'Velvet Boudoir': 'Body-focused framing sweeping along hips, waist, and back, soft velvet lamp diffusion, golden amber key lighting, and warm shadow falloff.',
  'Erotic Romance': 'Dim candlelit silhouette glow focusing primarily on full body and torso framing, warm intimate side lighting, and lingering camera pans across contours.',
  'Commercial': 'Crisp 3-point daylight studio lighting, vibrant color fidelity, high-contrast product rim light, and smooth motorized gimbal pans.',
  'Fashion': 'High-key studio flash lighting, glossy editorial reflections, obsidian mirror runway floor, and dramatic high-fashion posing dynamics.',
  'Action': 'Fast-paced kinetic camera tracking, strobing emergency alert spotlights, fiery explosion contrast, and high-impact physical stunt beats.',
  'Music Video': 'Rhythmic camera cuts, energetic lens flares, neon cyan and magenta backlighting, and stylised slow-motion performance beats.',
  'Documentary': 'Authentic ambient golden sunlight, handheld observational camera tracking, natural overcast diffusion, and unscripted real-world atmosphere.',
  'Product': 'Macro close-up lens detail, soft studio lightbox diffusion, 360-degree turntable motion, and pristine surface texture highlights.',
  'Travel': 'Sweeping 4K drone aerials, vibrant golden hour sunbeams, immersive environmental soundscapes, and panoramic landscape vistas.',
  'Anime': '2D cel-shaded artwork, dramatic high-contrast rim light, volumetric atmospheric sunbeams, and expressive anime action keyframes.',
  'Sci-Fi Thriller': 'Cold blue neon telemetry lights, volumetric smoke diffusion, metallic reflections, and suspenseful slow dolly tracking.',
  'Dark Fantasy': 'Gothic chiaroscuro key lighting, ancient stone architecture, atmospheric fog diffusion, and eerie moonlit shadows.',
  'Horror Suspense': 'Harsh flickering low-key spotlights, deep pitch-black shadows, slow creeping camera zooms, and unsettling atmospheric tension.',
  'Romance Drama': 'Golden hour sunset rim light, warm lens flares, emotional close-up framing, and soft shallow depth-of-field blur.',
  'Gaming Trailer': 'Unreal Engine 5 volumetric lighting, high-contrast particle effects, hyper-detailed metallic shaders, and cinematic gaming cuts.',
  'Sports Hype': 'High-speed 120fps slow-motion tracking, intense stadium floodlights, sweat droplet reflections, and explosive athletic kinetic motion.',
  'Automotive Showcase': 'Low-angle chassis tracking, dynamic rolling wheel blur, specular chrome reflections, and sleek aerodynamic light trails.',
  'Comedy Sketch': 'Bright even sitcom lighting, wide-angle static framing, clear character visibility, and expressive comedic timing beats.',
  'Historical Epic': 'Authentic torchlight glow, sweeping period wardrobe details, natural outdoor overcast skies, and grand orchestral scale.',
  'Superhero Origin': 'Dramatic low-angle hero framing, lightning arc rim lights, billowing cape dynamics, and epic cinematic scale.',
  'Experimental Surrealism': 'Dreamlike liquid distortions, glowing color shifts, gravity-defying camera angles, and abstract optical light leaks.',
};

const NARRATIVE_PRESETS: NarrativePresetItem[] = [
  // 📱 Raw & Amateur Realism
  { id: 'None', category: 'raw' },
  { id: 'Live-Action Realism', category: 'raw' },
  { id: 'Raw Home Amateur Mobile', category: 'raw' },
  { id: 'Raw Third-Person Mobile', category: 'raw' },
  { id: 'Candid Third-Person Sensual', category: 'raw' },
  { id: 'Raw Smartphone Amateur', category: 'raw' },
  { id: 'Amateur Mobile Vlog', category: 'raw' },
  { id: 'Candid Selfie Motion', category: 'raw' },

  // 💋 Sultry & Romance
  { id: 'Sultry Romance', category: 'sultry' },
  { id: 'Sensual Intimacy', category: 'sultry' },
  { id: 'Steamy Thriller', category: 'sultry' },
  { id: 'Velvet Boudoir', category: 'sultry' },
  { id: 'Erotic Romance', category: 'sultry' },
  { id: 'Romance Drama', category: 'sultry' },

  // 🎬 Cinema & Drama
  { id: 'Cinematic Film', category: 'cinema' },
  { id: 'Fashion', category: 'cinema' },
  { id: 'Commercial', category: 'cinema' },
  { id: 'Documentary', category: 'cinema' },
  { id: 'Product', category: 'cinema' },
  { id: 'Travel', category: 'cinema' },
  { id: 'Historical Epic', category: 'cinema' },
  { id: 'Comedy Sketch', category: 'cinema' },
  { id: 'Experimental Surrealism', category: 'cinema' },

  // ⚔️ Action & Sci-Fi
  { id: 'Action', category: 'action' },
  { id: 'Sci-Fi Thriller', category: 'action' },
  { id: 'Dark Fantasy', category: 'action' },
  { id: 'Horror Suspense', category: 'action' },
  { id: 'Gaming Trailer', category: 'action' },
  { id: 'Sports Hype', category: 'action' },
  { id: 'Automotive Showcase', category: 'action' },
  { id: 'Superhero Origin', category: 'action' },
  { id: 'Music Video', category: 'action' },

  // 🎨 Anime & Artistic
  { id: 'Anime', category: 'artistic' },
];

const NARRATIVE_STYLES: NarrativeStyle[] = NARRATIVE_PRESETS.map((p) => p.id);

const STORY_SEED_PRESETS = [
  // 📱 Uncensored NSFW Simple Real-Motion Seeds (Single Person S1)
  { category: 'solo-sultry', label: '📱 Uncensored Mobile Video Call', prompt: 'A woman lying on an unmade bed holding her phone above her face on a video call. She looks into the camera with a playful smile, adjusting her top slightly as she talks into the screen. Include soft room tone, sheet rustle, and ambient lo-fi piano.' },
  { category: 'solo-sultry', label: '🕯️ Uncensored Bedside Caress', prompt: 'A woman reclining on white hotel bedsheets under warm dim lamplight. In a continuous real-motion sequence, she arches her back gently and runs her fingers down her collarbone with a soft, relaxed gaze. Include quiet breathing foley, sheet rustle, and sultry ambient pads.' },
  { category: 'solo-sultry', label: '💦 Uncensored Steamy Vanity', prompt: 'A woman standing before a steamy bathroom mirror wiping a circle clear on the foggy glass with her palm under warm vanity lights. She turns slowly, running her fingers down her collarbone with a soft sigh. Include water droplet foley, soft breath, and ambient synth.' },

  // 💃 Raw Third-Person Sensual & Boudoir (Single Person S1 - Wardrobe Agnostic)
  { category: 'solo-sultry', label: '💃 Raw 3rd-Person Sunset Walk', prompt: 'A raw handheld third-person mobile video of a solo woman walking gracefully across a sunlit room towards a window. In a candid 3/4 camera tracking shot, golden sunbeams backlight her silhouette against the gentle breeze. Include soft footsteps foley, quiet breath, and ambient lo-fi piano.' },
  { category: 'solo-sultry', label: '🕯️ Raw 3rd-Person Lounge Evening', prompt: 'A raw handheld third-person video of a solo woman relaxing on a plush velvet chaise lounge under warm tungsten lamplight. The camera tracks slowly around her in an unpolished mobile motion as she turns her head with a seductive gaze. Include quiet breathing foley, soft movement, and sultry jazz saxophone.' },
  { category: 'solo-sultry', label: '🌊 Raw 3rd-Person Beach Shoreline', prompt: 'A raw third-person mobile camera tracking a solo woman walking along wet beach sand backlit by golden-hour sunset. Handheld micro-shake optics and soft lens flare illuminating her figure against ocean waves. Include ocean breeze foley and acoustic guitar score.' },
  { category: 'solo-sultry', label: '📱 Raw Smartphone Mirror Selfie', prompt: 'A casual vertical iPhone mirror selfie of a solo woman standing in a modern bathroom under warm vanity lighting. In a raw handheld mobile motion, she leans slightly against the marble counter with a candid smile as the phone flash creates soft rim blowout. Include slight mobile sensor noise foley, quiet breath, and authentic Instagram story aesthetic.' },
  { category: 'solo-sultry', label: '🤳 Raw Mobile Vlog Walk & Talk', prompt: 'A solo woman holding her smartphone at arm length walking down a sunny city sidewalk talking directly into the camera. Natural handheld micro-shake and focus hunt optics. Include ambient street traffic foley, natural wind in hair, and candid amateur video physics.' },
  { category: 'solo-sultry', label: '📱 Raw Mobile Bedroom Flash', prompt: 'A candid handheld smartphone video of a solo woman sitting on white linen sheets under dim bedroom lamp light. Direct phone flash glow causing slight shadow noise. Include soft laughter foley, sheet rustle, and authentic mobile sensor grain.' },

  // 💃 Solo Sultry & Boudoir (Single Person S1 - Wardrobe Agnostic)
  { category: 'solo-sultry', label: '🔥 Raw POV Bedside Motion', prompt: 'A raw handheld POV video of a solo woman reclining on white hotel bedsheets under warm dim lamplight. In an unpolished handheld camera tracking motion, she reaches her hand toward the camera with eyes half-closed and a seductive breathy smile. Include soft breathing foley, sheet rustle, and authentic mobile camera sensor grain.' },
  { category: 'solo-sultry', label: '🕯️ Raw Midnight Boudoir Caress', prompt: 'A raw third-person handheld mobile video of a solo woman arching her back gently on a plush velvet bed under deep red accent lighting. The camera pans down slowly from her face to her collarbone as she exhales passionately. Include heavy breathing foley, quiet rustle, and sultry lo-fi bass.' },
  { category: 'solo-sultry', label: '💦 Steamy Shower Glass Motion', prompt: 'A candid third-person video of a solo woman behind a steamy glass shower door backlit by soft warm tungsten light. Water droplets streak down the glass as she slides her hand down the misted surface, looking over her shoulder. Include water splash foley, steam hiss, and atmospheric synth beats.' },
  { category: 'solo-sultry', label: '🛋️ Raw Penthouse Leather Lounge', prompt: 'A raw handheld mobile camera tracking a solo woman lying back on a dark leather sofa in a high-rise penthouse at night. Ambient neon city lights rim her silhouette as she slowly shifts her hips with a lingering gaze. Include quiet solo sigh foley, leather rustle, and deep ambient lo-fi beats.' },
  { category: 'solo-sultry', label: '🔥 Raw Mirror Vanity Intimacy', prompt: 'A raw vertical handheld mobile video of a solo woman seated before a lit vanity mirror in a dim bedroom. She gazes intently into the mirror reflection while slowly running her fingers along her throat and collarbone with a seductive expression. Include soft breathing foley, glass perfume clink, and sultry ambient saxophone.' },
  { category: 'solo-sultry', label: '💃 Solo Velvet Chaise Lounge', prompt: 'A solo woman lounging on a plush velvet chaise under soft golden candlelight. In a slow tracking close-up, she runs her fingers through her hair while exhaling softly with eyes half-closed. Include whispered solo reflection voiceover, quiet breath foley, and sultry lo-fi piano score.' },
  { category: 'solo-sultry', label: '🔥 Solo Steamy Mirror Caress', prompt: 'A solo woman in a steamy, mist-covered bathroom after a hot shower under warm tungsten backlight. She slowly traces a pattern on the foggy mirror before turning to look back over her shoulder with a soft smile. Include whispered inner monologue, water droplet foley, and deep atmospheric lo-fi synth.' },
  { category: 'solo-sultry', label: '🌹 Solo Balcony Sunset Glow', prompt: 'A solo woman standing on a penthouse balcony overlooking a glowing city sunset. The gentle breeze moves softly around her as she arches her back slightly and gazes reflectively into the horizon. Include soft solo voiceover, breeze rustle foley, and slow sensual acoustic guitar.' },
  { category: 'solo-sultry', label: '🕯️ Solo Candlelit Vanity', prompt: 'A solo female model seated before a gilded vanity mirror surrounded by warm candle glow and tungsten bulbs. She applies perfume to her collarbone as the camera slowly dollies in tight. Include reflective solo narration, glass clink foley, and sultry saxophone.' },
  { category: 'solo-sultry', label: '🛁 Solo Candlelit Bath Spa', prompt: 'A solo woman relaxing in a steamy freestanding marble bathtub covered in floating rose petals under dim candle glow. Include whispered solo reflection, gentle water splash foley, and ambient piano.' },
  { category: 'solo-sultry', label: '🛋️ Solo Bedside Sunbeam', prompt: 'A solo woman waking up in white linen sheets as warm morning sunbeams stream through linen curtains, stretching luxuriously. Include soft breathing foley, sheet rustle, and warm lo-fi beats.' },

  // 👩‍❤️‍💋‍👨 Couple Sultry & Romance (Dual S1 + S2 - Wardrobe Agnostic)
  { category: 'couple-sultry', label: '🌙 Raw POV Candlelit Caress', prompt: 'A raw handheld POV video of an intimate couple on white bedsheets illuminated only by flickering candle glow. In a close 3/4 tracking shot, her hands clasp his shoulders as she tilts her head back with eyes closed in intense passion. Include soft passionate gasps, heavy breathing foley, and slow sensual acoustic guitar.' },
  { category: 'couple-sultry', label: '🔥 Raw Amateur Hotel Bedroom', prompt: 'An unpolished raw mobile video of an intimate couple embracing on a king-size hotel bed under warm bedside lamp lighting. The handheld camera micro-shakes naturally as she pulls him close in a passionate neck caress. Include whispered intimate dialogue, rustling linen foley, and low ambient piano.' },
  { category: 'couple-sultry', label: '🛁 Raw Intimate Bath Spa POV', prompt: 'A raw handheld POV video of a couple in a warm steamy marble bathtub surrounded by candle flames and rose petals. In a close handheld shot, water ripples as she leans back against his chest with eyes fluttering closed. Include gentle water splash foley, soft breathing, and ambient piano orchestra.' },
  { category: 'couple-sultry', label: '🚪 Raw Hotel Hallway Encounter', prompt: 'A raw handheld third-person video of a passionate couple pressed against a hotel room door under warm golden sconce lighting. He holds her waist as she arches her neck back in a sudden intense embrace. Include whispered dialogue cues, door foley, and moody low-key jazz beats.' },
  { category: 'couple-sultry', label: '🌅 Raw Sunrise Bedside Embrace', prompt: 'A raw third-person video of a couple tangled in white bedsheets as golden morning sunbeams stream through sheer curtains. In a slow pan across the bed, she rests her head on his chest while his fingers trace down her spine. Include soft morning exhales foley, sheet rustle, and gentle acoustic guitar.' },
  { category: 'couple-sultry', label: '💋 Couple Velvet Bedside', prompt: 'A sultry romantic couple relaxing on a plush velvet bed under soft golden candle glow. In a slow tracking close-up, his fingers gently trace down her shoulder as she exhales with eyes fluttering closed. Include whispered passionate dialogue, soft breathing foley, and sultry ambient piano score.' },
  { category: 'couple-sultry', label: '🔥 Couple Steamy Mirror', prompt: 'A sensual couple in a mist-covered bathroom after a hot shower under warm backlight. Her fingers trace patterns on the steamy mirror as he embraces her from behind, resting his chin on her shoulder. Include whispered romantic commentary, water droplet foley, and deep atmospheric lo-fi synth beats.' },
  { category: 'couple-sultry', label: '🌹 Couple Penthouse Sunset', prompt: 'A couple in a high-rise penthouse suite overlooking a glowing city sunset. She arches her back gently as he pulls her close in a lingering intimate embrace. Include whispered dialogue cues, soft breathing foley, and slow sensual acoustic guitar.' },
  { category: 'couple-sultry', label: '🛏️ Couple Bedroom Sunbeams', prompt: 'A romantic couple waking up in white linen sheets as warm morning sunbeams stream through linen curtains. Include whispered intimate dialogue, soft sheet rustle foley, and acoustic guitar score.' },
  { category: 'couple-sultry', label: '🛁 Couple Bath Spa Romance', prompt: 'A romantic couple relaxing in a steamy freestanding marble bathtub surrounded by glowing candles and rose petals. Include soft whispered dialogue, gentle water splash foley, and ambient piano music.' },
  { category: 'couple-sultry', label: '🏡 Couple Morning Coffee', prompt: 'A couple laughing together in a sun-drenched modern kitchen while making morning coffee. Include playful dialogue, clinking coffee cups foley, and warm lo-fi lounge beats.' },
  { category: 'couple-sultry', label: '🌊 Couple Sunset Beach Walk', prompt: 'A couple strolling hand-in-hand along the shoreline during a vibrant golden-hour sunset as ocean waves lap their bare feet. Include romantic whispered voiceover, ocean waves foley, and ambient piano orchestra.' },

  // 👤 Solo General & Action (Wardrobe Agnostic)
  { category: 'solo', label: '🌅 Solo Golden Hour Shoreline', prompt: 'A solo woman walking gracefully along wet sand during a vibrant golden-hour ocean sunset as the sea breeze moves softly around her. Include soft reflective monologue narration, gentle ocean waves, and acoustic guitar score.' },
  { category: 'solo', label: '☕ Solo Cozy Rain Window', prompt: 'A solo woman wrapped in an oversized knit sweater sitting on a window seat sipping tea while watching raindrops stream down glass. Include cozy solo voiceover, rain drumming foley, and acoustic guitar music.' },
  { category: 'solo', label: '👗 Fashion Runway Spotlights', prompt: 'A haute couture supermodel walking an obsidian mirror runway surrounded by spotlights. Include camera shutter clicks foley, director voiceover cues, and deep house electronic music.' },
  { category: 'solo', label: '🍷 Solo Penthouse Fireside', prompt: 'A solo protagonist swirling a glass of red wine in a cozy penthouse lounge by a roaring stone fireplace. Include quiet reflective monologue, crackling fire foley, and smooth ambient jazz piano.' },
  { category: 'solo', label: '🗡️ Cyborg Katana Rain', prompt: 'A female cyborg warrior drawing a glowing plasma katana in a rain-soaked neon Neo-Tokyo alleyway. Include spoken battle dialogue, sizzle rain foley, and heavy dark synthwave music.' },

  // ⚔️ Action & Sci-Fi
  { category: 'action', label: '🏎️ Cyberpunk Tunnel Drift', prompt: 'A matte-black hypercar drifting through a neon highway tunnel with light trails. Include a roaring V12 engine turbo blowoff foley, futuristic radio chatter, and driving synthwave music.' },
  { category: 'action', label: '⚡ Superhero Rooftop Vigil', prompt: 'An armored heroine standing on a skyscraper ledge overseeing a stormy metropolis as lightning strikes. Include heroic voiceover, thunder rumble foley, and swelling cinematic brass score.' },
  { category: 'action', label: '🐉 Dragon Siege & Battle Cry', prompt: 'A warrior riding an armored crimson dragon soaring through stormy clouds above a mountain fortress. Include dragon roar and wind howl foley, warrior shout, and epic orchestral drums.' },
  { category: 'action', label: '💼 Penthouse Espionage', prompt: 'A sleek operative hacking a glass server terminal inside a high-rise Tokyo penthouse. Include tense whispered dialogue, keypress clicks foley, and suspenseful pulse synth score.' },
  { category: 'action', label: '🤖 Mecha Power-Up & System Voice', prompt: 'A 50-foot military mecha powering up its shoulder cannons as alarm strobes illuminate a hangar bay. Include robotic AI voice, heavy hydraulic servo foley, and industrial metal beat.' },
  { category: 'action', label: '🥋 Bamboo Forest Sword Duel', prompt: 'Two martial arts masters facing off in a mist-covered bamboo forest at twilight as cherry blossom petals swirl. Include a sharp battle kiai shout, katana steel clashing foley, and traditional koto flute music.' },
  { category: 'action', label: '🧪 Cyber Lab Awakening', prompt: 'A bio-android opening glowing blue eyes inside a glass fluid chamber as wires disconnect. Include synthetic female voice, glass hiss foley, and pulsing ambient electronic beat.' },

  // 🌿 Nature & Cinema
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

import { TimelineEngine } from '../../engine/TimelineEngine';

export const AIDirectorPanel: React.FC = () => {
  const {
    project,
    setProject,
    updateSettings,
    setShotsCount,
    addShot,
    updateShot,
    removeShot,
    autoFixProject,
    directorModel,
    setDirectorModel,
    directorThinkingBudget,
    setDirectorThinkingBudget,
    directorMode,
    setDirectorMode,
    systemPromptPreset,
    setSystemPromptPreset,
    directorProfile,
    setDirectorProfile,
  } = useStudioStore();

  const [idea, setIdea] = useState(() => localStorage.getItem('minimax_h3_prompt_idea') || '');
  const [narrativeStyle, setNarrativeStyle] = useState<NarrativeStyle>(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('minimax_narrative_style') : null;
    return (stored as NarrativeStyle) || (project.settings.style as NarrativeStyle) || 'Live-Action Realism';
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [progressState, setProgressState] = useState<{ step: number; totalSteps: number; percent: number; message: string } | null>(null);
  const [showAllSeeds, setShowAllSeeds] = useState(false);
  const [showTechnicalOverrides, setShowTechnicalOverrides] = useState(false);
  const [seedCategoryFilter, setSeedCategoryFilter] = useState<'all' | 'solo-sultry' | 'couple-sultry' | 'solo' | 'action' | 'cinematic'>('all');
  const [narrativeCategoryFilter, setNarrativeCategoryFilter] = useState<'all' | 'raw' | 'sultry' | 'cinema' | 'action' | 'artistic'>('all');

  const activeShots = project.shots;
  const currentShotCount = activeShots.length;
  const totalDuration = project.settings.durationSeconds;
  const isImageMode = project.settings.mode !== 'T2VA';
  const hasReferences = project.references && project.references.length > 0;

  const handleSelectNarrativeStyle = (style: NarrativeStyle) => {
    setNarrativeStyle(style);
    if (typeof window !== 'undefined') {
      localStorage.setItem('minimax_narrative_style', style);
    }
    updateSettings({ style });
  };

  const compiledGeminiPrompt = useMemo(() => {
    return GeminiProvider.buildDirectorSystemPrompt({
      idea: idea || project.description || 'Cyberpunk action standoff scene',
      images: project.references ? project.references.map((r) => r.url) : [],
      mode: project.settings.mode,
      referenceMode: project.settings.referenceMode || 'strict',
      durationSeconds: totalDuration,
      shotsCount: currentShotCount,
      narrativeStyle,
      directorModel,
      thinkingBudget: directorThinkingBudget,
      directorMode,
      systemPromptPreset,
      subjectComposition: project.settings.subjectComposition || 'solo',
    }, project.settings.style);
  }, [project, narrativeStyle, idea, currentShotCount, totalDuration, directorModel, directorThinkingBudget, directorMode, systemPromptPreset]);

  const handleSelectSeed = (seed: { label: string; prompt: string; category?: string }) => {
    setIdea(seed.prompt);
    localStorage.setItem('minimax_h3_prompt_idea', seed.prompt);
    if (seed.category === 'solo-sultry' || seed.category === 'solo' || seed.prompt.toLowerCase().includes('solo ')) {
      updateSettings({ subjectComposition: 'solo' });
    } else if (seed.category === 'couple-sultry' || seed.prompt.toLowerCase().includes('couple') || seed.prompt.toLowerCase().includes('two ')) {
      updateSettings({ subjectComposition: 'couple' });
    }
  };

  const formattedModelName =
    directorModel === 'gemini-3.5-flash'
      ? 'Gemini 3.5 Flash'
      : directorModel === 'gemini-2.5-flash'
      ? 'Gemini 2.5 Flash'
      : 'Gemini 2.5 Pro';

  const handleAutoBuild = async () => {
    setIsGenerating(true);
    setProgressState({ step: 1, totalSteps: 4, percent: 10, message: `Initializing ${formattedModelName}...` });
    const provider = AIEngine.getActiveProvider();
    const apiKey = (localStorage.getItem('minimax_gemini_api_key') || import.meta.env.VITE_GEMINI_API_KEY || '').trim();
    const imageUrls = project.references ? project.references.map((r) => r.url) : [];

    try {
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
          systemPromptPreset,
          onProgress: (prog) => setProgressState(prog),
        },
        apiKey
      );

      if (result.shots && result.shots.length > 0) {
        const derivedTitle = result.name || (idea ? (idea.length > 45 ? `${idea.substring(0, 45)}...` : idea) : `${narrativeStyle} Scene`);
        const updatedProj = {
          ...project,
          name: derivedTitle,
          description: idea || project.description,
          shots: result.shots as any,
          audio: result.audio ? { ...project.audio, ...result.audio } : project.audio,
        };
        setProject(updatedProj);

        // Auto-save generated storyboard prompt to Prompt Library
        useStudioStore.getState().savePromptToLibrary({
          title: derivedTitle,
          idea: idea || project.description || `${narrativeStyle} Scene`,
          narrativeStyle,
          mode: project.settings.mode,
          shotsCount: currentShotCount,
          durationSeconds: totalDuration,
        });
      }
    } catch (err) {
      console.error('[Gemini Director] Auto build error', err);
    } finally {
      setIsGenerating(false);
      setProgressState(null);
    }
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-6">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
        <div>
          <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            AI Director Workstation
          </h2>
          <p className="text-xs text-zinc-400">
            Automated visual storyboarding & prompt compiler for MiniMax H3.
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

      {/* Aesthetic Visual Style, Duration & Aspect Ratio Bar (Positioned directly below Reference Images) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-zinc-950/60 p-4 rounded-xl border border-zinc-800">
        <div>
          <label className="text-xs text-zinc-400 font-medium mb-1 block">Aesthetic Visual Style</label>
          <select
            value={project.settings.style}
            onChange={(e) => updateSettings({ style: e.target.value as VisualStyle })}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-cyan-500/50"
          >
            {ALL_VISUAL_STYLES.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs text-zinc-400 font-medium mb-1 block">Effective Video Duration (Seconds)</label>
          <input
            type="number"
            value={project.settings.durationSeconds}
            onChange={(e) => updateSettings({ durationSeconds: parseFloat(e.target.value) || 6 })}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-cyan-500/50"
          />
        </div>

        <div>
          <label className="text-xs text-zinc-400 font-medium mb-1 block">Aspect Ratio</label>
          <select
            value={project.settings.aspectRatio}
            onChange={(e) => updateSettings({ aspectRatio: e.target.value as AspectRatio })}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-cyan-500/50"
          >
            {['16:9', '9:16', '1:1', '2.39:1', '4:3'].map((ar) => (
              <option key={ar} value={ar}>
                {ar}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Inputs & Presets */}
      <div className="space-y-4">
        {/* Dynamic Per-Shot Duration & Shot Count Setup Controls */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800/80 pb-2">
            <div>
              <label className="text-xs text-zinc-200 font-bold block flex items-center gap-1.5">
                <Video className="w-3.5 h-3.5 text-cyan-400" />
                <span>Storyboard Shot Setup ({currentShotCount} Shot{currentShotCount > 1 ? 's' : ''} • Total {totalDuration}s)</span>
              </label>
              <p className="text-[11px] text-zinc-400">
                Select target shot count or customize individual shot durations below.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {/* Preset Shot Count Selector */}
              <div className="flex items-center gap-1.5 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-1 text-xs">
                <span className="text-[11px] text-zinc-400 font-semibold">Total Shots:</span>
                <select
                  value={currentShotCount}
                  onChange={(e) => setShotsCount(parseInt(e.target.value, 10))}
                  className="bg-transparent text-cyan-300 font-bold focus:outline-none cursor-pointer text-xs font-mono"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                    <option key={num} value={num} className="bg-zinc-950 text-zinc-100">
                      {num} {num === 1 ? 'Shot' : 'Shots'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Equalize Durations Action Button */}
              <button
                type="button"
                onClick={() => {
                  const divided = TimelineEngine.divideShotsEvenly(project.shots, project.settings.durationSeconds);
                  setProject({ ...project, shots: divided });
                }}
                className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-[11px] font-semibold rounded-xl border border-zinc-700 transition-all flex items-center gap-1"
                title="Divide total duration evenly across all shots"
              >
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span>⚡ Equalize</span>
              </button>
            </div>
          </div>

          {/* Per-Shot Duration Chips */}
          <div className="flex flex-wrap gap-2">
            {activeShots.map((shot, idx) => (
              <div
                key={shot.id}
                className="bg-zinc-950 border border-cyan-500/40 text-cyan-300 rounded-xl px-3 py-1.5 text-xs font-bold flex items-center gap-2 shadow-xs"
              >
                <span className="text-zinc-200">Shot {idx + 1}:</span>

                {/* Per-Shot Duration Select */}
                <select
                  value={shot.durationSeconds}
                  onChange={(e) => updateShot(idx, { durationSeconds: parseFloat(e.target.value) || 2 })}
                  className="bg-cyan-950/80 text-cyan-300 font-mono font-bold px-1.5 py-0.5 rounded border border-cyan-500/40 text-xs focus:outline-none cursor-pointer"
                >
                  {[0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 6].map((sec) => (
                    <option key={sec} value={sec} className="bg-zinc-950 text-zinc-100">
                      {sec.toFixed(1)}s
                    </option>
                  ))}
                </select>

                {currentShotCount > 1 && (
                  <button
                    type="button"
                    onClick={() => removeShot(idx)}
                    title="Remove Shot"
                    className="text-zinc-500 hover:text-red-400 transition-colors p-0.5 rounded ml-0.5"
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
                className="bg-zinc-950 hover:bg-zinc-800 border border-dashed border-zinc-700 hover:border-cyan-500/50 text-zinc-300 hover:text-cyan-300 rounded-xl px-3.5 py-1.5 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
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

        {/* Narrative Style Selector (Categorized Presets) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs text-zinc-300 font-bold block">Narrative & Motion Style Presets ({NARRATIVE_STYLES.length} Presets)</label>
            <span className="text-[10px] text-cyan-400 font-mono">Select "Live-Action Realism" for 100% natural human motion & real-world physics</span>
          </div>

          {/* Narrative Category Tabs */}
          <div className="flex flex-wrap gap-1.5 mb-2.5">
            {[
              { id: 'all', label: `✨ All (${NARRATIVE_PRESETS.length})` },
              { id: 'raw', label: '📱 Raw & Amateur' },
              { id: 'sultry', label: '💋 Sultry & Romance' },
              { id: 'cinema', label: '🎬 Cinema & Drama' },
              { id: 'action', label: '⚔️ Action & Sci-Fi' },
              { id: 'artistic', label: '🎨 Anime & Art' },
            ].map((cat) => {
              const isActive = narrativeCategoryFilter === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setNarrativeCategoryFilter(cat.id as any)}
                  className={`px-2.5 py-1 text-[11px] font-medium rounded-lg transition-all ${
                    isActive
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-xs'
                      : 'bg-zinc-950 text-zinc-400 border border-zinc-800 hover:text-zinc-200'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
            {(
              narrativeCategoryFilter === 'all'
                ? NARRATIVE_PRESETS
                : [
                    { id: 'None' as NarrativeStyle, category: narrativeCategoryFilter },
                    ...NARRATIVE_PRESETS.filter((p) => p.id !== 'None' && p.category === narrativeCategoryFilter),
                  ]
            ).map((preset) => {
              const isSelected = narrativeStyle === preset.id;
              const displayLabel = preset.id === 'None' ? '🚫 None (Unstyled)' : preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleSelectNarrativeStyle(preset.id)}
                  className={`px-3 py-1.5 text-xs rounded-xl font-semibold transition-all ${
                    isSelected
                      ? 'bg-cyan-500 text-zinc-950 shadow-lg shadow-cyan-500/20 font-bold'
                      : preset.id === 'None'
                      ? 'bg-zinc-900 text-rose-300 border border-rose-500/30 hover:bg-zinc-800'
                      : 'bg-zinc-950 text-zinc-400 border border-zinc-800 hover:text-zinc-200'
                  }`}
                >
                  {displayLabel}
                </button>
              );
            })}
          </div>

          {/* Live Narrative Style Prompt Directive Preview Box */}
          {NARRATIVE_STYLE_PREVIEWS[narrativeStyle] && (
            <div className="mt-2.5 p-3 bg-zinc-950/80 border border-cyan-500/30 rounded-xl text-xs space-y-1 animate-fade-in shadow-sm">
              <div className="flex items-center justify-between text-cyan-400 font-bold font-mono text-[11px] uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  Active Style Directive: {narrativeStyle}
                </span>
                <span className="text-[10px] text-zinc-500 font-sans font-normal">AI Physics & Camera Injection Preview</span>
              </div>
              <p className="text-zinc-300 font-mono leading-relaxed text-[11px]">
                "{NARRATIVE_STYLE_PREVIEWS[narrativeStyle]}"
              </p>
            </div>
          )}
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
              { id: 'solo-sultry', label: '💃 Solo Sultry & Boudoir' },
              { id: 'couple-sultry', label: '👩‍❤️‍💋‍👨 Couple Sultry & Romance' },
              { id: 'solo', label: '👤 Solo General' },
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
          <div className="flex items-center justify-between">
            <label className="text-xs text-zinc-400 font-medium block">
              Creative Vision Story Hints & Prompt Idea
            </label>
            {idea.trim() && (
              <button
                type="button"
                onClick={() => {
                  setIdea('');
                  localStorage.removeItem('minimax_h3_prompt_idea');
                }}
                className="text-[11px] text-red-400 hover:text-red-300 font-semibold px-2.5 py-0.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 transition-all flex items-center gap-1 cursor-pointer shadow-xs"
                title="Clear Prompt Idea"
              >
                <Trash2 className="w-3 h-3 text-red-400" />
                <span>Clear Prompt</span>
              </button>
            )}
          </div>
          <textarea
            rows={3}
            value={idea}
            onChange={(e) => {
              const val = e.target.value;
              setIdea(val);
              localStorage.setItem('minimax_h3_prompt_idea', val);
            }}
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

      {/* Advanced AI Director Intelligence Profiles & Technical Overrides */}
      <div className="space-y-4 pt-4 border-t border-zinc-800/80 bg-zinc-950/60 p-4 rounded-2xl border border-zinc-800">
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider">AI Director Intelligence Profile</h3>
          </div>
          
          <button
            type="button"
            onClick={() => setShowTechnicalOverrides(!showTechnicalOverrides)}
            className="text-[11px] text-zinc-400 hover:text-cyan-300 flex items-center gap-1 font-mono hover:underline cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5 text-cyan-400" />
            <span>{showTechnicalOverrides ? 'Hide Technical Overrides' : '⚙️ Custom Technical Overrides'}</span>
          </button>
        </div>

        {/* 3 Unified Director Profiles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Profile 1: Cinematic Director */}
          <button
            type="button"
            onClick={() => setDirectorProfile('cinematic')}
            className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
              directorProfile === 'cinematic'
                ? 'bg-cyan-950/60 border-cyan-500 text-cyan-200 shadow-md shadow-cyan-500/10'
                : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
            }`}
          >
            <div className="font-bold text-xs flex items-center justify-between mb-1">
              <span className="flex items-center gap-1.5 text-cyan-300">🎬 Cinematic Director</span>
              {directorProfile === 'cinematic' && <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded font-mono font-bold">ACTIVE</span>}
            </div>
            <p className="text-[11px] text-zinc-400 leading-normal">
              Gemini 3.5 Flash with 35mm optical lens physics, cinematic framing, depth of field, and lighting falloff.
            </p>
          </button>

          {/* Profile 2: Uncensored Real Motion */}
          <button
            type="button"
            onClick={() => setDirectorProfile('uncensored')}
            className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
              directorProfile === 'uncensored'
                ? 'bg-rose-950/70 border-rose-500 text-rose-200 shadow-md shadow-rose-500/20'
                : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
            }`}
          >
            <div className="font-bold text-xs flex items-center justify-between mb-1">
              <span className="flex items-center gap-1.5 text-rose-300">🔥 Uncensored Real Motion</span>
              {directorProfile === 'uncensored' && <span className="text-[10px] bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded font-mono font-bold">ACTIVE</span>}
            </div>
            <p className="text-[11px] text-zinc-400 leading-normal">
              Gemini 3.5 Flash with simple natural English. Focuses on continuous physical human motion without camera jargon.
            </p>
          </button>

          {/* Profile 3: Deep Reasoning Director */}
          <button
            type="button"
            onClick={() => setDirectorProfile('reasoning')}
            className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
              directorProfile === 'reasoning'
                ? 'bg-purple-950/60 border-purple-500 text-purple-200 shadow-md shadow-purple-500/20'
                : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
            }`}
          >
            <div className="font-bold text-xs flex items-center justify-between mb-1">
              <span className="flex items-center gap-1.5 text-purple-300">🧠 Deep Reasoning</span>
              {directorProfile === 'reasoning' && <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded font-mono font-bold">ACTIVE</span>}
            </div>
            <p className="text-[11px] text-zinc-400 leading-normal">
              Gemini 2.5 Pro with 4K thinking budget. Maximum logical consistency across complex multi-character plots.
            </p>
          </button>
        </div>

        {/* Optional Technical Overrides Drawer */}
        {showTechnicalOverrides && (
          <div className="pt-3 border-t border-zinc-800 space-y-3 bg-zinc-950/80 p-3.5 rounded-xl border border-amber-500/30 animate-fade-in">
            <div className="text-[10px] text-amber-400 font-mono flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 shrink-0 text-amber-400" />
              <span>Custom Overrides Active (Modifying raw parameters sets profile status to 'Custom')</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Raw Model String</label>
                <select
                  value={directorModel}
                  onChange={(e) => setDirectorModel(e.target.value as any)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="gemini-3.5-flash">Gemini 3.5 Flash (Ultra Fast)</option>
                  <option value="gemini-2.5-pro">Gemini 2.5 Pro (Deep Reasoning)</option>
                  <option value="gemini-2.5-flash">Gemini 2.5 Flash (Legacy)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Thinking Token Budget</label>
                <select
                  value={directorThinkingBudget}
                  onChange={(e) => setDirectorThinkingBudget(Number(e.target.value))}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value={0}>0 Tokens (Fast Direct Output)</option>
                  <option value={1024}>1,024 Tokens (Balanced Reasoning)</option>
                  <option value={4096}>4,096 Tokens (Deep Cinematic)</option>
                  <option value={8192}>8,192 Tokens (Maximum Capacity)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Rewriting Mode (Temp)</label>
                <select
                  value={directorMode}
                  onChange={(e) => setDirectorMode(e.target.value as any)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="strict">Strict / Faithful (Temp 0.2)</option>
                  <option value="balanced">Balanced / Director (Temp 0.5)</option>
                  <option value="creative">Creative / Imaginative (Temp 0.8)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">System Architecture</label>
                <select
                  value={systemPromptPreset}
                  onChange={(e) => setSystemPromptPreset(e.target.value as any)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="standard">🎬 Standard Cinematic</option>
                  <option value="uncensored_nsfw">🔥 Uncensored Real Motion</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Live Gemini Director System Prompt Delivery Preview Box */}
        <div className="space-y-1.5 pt-2 border-t border-zinc-800/80">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
              <Brain className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              Final Gemini System Prompt Delivery Preview
            </label>
            <span className="text-[10px] text-zinc-500 font-mono">Payload sent to {directorModel}</span>
          </div>

          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3.5 font-mono text-[11px] text-zinc-100 dark:text-cyan-300 leading-relaxed max-h-48 overflow-y-auto shadow-inner select-all">
            <pre className="whitespace-pre-wrap font-mono text-cyan-400 font-semibold">{compiledGeminiPrompt}</pre>
          </div>
        </div>

        {/* Live Real-Time Gemini Progress Status Tracker */}
        {isGenerating && progressState && (
          <div className="bg-cyan-950/80 border border-cyan-500/50 rounded-xl p-3.5 space-y-2 shadow-lg shadow-cyan-500/10">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-cyan-300 flex items-center gap-2 font-mono">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400 shrink-0" />
                <span>Step {progressState.step}/{progressState.totalSteps}: {progressState.message}</span>
              </span>
              <span className="text-[11px] text-cyan-400 font-mono font-bold bg-cyan-900/60 px-2 py-0.5 rounded-md border border-cyan-500/30">
                {progressState.percent}%
              </span>
            </div>

            {/* Live Progress Bar Track */}
            <div className="w-full bg-zinc-900 rounded-full h-2 overflow-hidden border border-zinc-800 p-0.5">
              <div
                className="bg-gradient-to-r from-cyan-500 via-blue-500 to-emerald-400 h-full rounded-full transition-all duration-300 shadow-sm shadow-cyan-400/50"
                style={{ width: `${progressState.percent}%` }}
              />
            </div>
          </div>
        )}

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
                ? `Gemini Director (${formattedModelName}) Generating...`
                : hasReferences
                ? `✨ Build ${currentShotCount}-Shot Storyboard Using Visual Keyframes (${project.references.length})`
                : `✨ Build ${currentShotCount}-Shot Storyboard with ${formattedModelName}`}
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
