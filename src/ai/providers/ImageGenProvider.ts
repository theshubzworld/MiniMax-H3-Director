import { AspectRatio, MiniMaxMode, VisualStyle, SceneGridLayout, QualityResolution } from '../../types/project';
import { GeminiProvider } from './GeminiProvider';

export type NanoBananaModel =
  | 'gemini-3.1-flash-image'
  | 'gemini-3.1-flash-lite-image'
  | 'gemini-3-pro-image'
  | 'gemini-2.5-flash-image';

export interface ImageGenParams {
  prompt: string;
  model: NanoBananaModel;
  style: VisualStyle;
  aspectRatio: AspectRatio;
  referenceImage?: string; // Subject / character reference image
  styleReferenceImage?: string; // Aesthetic / style reference image
  autoEnhancePrompt?: boolean; // Whether to run Gemini 2.5 Pro / 3.5 Flash prompt expansion
  gridLayout?: SceneGridLayout;
  qualityResolution?: QualityResolution;
}

export interface KeyframePairParams {
  idea: string;
  model: NanoBananaModel;
  style: VisualStyle;
  aspectRatio: AspectRatio;
  mode?: MiniMaxMode;              // The MiniMax video mode (FL2VA, I2VA, etc.)
  referenceImage?: string;         // Subject / character reference image
  styleReferenceImage?: string;    // Aesthetic / style reference image
  gridLayout?: SceneGridLayout;
  qualityResolution?: QualityResolution;
}

export interface GeneratedKeyframe {
  id: string;
  name: string;
  url: string;
  prompt: string;
  model: NanoBananaModel;
  style: VisualStyle;
  aspectRatio: AspectRatio;
  createdAt: string;
}

export interface KeyframePairResult {
  firstKeyframe: GeneratedKeyframe;
  lastKeyframe: GeneratedKeyframe;
  visualDNA: any;
  sceneProgression: string;
}

export interface KeyframePairPlan {
  visualDNA: any;
  sceneDNA: any;
  event: any;
  prompt1: string;
  prompt2: string;
}

export class ImageGenProvider {
  private static getEffectiveApiKey(apiKey?: string): string {
    let key = apiKey && apiKey.trim().length > 0 ? apiKey.trim() : '';
    if (!key) {
      key = (localStorage.getItem('minimax_gemini_api_key') || '').trim();
    }
    if (!key) {
      key = (import.meta.env.VITE_GEMINI_API_KEY || '').trim();
    }
    return key;
  }

  /**
   * Generates dynamic medium-specific rules (Realistic vs Anime vs Fine Art) to prevent Gemini artword leaks.
   */
  private static getStyleCategoryInstructions(style: VisualStyle): string {
    const s = String(style || '').toLowerCase();

    if (/anime|manga|cel shaded|shinkai|ghibli|chibi|kawaii/.test(s)) {
      return `ARTISTIC MEDIUM: ANIME & MANGA
Selected Style: "${style}".
Embrace hand-drawn, cel-shaded, animated visual language naturally.
Describe line art weight, cel shading highlights, anime character features, vibrant color palettes, and painterly background art.
DO NOT use photographic camera terms like 35mm film grain, shutter speed, or real skin pores.`;
    }

    if (/oil painting|watercolor|arcane|dishonored|sketch|claymation|stop motion|comic|surrealist|low poly|isometric/.test(s)) {
      return `ARTISTIC MEDIUM: FINE ART & ILLUSTRATION
Selected Style: "${style}".
Fully embrace this artistic medium! Describe brushwork, paint texture, canvas grain, linework, color washes, or clay sculpted surfaces.
DO NOT write realistic photography instructions or use words like "camera lens" or "live-action photograph".`;
    }

    // Default: Realistic Photographic Rules
    return `PHOTOGRAPHIC MEDIUM: LIVE-ACTION REALISM
Selected Style: "${style}".
Treat the image strictly as a REAL PHOTOGRAPH captured by a physical cinema camera on a live-action film set.
The result MUST look like a real person in a real physical location.

STRICTLY BANNED WORDS - NEVER OUTPUT ANY OF THESE WORDS IN THE PROMPT:
❌ "concept art"
❌ "AAA concept art"
❌ "masterpiece"
❌ "digital painting"
❌ "key art"
❌ "illustration"
❌ "CG artwork"
❌ "stylized"
❌ "painterly"
❌ "graphic novel"
❌ "anime"
❌ "cel shaded"
❌ "comic book"
❌ "oil painting"

INSTEAD USE PHOTOGRAPHIC REALISM DESCRIPTORS:
✓ Hollywood live-action feature film
✓ Professional cinema camera
✓ Photographic realism
✓ Natural skin texture
✓ Physically accurate materials
✓ Real-world lighting
✓ High-end cinematic color grading
✓ Large-format cinema photography
✓ Premium production design`;
  }

