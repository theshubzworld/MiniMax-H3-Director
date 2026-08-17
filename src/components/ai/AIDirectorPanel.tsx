import React, { useState, useMemo } from 'react';
import { useStudioStore } from '../../store/StudioStore';
import { AIEngine } from '../../ai/AIEngine';
import { GeminiProvider, NARRATIVE_STYLE_DIRECTIVES } from '../../ai/providers/GeminiProvider';
import { NarrativeStyle } from '../../ai/interfaces/AIProvider';
import { ReferenceImageDropzone } from '../reference/ReferenceImageDropzone';
import { Sparkles, Video, Loader2, Plus, X, RotateCcw, Lightbulb, Image as ImageIcon, Cpu, Brain, Sliders, Gauge, Zap, Clock, ChevronDown, ChevronUp, Layers, Film, User, Users, Heart } from 'lucide-react';
import { ALL_VISUAL_STYLES, VisualStyle, AspectRatio } from '../../types/project';
import { TimelineEngine } from '../../engine/TimelineEngine';

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

const TOP_FEATURED_STYLES: VisualStyle[] = [
  'Live-Action Realism',
  'Raw Smartphone Amateur',
  'Cinematic Film',
  'Sultry Romance',
  'Dark Fantasy',
  'Anime',
];

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
];