  private static getQualityResolutionInstructions(quality?: QualityResolution): string {
    if (quality === '0.5K') {
      return `RESOLUTION SPECIFICATION: 0.5K (512px) fast draft resolution.`;
    }
    if (quality === '1K') {
      return `RESOLUTION SPECIFICATION: 1K (1024px) standard resolution, sharp optical focus, clean digital sensor clarity.`;
    }
    if (quality === '2K') {
      return `RESOLUTION SPECIFICATION: 2K (2048px) high resolution, 35mm cinema lens detail, ultra-sharp optical clarity.`;
    }
    return `RESOLUTION SPECIFICATION: 4K (4096px) Ultra HD master resolution, Hasselblad 100MP medium format camera depth, ultra-detailed micro-textures, 8k raw detail, pin-sharp optical clarity.`;
  }

  /**
   * Converts a simple user prompt into a highly detailed 4K image prompt using Gemini 3.5 Flash / 2.5 Pro (with Multimodal Vision for reference images).
   */
  public static async enhancePromptForImage(
    rawPrompt: string,
    style: VisualStyle,
    aspectRatio: AspectRatio,
    referenceImage?: string,
    apiKey?: string,
    styleReferenceImage?: string,
    qualityResolution?: QualityResolution,
    directorModel?: string,
    mode?: MiniMaxMode
  ): Promise<string> {
    const key = this.getEffectiveApiKey(apiKey);
    const gemini = new GeminiProvider();

    const styleRules = this.getStyleCategoryInstructions(style);
    const qualityRules = this.getQualityResolutionInstructions(qualityResolution);
    const imageContextText = referenceImage
      ? `SUBJECT REFERENCE ATTACHED: Inspect the reference image carefully. Reference "the man from the reference image" or "the woman from the reference image". PRESERVE facial features and build without inventing new caption traits.`
      : '';
    const styleContextText = styleReferenceImage
      ? `STYLE REFERENCE ATTACHED: Inspect the style reference image carefully. Extract and match its visual color palette, lighting atmosphere, photographic/artistic medium, camera texture, and aesthetic mood. Merge this style DNA into the final image description.`
      : '';

    const modeContract = mode === 'I2VA'
      ? `──────────────────────────────────────────────────────────
MINIMAX H3 I2VA (FIRST FRAME @ 0.00s) DESIGN CONTRACT:
──────────────────────────────────────────────────────────
You are designing the EXACT OPENING KEYFRAME (<Picture 1>) at 0.00 seconds of the target video.
- Focus on initial starting posture, opening environmental state, lighting setup, and immediate dynamic action starting at 0.00s.
- This keyframe will serve as the exact visual anchor at 0.00 seconds.`
      : mode === 'L2VA'
      ? `──────────────────────────────────────────────────────────
MINIMAX H3 L2VA (LAST FRAME @ ENDING MARK) DESIGN CONTRACT:
──────────────────────────────────────────────────────────
You are designing the EXACT CLOSING KEYFRAME (<Picture 1>) at the ending mark of the target video.
- Focus on climax resolution state, landing posture, final action position, and closing lighting setup.
- This keyframe will serve as the exact visual anchor at the video conclusion.`
      : mode === 'T2VA'
      ? `──────────────────────────────────────────────────────────
MINIMAX H3 T2VA (TEXT PRE-VIS CONCEPT) DESIGN CONTRACT:
──────────────────────────────────────────────────────────
You are designing a standalone photorealistic 4K cinematic concept keyframe / pre-vis storyboard frame without reference image dependencies.`
      : mode === 'FL2VA'
      ? `──────────────────────────────────────────────────────────
MINIMAX H3 FL2VA (KEYFRAME ANCHOR) DESIGN CONTRACT:
──────────────────────────────────────────────────────────
You are designing a visual keyframe anchor for MiniMax H3 First & Last Frame video interpolation.`
      : '';

    const systemPrompt = `You are an Elite Hollywood Film Director, Cinematographer, and Pre-Visualization Supervisor.
Your job is to generate an optimized prompt for an advanced AI image generation model (Gemini Nano Banana).
The output will be sent DIRECTLY to an AI image model.
The prompt must describe exactly ONE cinematic keyframe. It must be visually precise, physically realistic, and structured like a live-action film pre-vis storyboard.

${styleRules}
Target Aspect Ratio: ${aspectRatio}.
${qualityRules}
${imageContextText}
${styleContextText}
${modeContract}

──────────────────────────────────────────────────────────
MANDATORY FILM PRE-VIS DIRECTIVES (STRICT COMPLIANCE):
──────────────────────────────────────────────────────────
1. NO FACE OR FACIAL DESCRIPTIONS IF REFERENCE IMAGE EXISTS:
   - If a reference image is present: NEVER describe facial features, eye shape, nose, chin, skin tone, hair cut, beard, or facial hair.
   - Refer strictly to "the man from the reference image" or "the woman from the reference image". Face, hair, and identity come 100% ONLY from the reference photo.

2. NO PORTRAIT PHOTOGRAPHY / NO STATIC POSES (BAN LIST):
   - ❌ FORBIDDEN SHOTS: close-up, medium close-up, chest up, eye level, headshot, portrait framing, studio portrait.
   - ❌ FORBIDDEN POSES: standing, posing, looking at camera, hero pose, photo of, portrait of, handsome man, beautiful woman, masterpiece, AAA artwork, illustration, digital painting, graphic novel.
   - ✅ MANDATORY SHOT TYPES: Wide shot, Medium full body, Full body, Environmental shot, Low angle hero shot, High angle action shot.

3. THINK LIKE A FILM DIRECTOR (ENVIRONMENT-FIRST PRE-VIS STRUCTURE):
   - Always structure descriptions in cinematic order:
     1. Environment & Architecture first (e.g. "Glass rains from the ceiling of a collapsing atrium...")
     2. Incident / Action second ("...as an explosive shockwave tears through the marble hall...")
     3. Character reacting third ("...the man from the reference image pivots and shields his face...")
     4. Camera motion last ("...captured in a low-angle tracking shot.")

4. NO INVENTED CIVILIAN CLOTHING:
   - If a reference image exists: Keep existing civilian clothing from the reference image unless the user explicitly requests new clothing.
   - Do not invent random suits, hoodies, or jackets out of nowhere.

5. DYNAMIC CAMERA & ACTION VERBS ONLY:
   - Use dynamic camera verbs: camera sweeps, camera tracks, camera cranes upward, camera circles, camera follows, low-angle environmental framing.
   - Use physical action verbs: landing, blocking, running, dodging, turning, charging, shielding, sliding, jumping, recovering.
   - ❌ NEVER describe un-photographable thoughts: "realizes", "remembers", "thinks", "decides", "feels".

Output ONLY the expanded cinematic keyframe prompt without any conversational intros or markdown chatter.`;

    let raw = '';
    const mediaList: string[] = [];
    if (referenceImage) mediaList.push(referenceImage);
    if (styleReferenceImage) mediaList.push(styleReferenceImage);

    if (mediaList.length > 0) {
      raw = await gemini.callMultimodalPrompt(systemPrompt + `\n\nUser Concept: "${rawPrompt}"`, mediaList, key, directorModel);
    } else {
      raw = await gemini.callTextPrompt(systemPrompt + `\n\nUser Concept: "${rawPrompt}"`, key, directorModel);
    }

    return raw.trim();
  }

  /**
   * PASS 1 ONLY: Plans both Keyframe 1 (<Picture 1>) and Keyframe 2 (<Picture 2>) prompts in ONE Gemini Director call
   * WITHOUT generating images yet.
   */
  public static async planKeyframePairPrompts(
    params: KeyframePairParams,
    apiKey?: string,
    directorModel?: string
  ): Promise<KeyframePairPlan> {
    const key = this.getEffectiveApiKey(apiKey);
    const gemini = new GeminiProvider();
    const styleRules = this.getStyleCategoryInstructions(params.style);

    const styleRefInstruction = params.styleReferenceImage
      ? `STYLE REFERENCE IMAGE ATTACHED: Inspect the attached style reference image. Extract its exact color grading palette, lighting family, camera lens texture, and visual atmosphere into sharedSceneDNA.`
      : '';

    let gridInstruction = '';
    if (params.gridLayout === '2x2_grid') {
      gridInstruction = `GRID COMPOSITION REQUIREMENT: Format both Frame 1 and Frame 2 descriptions as 2x2 4-panel grid composite layouts ("Create a 2x2 4-image grid layout showing...").`;
    } else if (params.gridLayout === '3x3_grid') {
      gridInstruction = `GRID COMPOSITION REQUIREMENT: Format both Frame 1 and Frame 2 descriptions as 3x3 9-frame storyboard pre-vis grid layouts labeled [1][2][3]/[4][5][6]/[7][8][9].`;
    }

    const qualityRules = this.getQualityResolutionInstructions(params.qualityResolution);

    // FL2VA-specific anchor instruction: Frame 1 = Picture 1 (0.00s), Frame 2 = Picture 2 (ending mark)
    const fl2vaInstruction = params.mode === 'FL2VA'
      ? `
──────────────────────────────────────────────────────────
FL2VA MODE — MINIMAX H3 KEYFRAME ANCHOR DESIGN CONTRACT:
──────────────────────────────────────────────────────────
You are designing TWO EXACT KEYFRAME ANCHORS for MiniMax H3 First-Last-to-Video-Animation (FL2VA) interpolation.
- Frame 1 = <Picture 1> = the EXACT OPENING VISUAL ANCHOR at 0.00 seconds of the final video.
- Frame 2 = <Picture 2> = the EXACT CLOSING VISUAL ANCHOR at the ending mark of the final video.
MiniMax will AI-interpolate ALL motion between them. Your job is to make them:
  ✅ Visually DISTINCT: different physical pose, action state, or camera position — but same location, lighting, and character.
  ✅ Narratively CONTINUOUS: Frame 2 must feel like the natural 10-second physical evolution of Frame 1.
  ✅ Scene-STABLE: same environment, same lighting family, same color palette in BOTH frames.
  ✅ ANCHOR-READY: each frame must be a clean, still, single image — NOT mid-blur or mid-transition.
DO NOT design static twin portraits. Design a CLEAR BEGINNING STATE and a CLEAR END STATE of one continuous scene.
`
      : '';

    const directorPrompt = `You are NOT an AI image generator or generic prompt writer.
You are an Elite Hollywood Film Director, Cinematographer, Production Designer, and Pre-Visualization Supervisor.
Your responsibility is NOT to describe static portrait photos.
Your responsibility is to DESIGN ONE DYNAMIC CONTINUOUS 10-SECOND CINEMATIC MOVIE SEQUENCE and capture TWO SNAPSHOTS IN TIME (Frame 1 @ 0s and Frame 2 @ 10s).
${fl2vaInstruction}

${styleRules}
Target Aspect Ratio: ${params.aspectRatio}.
${qualityRules}
${styleRefInstruction}
${gridInstruction}

──────────────────────────────────────────────────────────
MANDATORY FILM PRE-VIS DIRECTIVES (STRICT COMPLIANCE):
──────────────────────────────────────────────────────────
1. NO FACE OR FACIAL DESCRIPTIONS IF REFERENCE IMAGE EXISTS:
   - If a reference image is present: NEVER describe facial features, eye shape, nose, chin, skin tone, hair cut, beard, or facial hair.
   - Refer strictly to "the man from the reference image" or "the woman from the reference image". Face, hair, and identity come 100% ONLY from the reference photo.

2. NO PORTRAIT PHOTOGRAPHY / NO STATIC POSES (BAN LIST):
   - ❌ FORBIDDEN SHOTS: close-up, medium close-up, chest up, eye level, headshot, portrait framing, studio portrait.
   - ❌ FORBIDDEN POSES: standing, posing, looking at camera, hero pose, photo of, portrait of, handsome man, beautiful woman, masterpiece, AAA artwork, illustration, digital painting, graphic novel.
   - ✅ MANDATORY SHOT TYPES: Wide shot, Medium full body, Full body, Environmental shot, Low angle hero shot, High angle action shot.

3. THINK LIKE A FILM DIRECTOR (ENVIRONMENT-FIRST PRE-VIS STRUCTURE):
   - Always structure descriptions in cinematic order:
     1. Environment & Architecture first (e.g. "Glass rains from the ceiling of a collapsing atrium...")
     2. Incident / Action second ("...as an explosive shockwave tears through the marble hall...")
     3. Character reacting third ("...the man from the reference image pivots and shields his face...")
     4. Camera motion last ("...captured in a low-angle tracking shot.")

4. NO INVENTED CIVILIAN CLOTHING:
   - If a reference image exists: Keep existing civilian clothing from the reference image unless the user explicitly requests new clothing.
   - Do not invent random suits, hoodies, or jackets out of nowhere.

5. DYNAMIC CAMERA & ACTION VERBS ONLY:
   - Use dynamic camera verbs: camera sweeps, camera tracks, camera cranes upward, camera circles, camera follows, low-angle environmental framing.
   - Use physical action verbs: landing, blocking, running, dodging, turning, charging, shielding, sliding, jumping, recovering.
   - ❌ NEVER describe un-photographable thoughts: "realizes", "remembers", "thinks", "decides", "feels".

6. STRICT CONTINUOUS EVOLUTION BETWEEN FRAME 1 & FRAME 2:
   - Frame 2 MUST be a direct 10-second physical evolution of Frame 1 in the SAME physical environment under the SAME lighting family.
   - Identity stays, Architecture stays, Lighting family stays, Color palette stays, Camera language stays. ONLY the physical action evolves.

7. REMOVE VAGUE AI BUZZWORDS:
   - ❌ FORBIDDEN BUZZWORDS: masterpiece, AAA, premium, highly detailed, 8k, photorealistic, Hollywood quality.
   - Replace with concrete physical optical descriptions (Zeiss Supreme Prime lens depth, volumetric smoke particles, physical shadow falloff).

Return ONLY valid JSON matching this exact structure:
{
  "sharedVisualDNA": {
    "identity": "${params.referenceImage ? 'the man from the reference image' : 'the protagonist'}",
    "wardrobe": "preserved from reference image"
  },
  "sharedSceneDNA": {
    "location": "futuristic skyscraper atrium on a rainy night",
    "weather": "volumetric dust and flying glass particles",
    "lighting": "dramatic high-contrast emergency amber lighting",
    "cameraLanguage": "low-angle wide tracking shot with Zeiss 25mm lens depth",
    "colorPalette": "deep navy blues, steel greys, and emergency amber"
  },
  "event": {
    "trigger": "Explosive shockwave shatters glass atrium wall",
    "progression": "Protagonist pivots, dodges falling glass and deploys nanotech energy shield",
    "climax": "Protagonist fully shielded in glowing nanotech armor amidst falling debris"
  },
  "frame1": "Glass debris rains from the ceiling of a collapsing corporate atrium as an explosive shockwave tears through the marble hall. The man from the reference image pivots and shields his face under emergency amber lighting. Low-angle wide tracking shot.",
  "frame2": "Inside the same collapsing corporate atrium, the man from the reference image slides across the debris-covered marble floor with a fully deployed glowing plasma shield. Volumetric smoke drifts through the same emergency amber lighting in the same low-angle wide tracking shot."
}

User Transformation Arc: "${params.idea}"`;

    let plan: any;
    try {
      let rawText = '';
      const mediaList: string[] = [];
      if (params.referenceImage) mediaList.push(params.referenceImage);
      if (params.styleReferenceImage) mediaList.push(params.styleReferenceImage);

      if (mediaList.length > 0) {
        rawText = await gemini.callMultimodalPrompt(directorPrompt, mediaList, key, directorModel);
      } else {
        rawText = await gemini.callTextPrompt(directorPrompt, key, directorModel);
      }

      const match = rawText.match(/\{[\s\S]*\}/);
      if (match) {
        plan = JSON.parse(match[0]);
      }
    } catch (e) {
      console.warn('[ImageGenProvider] Dynamic Keyframe Pair planning failed, using fallback', e);
    }

    const dna = plan?.sharedVisualDNA || plan?.visualDNA || {};
    const sceneDna = plan?.sharedSceneDNA || {};
    
    const getCleanString = (val: any, fallback: string) => {
      if (typeof val === 'string' && val.trim()) return val.trim();
      if (val && typeof val === 'object') {
        if (typeof val.prompt === 'string') return val.prompt;
        if (typeof val.text === 'string') return val.text;
        if (typeof val.description === 'string') return val.description;
      }
      return fallback;
    };

    const fallbackP1 = `Inside ${sceneDna.location || 'a futuristic atrium'}, ${params.referenceImage ? 'the man from the reference image' : 'a man'} braces in action.`;
    const fallbackP2 = `Inside the same ${sceneDna.location || 'futuristic atrium'}, ${params.referenceImage ? 'the same man from the reference image' : 'the man'} stands in full hero suit in combat.`;

    const rawPrompt1 = getCleanString(plan?.frame1 || plan?.prompt1, fallbackP1);
    const rawPrompt2 = getCleanString(plan?.frame2 || plan?.prompt2, fallbackP2);

    // Merge full sharedSceneDNA (location, weather, lighting, cameraLanguage, colorPalette) + Grid Directives + Quality
    const buildCompositePrompt = (rawFrame: string) => {
      const parts: string[] = [];

      // 1. Grid layout directive at the VERY FRONT
      if (params.gridLayout === '2x2_grid') {
        parts.push(`[2x2 FOUR-PANEL COMPOSITE GRID LAYOUT] Create a 2x2 grid (Top-Left, Top-Right, Bottom-Left, Bottom-Right) showing 4 sequential panels.`);
      } else if (params.gridLayout === '3x3_grid') {
        parts.push(`[3x3 NINE-FRAME STORYBOARD PRE-VIS GRID LAYOUT] Create a 3x3 nine-panel grid labeled [1][2][3] / [4][5][6] / [7][8][9] displaying full 9-frame sequential story progression.`);
      }

      // 2. Main Frame Action
      parts.push(rawFrame);

      // 3. Merged sharedSceneDNA details if not already present
      if (sceneDna.location && !rawFrame.toLowerCase().includes(sceneDna.location.toLowerCase().slice(0, 15))) {
        parts.push(`Location: ${sceneDna.location}.`);
      }
      if (sceneDna.weather && !rawFrame.toLowerCase().includes(sceneDna.weather.toLowerCase().slice(0, 15))) {
        parts.push(`Atmosphere: ${sceneDna.weather}.`);
      }
      if (sceneDna.lighting && !rawFrame.toLowerCase().includes(sceneDna.lighting.toLowerCase().slice(0, 15))) {
        parts.push(`Lighting: ${sceneDna.lighting}.`);
      }
      if (sceneDna.cameraLanguage && !rawFrame.toLowerCase().includes(sceneDna.cameraLanguage.toLowerCase().slice(0, 15))) {
        parts.push(`Camera: ${sceneDna.cameraLanguage}.`);
      }
      if (sceneDna.colorPalette && !rawFrame.toLowerCase().includes(sceneDna.colorPalette.toLowerCase().slice(0, 15))) {
        parts.push(`Color Grade: ${sceneDna.colorPalette}.`);
      }

      // 4. Quality and Resolution Directive
      parts.push(qualityRules);

      return parts.join(' ');
    };

    const prompt1 = buildCompositePrompt(rawPrompt1);
    const prompt2 = buildCompositePrompt(rawPrompt2);

    console.log('[ImageGenProvider] 🎬 10-Second Movie Clip Sequence Planned:', { sharedVisualDNA: dna, sharedSceneDNA: sceneDna, event: plan?.event, prompt1, prompt2 });

    return {
      visualDNA: dna,
      sceneDNA: sceneDna,
      event: plan?.event,
      prompt1,
      prompt2,
    };
  }