export const AIDirectorPanel: React.FC = () => {
  const {
    project,
    setProject,
    updateSettings,
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

  const [idea, setIdea] = useState<string>(() => {
    return localStorage.getItem('minimax_h3_prompt_idea') || '';
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [progressState, setProgressState] = useState<{ step: number; totalSteps: number; percent: number; message: string } | null>(null);
  const [showTechnicalOverrides, setShowTechnicalOverrides] = useState(false);
  const [showAllStyles, setShowAllStyles] = useState(false);
  const [showAllSeeds, setShowAllSeeds] = useState(false);

  const [narrativeCategoryFilter, setNarrativeCategoryFilter] = useState<'all' | 'raw' | 'sultry' | 'cinema' | 'action' | 'artistic'>('all');
  const [seedCategoryFilter, setSeedCategoryFilter] = useState<'all' | 'solo-sultry' | 'couple-sultry' | 'solo' | 'action'>('all');

  const narrativeStyle: NarrativeStyle = (project.settings.style as NarrativeStyle) || 'Live-Action Realism';

  const handleSelectNarrativeStyle = (newStyle: NarrativeStyle) => {
    updateSettings({ style: newStyle as VisualStyle });
    localStorage.setItem('minimax_narrative_style', newStyle);
  };

  const isImageMode = project.settings.mode === 'I2VA' || project.settings.mode === 'FL2VA' || project.settings.mode === 'L2VA';
  const hasReferences = project.references && project.references.length > 0;
  const totalDuration = project.settings.durationSeconds || 6;
  const activeShots = project.shots || [];
  const currentShotCount = activeShots.length || 1;

  const setShotsCount = (targetCount: number) => {
    const safeCount = Math.max(1, Math.min(9, targetCount));
    let newShots = [...activeShots];

    if (safeCount > newShots.length) {
      const added = safeCount - newShots.length;
      for (let i = 0; i < added; i++) {
        const nextNum = newShots.length + 1;
        newShots.push({
          id: `shot-${Date.now()}-${nextNum}`,
          shotNumber: nextNum,
          startTimeSeconds: 0,
          durationSeconds: 2,
          camera: {
            motionType: 'Push In',
            amplitude: 'small amplitude',
            speed: 'slow speed',
            targetSubject: 'the main subject',
          },
          character: {
            speakerId: 'S1',
            identity: 'The main protagonist',
          },
          environment: {
            location: 'cinematic setting',
            lighting: 'dramatic lighting',
          },
          rawActionDescription: `Shot ${nextNum} performs dramatic action fitting the narrative.`,
        });
      }
    } else if (safeCount < newShots.length) {
      newShots = newShots.slice(0, safeCount);
    }
    const reTimed = TimelineEngine.divideShotsEvenly(newShots, totalDuration);
    setProject({ ...project, shots: reTimed });
  };

  const updateShot = (index: number, partialShot: Partial<any>) => {
    const updated = [...activeShots];
    updated[index] = { ...updated[index], ...partialShot };
    const reTimed = TimelineEngine.recalculateShotTimings(updated);
    setProject({ ...project, shots: reTimed });
  };

  const addShot = () => {
    if (currentShotCount < 9) {
      setShotsCount(currentShotCount + 1);
    }
  };

  const removeShotByIndex = (index: number) => {
    if (activeShots.length <= 1) return;
    const filtered = activeShots.filter((_, i) => i !== index);
    const reTimed = TimelineEngine.divideShotsEvenly(filtered, totalDuration);
    setProject({ ...project, shots: reTimed });
  };

  const handleSelectSeed = (seed: { label: string; prompt: string; category?: string }) => {
    setIdea(seed.prompt);
    localStorage.setItem('minimax_h3_prompt_idea', seed.prompt);
    if (seed.category === 'solo-sultry' || seed.category === 'solo') {
      updateSettings({ subjectComposition: 'solo' });
    } else if (seed.category === 'couple-sultry') {
      updateSettings({ subjectComposition: 'couple' });
    }
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

  const getShotDurationOptions = (currentSeconds: number) => {
    const standard = [0.5, 0.8, 1.0, 1.2, 1.5, 1.8, 2.0, 2.2, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0, 6.0];
    const roundedCurrent = Number((currentSeconds || 2).toFixed(1));
    return Array.from(new Set([...standard, roundedCurrent])).sort((a, b) => a - b);
  };

  const handleDurationChange = (val: number) => {
    const safeTotal = Math.max(1, Math.min(15, val));
    const divided = TimelineEngine.divideShotsEvenly(project.shots, safeTotal);
    setProject({
      ...project,
      settings: { ...project.settings, durationSeconds: safeTotal },
      shots: divided,
    });
  };

  return (
    <div className="space-y-5">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-5 shadow-sm">
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
          <div className="flex items-center gap-2">
            <Film className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-bold text-zinc-100 uppercase tracking-wider">
              1. Scene & Timeline Setup
            </h3>
          </div>
          <span className="text-xs bg-cyan-950 border border-cyan-500/40 text-cyan-300 px-3 py-0.5 rounded-full font-mono font-bold">
            {currentShotCount} {currentShotCount === 1 ? 'Shot' : 'Shots'} ({(totalDuration / currentShotCount).toFixed(1)}s / shot)
          </span>
        </div>

        {isImageMode && (
          <div className="bg-zinc-950/70 border border-cyan-500/30 rounded-xl p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
                Keyframe Anchor Dropzone ({project.settings.mode})
              </span>
              <span className="text-[11px] text-zinc-400">
                Upload Picture 1 (0.00s) {project.settings.mode === 'FL2VA' ? '& Picture 2 (ending)' : ''}
              </span>
            </div>
            <ReferenceImageDropzone />
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 bg-zinc-950/60 p-3.5 rounded-xl border border-zinc-800/80">
          <div>
            <label className="text-[11px] text-zinc-400 font-semibold mb-1 block">Effective Video Duration</label>
            <div className="flex items-center bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-1.5">
              <input
                type="number"
                min={1}
                max={15}
                value={project.settings.durationSeconds}
                onChange={(e) => handleDurationChange(parseFloat(e.target.value) || 6)}
                className="w-full bg-transparent text-xs text-zinc-100 font-mono font-bold focus:outline-none"
              />
              <span className="text-xs text-zinc-500 font-mono">sec</span>
            </div>
          </div>

          <div>
            <label className="text-[11px] text-zinc-400 font-semibold mb-1 block">Aspect Ratio</label>
            <select
              value={project.settings.aspectRatio}
              onChange={(e) => updateSettings({ aspectRatio: e.target.value as AspectRatio })}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-cyan-500/50 cursor-pointer font-medium"
            >
              {['16:9', '9:16', '1:1', '2.39:1', '4:3'].map((ar) => (
                <option key={ar} value={ar}>
                  {ar}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] text-zinc-400 font-semibold block">Shot Count & Equalizer</label>
              <button
                type="button"
                onClick={() => {
                  const divided = TimelineEngine.divideShotsEvenly(project.shots, project.settings.durationSeconds);
                  setProject({ ...project, shots: divided });
                }}
                className="text-[10px] text-cyan-400 hover:text-cyan-300 font-mono font-bold transition-all flex items-center gap-1 cursor-pointer"
                title="Divide total duration evenly across all shots"
              >
                <Clock className="w-3 h-3 text-cyan-400" />
                <span>⚡ Equalize</span>
              </button>
            </div>
            <select
              value={currentShotCount}
              onChange={(e) => setShotsCount(parseInt(e.target.value, 10))}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-cyan-300 font-mono font-bold focus:outline-none focus:border-cyan-500/50 cursor-pointer"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <option key={num} value={num}>
                  {num} {num === 1 ? 'Shot' : 'Shots'} ({totalDuration}s Total)
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-zinc-400 font-medium">Individual Shot Durations:</span>
            {currentShotCount < 9 && (
              <button
                type="button"
                onClick={() => addShot()}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Shot ({currentShotCount + 1})</span>
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {activeShots.map((shot, idx) => {
              const options = getShotDurationOptions(shot.durationSeconds);
              const currentVal = Number((shot.durationSeconds || 2).toFixed(1));
              return (
                <div
                  key={shot.id}
                  className="bg-zinc-950 border border-zinc-800 hover:border-cyan-500/40 rounded-xl px-3 py-1.5 text-xs font-semibold flex items-center gap-2 shadow-xs transition-all group"
                >
                  <span className="text-zinc-300 font-bold">Shot {idx + 1}</span>
                  <select
                    value={currentVal}
                    onChange={(e) => updateShot(idx, { durationSeconds: parseFloat(e.target.value) || 2 })}
                    className="bg-zinc-900 text-cyan-300 font-mono font-bold px-2 py-0.5 rounded-lg border border-zinc-700 text-xs focus:outline-none cursor-pointer"
                  >
                    {options.map((sec) => (
                      <option key={sec} value={sec} className="bg-zinc-950 text-zinc-100">
                        {sec.toFixed(1)}s
                      </option>
                    ))}
                  </select>
                  {activeShots.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeShotByIndex(idx)}
                      className="p-0.5 text-zinc-400 hover:text-red-400 hover:bg-zinc-800 rounded transition-all cursor-pointer"
                      title={`Delete Shot ${idx + 1}`}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* SECTION 2: Creative Vision & Directorial Settings Card */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-5 shadow-sm">
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-bold text-zinc-100 uppercase tracking-wider">
              2. Story Idea & Aesthetic Direction
            </h3>
          </div>

          {/* Reset Prompt Button (Clean & Modern) */}
          {idea.trim() && (
            <button
              type="button"
              onClick={() => {
                setIdea('');
                localStorage.removeItem('minimax_h3_prompt_idea');
              }}
              className="text-[11px] text-zinc-400 hover:text-zinc-100 font-semibold px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Reset prompt idea"
            >
              <RotateCcw className="w-3 h-3 text-zinc-400" />
              <span>Reset Prompt</span>
            </button>
          )}
        </div>

        {/* Prompt Idea Textarea */}
        <div className="space-y-2">
          <textarea
            rows={3}
            value={idea}
            onChange={(e) => {
              const val = e.target.value;
              setIdea(val);
              localStorage.setItem('minimax_h3_prompt_idea', val);
            }}
            placeholder="Type your story vision, character actions, emotional beats, or camera movement ideas here..."
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3.5 text-xs text-zinc-100 focus:outline-none focus:border-cyan-500/50 font-mono leading-relaxed placeholder:text-zinc-600 shadow-inner"
          />

          {/* Smart Contradiction Warning Alert */}
          {(() => {
            const isSoloSelected = (project.settings.subjectComposition || 'solo') === 'solo';
            const hasCoupleKeywords = /\b(couple|lovers|husband|wife|together|embrace her|his fingers|two friends|dual|pair)\b/i.test(idea);
            const isContradiction = isSoloSelected && hasCoupleKeywords;

            if (isContradiction) {
              return (
                <div className="p-2.5 bg-amber-500/15 border border-amber-500/40 rounded-xl flex items-center justify-between gap-3 text-xs text-amber-300 shadow-sm animate-fade-in">
                  <div className="flex items-center gap-2">
                    <span className="text-base">⚠️</span>
                    <span>Prompt describes a couple, but <strong>Solo Character</strong> is selected.</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => updateSettings({ subjectComposition: 'couple' })}
                    className="px-2.5 py-0.5 bg-amber-500 text-zinc-950 font-bold rounded-lg hover:bg-amber-400 transition-all text-xs shrink-0 cursor-pointer shadow-xs"
                  >
                    Switch to Couple
                  </button>
                </div>
              );
            }

            const isCoupleSelected = project.settings.subjectComposition === 'couple';
            const hasSoloKeywords = /\b(solo woman|solo female|solo male|solo protagonist|lone traveler|single person)\b/i.test(idea);
            if (isCoupleSelected && hasSoloKeywords) {
              return (
                <div className="p-2.5 bg-cyan-500/15 border border-cyan-500/40 rounded-xl flex items-center justify-between gap-3 text-xs text-cyan-300 shadow-sm animate-fade-in">
                  <div className="flex items-center gap-2">
                    <span className="text-base">💡</span>
                    <span>Prompt describes a solo person, but <strong>Couple Mode</strong> is selected.</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => updateSettings({ subjectComposition: 'solo' })}
                    className="px-2.5 py-0.5 bg-cyan-500 text-zinc-950 font-bold rounded-lg hover:bg-cyan-400 transition-all text-xs shrink-0 cursor-pointer shadow-xs"
                  >
                    Switch to Solo
                  </button>
                </div>
              );
            }
            return null;
          })()}
        </div>

        {/* Unified Visual Style & Preset Selector */}
        <div className="space-y-2.5 bg-zinc-950/50 p-3.5 rounded-xl border border-zinc-800/80">
          <div className="flex items-center justify-between">
            <label className="text-xs text-zinc-300 font-bold flex items-center gap-1.5">
              <span>🎭 Visual Aesthetic Style</span>
            </label>
            <button
              type="button"
              onClick={() => setShowAllStyles(!showAllStyles)}
              className="text-[11px] text-cyan-400 hover:text-cyan-300 font-bold transition-all flex items-center gap-1 cursor-pointer"
            >
              <span>{showAllStyles ? 'Hide Presets ▴' : `Browse All Styles (${NARRATIVE_STYLES.length}) ▾`}</span>
            </button>
          </div>

          {/* Curated Top Quick-Pick Pills */}
          <div className="flex flex-wrap gap-1.5">
            {TOP_FEATURED_STYLES.map((st) => {
              const isSelected = narrativeStyle === st;
              return (
                <button
                  key={st}
                  type="button"
                  onClick={() => handleSelectNarrativeStyle(st as NarrativeStyle)}
                  className={`px-3 py-1.5 text-xs rounded-xl font-bold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-cyan-500 text-zinc-950 shadow-md shadow-cyan-500/20'
                      : 'bg-zinc-950 text-zinc-400 border border-zinc-800 hover:text-zinc-200 hover:border-zinc-700'
                  }`}
                >
                  {st}
                </button>
              );
            })}
          </div>

          {/* Expandable Categorized Styles Drawer */}
          {showAllStyles && (
            <div className="pt-3 border-t border-zinc-800 space-y-2 animate-fade-in">
              <div className="flex flex-wrap gap-1">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'raw', label: '📱 Raw & Mobile' },
                  { id: 'sultry', label: '💋 Sultry & Romance' },
                  { id: 'cinema', label: '🎬 Cinema & Drama' },
                  { id: 'action', label: '⚔️ Action & Sci-Fi' },
                  { id: 'artistic', label: '🎨 Anime & Art' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setNarrativeCategoryFilter(cat.id as any)}
                    className={`px-2 py-0.5 text-[11px] font-semibold rounded-lg transition-all cursor-pointer ${
                      narrativeCategoryFilter === cat.id
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto p-2 bg-zinc-950 rounded-xl border border-zinc-800/80">
                {(
                  narrativeCategoryFilter === 'all'
                    ? NARRATIVE_PRESETS
                    : [
                        { id: 'None' as NarrativeStyle, category: narrativeCategoryFilter },
                        ...NARRATIVE_PRESETS.filter((p) => p.id !== 'None' && p.category === narrativeCategoryFilter),
                      ]
                ).map((preset) => {
                  const isSelected = narrativeStyle === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleSelectNarrativeStyle(preset.id)}
                      className={`px-2.5 py-1 text-[11px] rounded-lg font-medium transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-cyan-500 text-zinc-950 font-bold'
                          : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-zinc-200'
                      }`}
                    >
                      {preset.id === 'None' ? '🚫 None' : preset.id}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Active Style Directive Preview */}
          {NARRATIVE_STYLE_PREVIEWS[narrativeStyle] && (
            <div className="p-2.5 bg-zinc-950/90 border border-cyan-500/20 rounded-xl text-[11px] text-zinc-400 font-mono flex items-start gap-2">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
              <span><strong>{narrativeStyle}:</strong> "{NARRATIVE_STYLE_PREVIEWS[narrativeStyle]}"</span>
            </div>
          )}
        </div>

        {/* Collapsible Story Seed Inspiration Accordion */}
        <div className="bg-zinc-950/40 p-3 rounded-xl border border-zinc-800/80">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setShowAllSeeds(!showAllSeeds)}
              className="text-xs font-bold text-zinc-300 hover:text-cyan-300 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
              <span>💡 Need Story Inspiration? Browse 57 Story Seeds</span>
              <ChevronDown className={`w-3.5 h-3.5 text-zinc-400 transition-transform ${showAllSeeds ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {showAllSeeds && (
            <div className="mt-3 pt-3 border-t border-zinc-800 space-y-2 animate-fade-in">
              <div className="flex flex-wrap gap-1 mb-2">
                {[
                  { id: 'all', label: 'All Seeds' },
                  { id: 'solo-sultry', label: '💃 Solo Sultry' },
                  { id: 'couple-sultry', label: '👩‍❤️‍💋‍👨 Couple' },
                  { id: 'solo', label: '👤 Solo General' },
                  { id: 'action', label: '⚔️ Action' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSeedCategoryFilter(cat.id as any)}
                    className={`px-2 py-0.5 text-[11px] font-semibold rounded-lg transition-all cursor-pointer ${
                      seedCategoryFilter === cat.id
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto p-2 bg-zinc-950 rounded-xl border border-zinc-800">
                {(
                  seedCategoryFilter === 'all'
                    ? STORY_SEED_PRESETS
                    : STORY_SEED_PRESETS.filter((s) => s.category === seedCategoryFilter)
                ).map((seed) => (
                  <button
                    key={seed.label}
                    type="button"
                    onClick={() => handleSelectSeed(seed)}
                    className="px-2.5 py-1 text-[11px] bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-amber-500/40 text-zinc-300 rounded-lg transition-all text-left cursor-pointer"
                  >
                    {seed.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Scene Subject Composition & Reference Behavior Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Subject Composition Card */}
          <div className="bg-zinc-950/60 p-3.5 rounded-xl border border-zinc-800/80 space-y-2">
            <label className="text-xs text-zinc-300 font-bold block">Subject Composition</label>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { id: 'solo', label: '👤 Solo', sub: '1 Character (S1)' },
                { id: 'couple', label: '👩‍❤️‍👨 Couple', sub: '2 Duo (S1+S2)' },
                { id: 'ensemble', label: '👥 Group', sub: 'Ensemble Cast' },
              ].map((item) => {
                const isSelected = (project.settings.subjectComposition || 'solo') === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => updateSettings({ subjectComposition: item.id as any })}
                    className={`p-2 rounded-lg border text-center transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-cyan-950/60 border-cyan-500 text-cyan-300 font-bold shadow-xs'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <div className="text-xs">{item.label}</div>
                    <div className="text-[9px] text-zinc-500 mt-0.5">{item.sub}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Reference Anchor Behavior (if image mode) */}
          {project.settings.mode !== 'T2VA' ? (
            <div className="bg-zinc-950/60 p-3.5 rounded-xl border border-zinc-800/80 space-y-2">
              <label className="text-xs text-zinc-300 font-bold block">Reference Anchor Lock</label>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: 'strict', label: '🔒 Strict Lock', sub: 'Keep Room & Lighting' },
                  { id: 'creative', label: '🎨 Identity Only', sub: 'Keep Face & Hairstyle' },
                ].map((item) => {
                  const isSelected = (project.settings.referenceMode || 'strict') === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => updateSettings({ referenceMode: item.id as any })}
                      className={`p-2 rounded-lg border text-center transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-purple-950/60 border-purple-500 text-purple-300 font-bold shadow-xs'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                      }`}
                    >
                      <div className="text-xs">{item.label}</div>
                      <div className="text-[9px] text-zinc-500 mt-0.5">{item.sub}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="bg-zinc-950/60 p-3.5 rounded-xl border border-zinc-800/80 flex items-center justify-center text-center">
              <span className="text-xs text-zinc-500 font-mono">T2VA Mode: Pure text generation (Zero image constraints)</span>
            </div>
          )}
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

        {/* 4 Unified Director Profiles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {/* Profile 1: Cinematic Director */}
          <button
            type="button"
            onClick={() => {
              setDirectorProfile('cinematic');
              AIEngine.setActiveProvider('gemini');
            }}
            className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
              directorProfile === 'cinematic'
                ? 'bg-cyan-950/60 border-cyan-500 text-cyan-200 shadow-md shadow-cyan-500/10'
                : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
            }`}
          >
            <div className="font-bold text-xs flex items-center justify-between mb-1">
              <span className="flex items-center gap-1.5 text-cyan-400 dark:text-cyan-300">🎬 Cinematic</span>
              {directorProfile === 'cinematic' && <span className="text-[9px] bg-cyan-500/20 text-cyan-400 dark:text-cyan-300 px-1.5 py-0.5 rounded font-mono font-bold">ACTIVE</span>}
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-normal">
              Gemini 3.5 Flash with 35mm optical lens physics and cinematic lighting falloff.
            </p>
          </button>

          {/* Profile 2: Uncensored Real Motion */}
          <button
            type="button"
            onClick={() => {
              setDirectorProfile('uncensored');
              AIEngine.setActiveProvider('gemini');
            }}
            className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
              directorProfile === 'uncensored'
                ? 'bg-rose-950/60 border-rose-500 text-rose-200 shadow-md shadow-rose-500/20'
                : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
            }`}
          >
            <div className="font-bold text-xs flex items-center justify-between mb-1">
              <span className="flex items-center gap-1.5 text-rose-400 dark:text-rose-300">🔥 Uncensored</span>
              {directorProfile === 'uncensored' && <span className="text-[9px] bg-rose-500/20 text-rose-400 dark:text-rose-300 px-1.5 py-0.5 rounded font-mono font-bold">ACTIVE</span>}
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-normal">
              Gemini 3.5 Flash natural English. Focuses on continuous physical human motion.
            </p>
          </button>

          {/* Profile 3: Deep Reasoning Director */}
          <button
            type="button"
            onClick={() => {
              setDirectorProfile('reasoning');
              AIEngine.setActiveProvider('gemini');
            }}
            className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
              directorProfile === 'reasoning'
                ? 'bg-purple-950/60 border-purple-500 text-purple-200 shadow-md shadow-purple-500/20'
                : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
            }`}
          >
            <div className="font-bold text-xs flex items-center justify-between mb-1">
              <span className="flex items-center gap-1.5 text-purple-400 dark:text-purple-300">🧠 4K Reasoning</span>
              {directorProfile === 'reasoning' && <span className="text-[9px] bg-purple-500/20 text-purple-400 dark:text-purple-300 px-1.5 py-0.5 rounded font-mono font-bold">ACTIVE</span>}
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-normal">
              Gemini 2.5 Pro with 4K thinking budget. Maximum multi-shot narrative consistency.
            </p>
          </button>

          {/* Profile 4: Local GPU Qwen3-VL */}
          <button
            type="button"
            onClick={() => {
              setDirectorProfile('local' as any);
              AIEngine.setActiveProvider('local');
            }}
            className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
              (directorProfile as any) === 'local'
                ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200 shadow-md shadow-emerald-500/20'
                : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
            }`}
          >
            <div className="font-bold text-xs flex items-center justify-between mb-1">
              <span className="flex items-center gap-1.5 text-emerald-400 dark:text-emerald-300">💻 Local Qwen3-VL</span>
              {(directorProfile as any) === 'local' && <span className="text-[9px] bg-emerald-500/20 text-emerald-400 dark:text-emerald-300 px-1.5 py-0.5 rounded font-mono font-bold">ACTIVE</span>}
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-normal">
              100% offline & private via Ollama / LM Studio. Zero API cost & unrestricted generation.
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