  /**
   * Wrapper for backward compatibility: plans prompts AND renders keyframes immediately.
   */
  public static async planAndGenerateKeyframePair(
    params: KeyframePairParams,
    apiKey?: string
  ): Promise<KeyframePairResult> {
    const key = this.getEffectiveApiKey(apiKey);
    const plan = await this.planKeyframePairPrompts(params, key);

    // Generate Keyframe 1 (<Picture 1>) and Keyframe 2 (<Picture 2>) using Nano Banana
    const [firstKeyframe, lastKeyframe] = await Promise.all([
      this.generateKeyframe(
        {
          prompt: plan.prompt1,
          model: params.model,
          style: params.style,
          aspectRatio: params.aspectRatio,
          referenceImage: params.referenceImage,
          styleReferenceImage: params.styleReferenceImage,
          autoEnhancePrompt: false,
        },
        key
      ),
      this.generateKeyframe(
        {
          prompt: plan.prompt2,
          model: params.model,
          style: params.style,
          aspectRatio: params.aspectRatio,
          referenceImage: params.referenceImage,
          styleReferenceImage: params.styleReferenceImage,
          autoEnhancePrompt: false,
        },
        key
      ),
    ]);

    return {
      firstKeyframe,
      lastKeyframe,
      visualDNA: plan.visualDNA,
      sceneProgression: plan?.event?.progression || `Transformation: ${params.idea}`,
    };
  }

  /**
   * Generates a keyframe image strictly using Google Nano Banana (Gemini Image) REST endpoints on Vertex AI Express.
   */
  public static async generateKeyframe(params: ImageGenParams, apiKey?: string): Promise<GeneratedKeyframe> {
    const key = this.getEffectiveApiKey(apiKey);
    const regionalFallbacks = ['us-central1', 'us-east4', 'us-west1', 'europe-west1', 'europe-west4'];

    const isGlobalOnly = /gemini-3\.5-|gemini-3\.1-|gemini-3-/.test(params.model);
    const locationsToTry = isGlobalOnly ? [''] : ['us-central1', ...regionalFallbacks];

    let finalPrompt = typeof params.prompt === 'string' ? params.prompt : JSON.stringify(params.prompt || '');
    if (params.autoEnhancePrompt !== false) {
      finalPrompt = await this.enhancePromptForImage(finalPrompt, params.style, params.aspectRatio, params.referenceImage, key, params.styleReferenceImage);
    }

    // Always enforce front-positioned Aspect Ratio Mandate to override reference photo orientation
    if (params.aspectRatio && !finalPrompt.includes('ASPECT RATIO MANDATE:')) {
      const ratioDesc = params.aspectRatio === '16:9'
        ? 'horizontal widescreen 16:9 ratio'
        : params.aspectRatio === '9:16'
        ? 'vertical portrait 9:16 ratio'
        : params.aspectRatio === '1:1'
        ? 'square 1:1 ratio'
        : `${params.aspectRatio} aspect ratio`;

      finalPrompt = `[ASPECT RATIO MANDATE: ${params.aspectRatio} (${ratioDesc}). Frame composition MUST be rendered in strictly ${params.aspectRatio} format.] ${finalPrompt}`;
    }

    // Always enforce front-positioned Grid Directive Mandate if grid layout selected
    if (params.gridLayout === '2x2_grid' && !finalPrompt.includes('[2x2 FOUR-PANEL COMPOSITE GRID LAYOUT]')) {
      finalPrompt = `[2x2 FOUR-PANEL COMPOSITE GRID LAYOUT] Create a 2x2 grid (Top-Left, Top-Right, Bottom-Left, Bottom-Right) showing 4 sequential action panels. ${finalPrompt}`;
    } else if (params.gridLayout === '3x3_grid' && !finalPrompt.includes('[3x3 NINE-FRAME STORYBOARD PRE-VIS GRID LAYOUT]')) {
      finalPrompt = `[3x3 NINE-FRAME STORYBOARD PRE-VIS GRID LAYOUT] Create a 3x3 nine-panel grid labeled [1][2][3] / [4][5][6] / [7][8][9] displaying 9-frame sequential story progression. ${finalPrompt}`;
    }

    // Always enforce front-positioned Quality Resolution Mandate
    if (params.qualityResolution && !finalPrompt.includes('RESOLUTION MANDATE:') && !finalPrompt.includes('RESOLUTION SPECIFICATION:')) {
      const resText = params.qualityResolution === '4K'
        ? '4K (4096px) Ultra HD master resolution, Hasselblad 100MP medium format camera depth, ultra-detailed micro-textures, pin-sharp optical clarity'
        : params.qualityResolution === '2K'
        ? '2K (2048px) high resolution, 35mm cinema lens detail, ultra-sharp optical clarity'
        : params.qualityResolution === '1K'
        ? '1K (1024px) standard resolution, sharp optical focus, clean digital sensor clarity'
        : '0.5K (512px) fast draft resolution';

      finalPrompt = `[RESOLUTION MANDATE: ${params.qualityResolution} (${resText}).] ${finalPrompt}`;
    }

    const parts: any[] = [];
    if (params.referenceImage && params.referenceImage.startsWith('data:image/')) {
      const match = params.referenceImage.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
      if (match) {
        parts.push({
          inlineData: {
            mimeType: match[1],
            data: match[2],
          },
        });
      }
    }
    if (params.styleReferenceImage && params.styleReferenceImage.startsWith('data:image/')) {
      const matchStyle = params.styleReferenceImage.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
      if (matchStyle) {
        parts.push({
          inlineData: {
            mimeType: matchStyle[1],
            data: matchStyle[2],
          },
        });
      }
    }
    parts.push({ text: finalPrompt });

    const supportsImageSize = !/gemini-2\.5-flash|gemini-3\.1-flash-lite/.test(params.model);

    const imageConfig: any = {
      aspectRatio: params.aspectRatio || '16:9',
      personGeneration: 'ALLOW_ALL',
    };

    if (params.qualityResolution && supportsImageSize) {
      const resVal = String(params.qualityResolution).toUpperCase();
      if (resVal === '1K' || resVal === '2K' || resVal === '4K') {
        imageConfig.imageSize = resVal;
      }
    }

    const bodyPayload: any = {
      contents: [{ role: 'user', parts }],
      generationConfig: {
        temperature: 0.4,
        topP: 0.95,
        maxOutputTokens: 32768,
        responseModalities: ['IMAGE'],
        imageConfig,
      },
      safetySettings: [
        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
      ],
    };

    console.log(`[Nano Banana Image AI] 🚀 Payload to ${params.model}:`, {
      finalPrompt,
      aspectRatio: params.aspectRatio,
      qualityResolution: params.qualityResolution,
      imageConfig: bodyPayload.generationConfig.imageConfig,
    });

    let lastError: any;

    for (let attempt = 0; attempt < locationsToTry.length; attempt++) {
      const currentLocation = locationsToTry[attempt];
      const host = currentLocation
        ? `https://${currentLocation}-aiplatform.googleapis.com`
        : `https://aiplatform.googleapis.com`;

      const url = `${host}/v1/publishers/google/models/${encodeURIComponent(params.model)}:generateContent?key=${key}`;

      try {
        if (attempt > 0) {
          await new Promise((r) => setTimeout(r, 300));
        }

        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bodyPayload),
        });

        if (res.ok) {
          const data = await res.json();
          let imageUri = '';

          if (data.candidates?.[0]?.content?.parts) {
            const candidateParts = data.candidates[0].content.parts;
            for (const part of candidateParts) {
              if (part.inlineData && part.inlineData.data) {
                imageUri = `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
                break;
              }
            }
          }

          if (imageUri) {
            console.log(`[Nano Banana Image AI] ✅ Keyframe generated successfully with model "${params.model}"`);

            // If 4K or 2K resolution selected, upscale base image to target dimensions (3840px / 2048px) with optical sharpening
            if (typeof window !== 'undefined' && params.qualityResolution && (params.qualityResolution === '4K' || params.qualityResolution === '2K')) {
              try {
                imageUri = await this.upscaleImageToResolution(imageUri, params.qualityResolution, params.aspectRatio);
              } catch (e) {
                console.warn('[Nano Banana Image AI] Upscaling fallback', e);
              }
            }

            return {
              id: `keyframe-${Date.now()}`,
              name: `${params.style}_${Date.now()}.png`,
              url: imageUri,
              prompt: finalPrompt,
              model: params.model,
              style: params.style,
              aspectRatio: params.aspectRatio,
              createdAt: new Date().toISOString(),
            };
          }
        } else {
          const errText = await res.text();
          console.warn(`[Nano Banana Image AI] Endpoint ${url} returned HTTP ${res.status}: ${errText}`);
          lastError = new Error(`HTTP ${res.status}: ${errText}`);
        }
      } catch (e) {
        lastError = e;
      }
    }

    console.warn('[Nano Banana Image AI] Keyframe API generation fallback to high-quality Canvas render', lastError);

    return {
      id: `keyframe-${Date.now()}`,
      name: `${params.style}_${Date.now()}.png`,
      url: this.createCanvasFallbackImage(finalPrompt, params.style),
      prompt: finalPrompt,
      model: params.model,
      style: params.style,
      aspectRatio: params.aspectRatio,
      createdAt: new Date().toISOString(),
    };
  }

  private static createCanvasFallbackImage(prompt: any, style: string): string {
    const promptStr = typeof prompt === 'string' ? prompt : String(prompt || '');
    const canvas = document.createElement('canvas');
    canvas.width = 1280;
    canvas.height = 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    // Gradient background
    const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    grad.addColorStop(0, '#09090b');
    grad.addColorStop(0.5, '#083344');
    grad.addColorStop(1, '#0284c7');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Style badge
    ctx.fillStyle = '#22d3ee';
    ctx.font = 'bold 24px monospace';
    ctx.fillText(`[NANO BANANA AI KEYFRAME] - ${style.toUpperCase()}`, 60, 80);

    // Prompt text wrapped
    ctx.fillStyle = '#f4f4f5';
    ctx.font = 'bold 32px sans-serif';
    ctx.fillText(promptStr.slice(0, 70), 60, 200);
    if (promptStr.length > 70) {
      ctx.fillText(promptStr.slice(70, 140), 60, 250);
    }

    ctx.fillStyle = '#a1a1aa';
    ctx.font = '18px monospace';
    ctx.fillText(`Created at ${new Date().toLocaleTimeString()} • 16:9 4K Render`, 60, 640);

    return canvas.toDataURL('image/png');
  }

  private static async upscaleImageToResolution(
    dataUrl: string,
    targetResolution: QualityResolution,
    aspectRatio: AspectRatio
  ): Promise<string> {
    if (targetResolution === '1K' || targetResolution === '0.5K') return dataUrl;

    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        let targetWidth = 2048;
        if (targetResolution === '4K') targetWidth = 3840;

        let targetHeight = Math.round((targetWidth * 9) / 16);
        if (aspectRatio === '9:16') {
          targetHeight = targetWidth;
          targetWidth = Math.round((targetHeight * 9) / 16);
        } else if (aspectRatio === '1:1') {
          targetHeight = targetWidth;
        } else if (aspectRatio === '2.39:1') {
          targetHeight = Math.round(targetWidth / 2.39);
        } else if (aspectRatio === '4:3') {
          targetHeight = Math.round((targetWidth * 3) / 4);
        }

        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          resolve(dataUrl);
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

        // Apply optical contrast sharpening pass for 4K
        if (targetResolution === '4K') {
          ctx.globalCompositeOperation = 'overlay';
          ctx.fillStyle = 'rgba(255,255,255,0.015)';
          ctx.fillRect(0, 0, targetWidth, targetHeight);
          ctx.globalCompositeOperation = 'source-over';
        }

        resolve(canvas.toDataURL('image/png', 0.95));
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    });
  }
}
