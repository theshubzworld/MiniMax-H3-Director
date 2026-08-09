import { AIProvider, StoryboardParams } from '../interfaces/AIProvider';
import { VisualDNA } from '../../types/visualDna';
import { StudioProject } from '../../types/project';
import { Shot, CameraMotionType, CameraAmplitude, CameraSpeed, ShotTransition } from '../../types/shot';
import { AudioSettings } from '../../types/audio';
import { TitleGenerator } from '../../engine/TitleGenerator';

interface CameraPreset {
  motionType: CameraMotionType;
  amplitude: CameraAmplitude;
  speed: CameraSpeed;
  defaultTransition: ShotTransition;
}

const CAMERA_MOTION_MATRIX: CameraPreset[] = [
  { motionType: 'Push In', amplitude: 'small amplitude', speed: 'slow speed', defaultTransition: 'cut' },
  { motionType: 'Tracking Shot', amplitude: 'medium amplitude', speed: 'normal speed', defaultTransition: 'cut' },
  { motionType: 'Arc Shot', amplitude: 'large amplitude', speed: 'slow speed', defaultTransition: 'cross-dissolve' },
  { motionType: 'Pedestal Up', amplitude: 'medium amplitude', speed: 'normal speed', defaultTransition: 'cut' },
  { motionType: 'Tilt Up', amplitude: 'small amplitude', speed: 'slow speed', defaultTransition: 'wipe' },
  { motionType: 'Pull Out', amplitude: 'large amplitude', speed: 'slow speed', defaultTransition: 'cross-dissolve' },
];

const CHARACTER_POSE_MATRIX = [
  { pose: 'heroic opening stance', expression: 'intense focus', motion: 'stands grounded facing the camera' },
  { pose: 'dynamic forward stride', expression: 'determined glare', motion: 'moves swiftly across the scene' },
  { pose: 'reaching outward gesture', expression: 'awe and realization', motion: 'turns 90 degrees gracefully' },
  { pose: 'low combat stance', expression: 'fierce concentration', motion: 'draws weapon in fluid motion' },
  { pose: 'looking back over shoulder', expression: 'mysterious smirk', motion: 'glances backward towards key light' },
  { pose: 'final resolution stance', expression: 'calm triumph', motion: 'freezes in dramatic silhouette' },
];

const GENRE_LIGHTING_MATRIX: Record<string, string[]> = {
  'Live-Action Realism': ['natural soft window light', 'authentic 35mm practical lamp glow', 'subtle realistic golden hour sun falloff'],
  'Cinematic Film': ['dramatic 35mm anamorphic key light', 'moody chiaroscuro shadow falloff', 'soft warm tungsten fill'],
  Anime: ['neon cyan and magenta key backlight', 'dramatic high-contrast rim light', 'volumetric atmospheric sunbeams'],
  Fashion: ['soft diffuse studio lighting', 'warm golden hour glow', 'high-key minimalist backlight'],
  Action: ['strobing emergency alert lights', 'fiery orange and deep shadow contrast', 'harsh industrial spotlight'],
  Commercial: ['clean balanced 3-point daylight', 'crisp product rim lighting', 'soft natural window fill'],
  Documentary: ['authentic ambient golden sunlight', 'overcast moody diffusion', 'soft morning mist light'],
  'Sultry Romance': ['soft warm candlelit glow', 'sensual low-key tungsten side lighting', 'intimate golden hour window falloff with soft shadows'],
  'Sensual Intimacy': ['dim romantic lamplight', 'soft warm rim light tracing contours', 'moody bedroom twilight with candle glow'],
  'Steamy Thriller': ['steamy neon magenta backlight', 'intimate low-key shadow contrast', 'wet skin golden key reflections'],
  'Velvet Boudoir': ['soft velvet boudoir lamp diffusion', 'golden amber key lighting', 'warm shadow falloff'],
  'Erotic Romance': ['dim candlelit silhouette glow', 'warm intimate side lighting', 'soft atmospheric twilight key'],
  'Raw Smartphone Amateur': ['direct mobile phone flash blowout', 'natural unpolished ambient room light', 'casual indoor window light with slight overexposure'],
  'Raw Home Amateur Mobile': ['authentic unpolished bedroom lamp light', 'direct smartphone flash blowout', 'casual indoor room ambient illumination with subtle sensor noise'],
  'Amateur Mobile Vlog': ['handheld daylight selfie lighting', 'casual outdoor golden sun flare', 'everyday ambient room light'],
  'Candid Selfie Motion': ['dim mobile phone screen glow', 'soft ambient bedroom lamp light', 'authentic Instagram story flash'],
  'Raw Third-Person Mobile': ['backlit golden hour window illumination illuminating sheer fabric', 'natural unpolished handheld 3rd-person tracking light', 'soft ambient room illumination'],
  'Candid Third-Person Sensual': ['translucent silhouette rim lighting', 'warm low-key tungsten side light tracing sheer wardrobe contours', 'candlelit boudoir glow'],
  'None': ['natural ambient room lighting', 'authentic environmental light', 'soft unpolished lighting'],
};

export const NARRATIVE_STYLE_DIRECTIVES: Record<string, string> = {
  'None': '',
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

export class GeminiProvider implements AIProvider {
  public id = 'gemini';
  public name = 'Google Vertex AI Express / Gemini (2.5 Pro / 3.5 Flash / 2.5 Flash)';

  // Models ordered with gemini-2.5-pro as primary, gemini-3.5-flash and flash models as 429 failover
  private models = ['gemini-2.5-pro', 'gemini-3.5-flash', 'gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-pro', 'gemini-1.5-flash'];

  private getEffectiveApiKey(apiKey?: string): string {
    let key = apiKey && apiKey.trim().length > 0 ? apiKey.trim() : '';
    if (!key) {
      key = (localStorage.getItem('minimax_gemini_api_key') || '').trim();
    }
    if (!key) {
      key = (import.meta.env.VITE_GEMINI_API_KEY || '').trim();
    }
    return key;
  }

  private extractJsonObject(text: string): any {
    const t = String(text || '').trim();
    if (!t) return null;

    try {
      return JSON.parse(t);
    } catch {
      const match = t.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
      if (match) {
        try {
          return JSON.parse(match[0]);
        } catch {
          return null;
        }
      }
      return null;
    }
  }

  /**
   * Helper to convert image URL to inlineData for Gemini Multimodal Vision requests.
   */
  private async prepareImageParts(images?: string[]): Promise<any[]> {
    if (!images || images.length === 0) return [];
    const parts: any[] = [];

    for (const url of images) {
      if (url.startsWith('data:image/')) {
        const match = url.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
        if (match) {
          parts.push({
            inlineData: {
              mimeType: match[1],
              data: match[2],
            },
          });
        }
      } else if (url.startsWith('http') || url.startsWith('blob:')) {
        try {
          const res = await fetch(url);
          const blob = await res.blob();
          const base64Data = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              const dataUrl = reader.result as string;
              const base64 = dataUrl ? dataUrl.split(',')[1] : null;
              if (base64) resolve(base64);
              else reject(new Error('Failed to parse base64 from FileReader'));
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });

          parts.push({
            inlineData: {
              mimeType: blob.type || 'image/png',
              data: base64Data,
            },
          });
        } catch (e) {
          console.warn('[Gemini Vision] Failed to fetch image URL for inlineData, skipping image part', e);
        }
      }
    }

    return parts;
  }

  /**
   * Public helper to run text prompt requests through Vertex Express with rate limit failover.
   */
  public async callTextPrompt(promptText: string, apiKey?: string, directorModel?: string): Promise<string> {
    const key = this.getEffectiveApiKey(apiKey);
    const payload = {
      contents: [{ role: 'user', parts: [{ text: promptText }] }],
      generationConfig: { temperature: 0.7 },
    };

    const res = await this.callVertexExpress(payload, key, directorModel);
    const candidateText = res.candidates?.[0]?.content?.parts?.[0]?.text || '';
    return candidateText.trim();
  }

  /**
   * Public helper to run multimodal (image + text) prompt requests through Vertex Express with rate limit failover.
   */
  public async callMultimodalPrompt(promptText: string, images?: string[], apiKey?: string, directorModel?: string): Promise<string> {
    const key = this.getEffectiveApiKey(apiKey);
    const imageParts = await this.prepareImageParts(images);
    const parts = [...imageParts, { text: promptText }];
    const payload = {
      contents: [{ role: 'user', parts }],
      generationConfig: { temperature: 0.7 },
    };

    const res = await this.callVertexExpress(payload, key, directorModel);
    const candidateText = res.candidates?.[0]?.content?.parts?.[0]?.text || '';
    return candidateText.trim();
  }

  /**
   * Vertex AI Express REST API caller with smart endpoint routing:
   * - gemini-3.5-* / gemini-3.1-* / gemini-3-pro → global endpoint only (no regional prefix)
   * - gemini-2.5-pro → regional failover
   * - all others → regional failover
   * Matches InstaDNA's proven callVertexExpress routing logic.
   */
  private async callVertexExpress(payload: any, apiKey: string, modelOverride?: string): Promise<any> {
    const regionalFallbacks = ['us-central1', 'us-east4', 'us-west1', 'europe-west1', 'europe-west4'];
    const modelsToUse = modelOverride ? [modelOverride, ...this.models.filter(m => m !== modelOverride)] : this.models;

    const safetySettings = [
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
    ];

    const bodyPayload = { ...payload, safetySettings };
    let lastError: any;

    for (const model of modelsToUse) {
      // gemini-3.5-*, gemini-3.1-*, gemini-3-pro → global endpoint ONLY (no regional prefix)
      const isGlobalOnly = /gemini-3\.5-|gemini-3\.1-|gemini-3-pro/.test(model);

      let locationsToTry: string[];
      if (isGlobalOnly) {
        locationsToTry = ['']; // empty string = global endpoint
      } else {
        locationsToTry = ['us-central1', ...regionalFallbacks.filter(r => r !== 'us-central1')];
      }
      // Deduplicate
      locationsToTry = [...new Set(locationsToTry)];

      for (let attempt = 0; attempt < locationsToTry.length; attempt++) {
        const loc = locationsToTry[attempt];
        const host = loc
          ? `https://${loc}-aiplatform.googleapis.com`
          : `https://aiplatform.googleapis.com`;
        const url = `${host}/v1/publishers/google/models/${encodeURIComponent(model)}:generateContent?key=${apiKey}`;

        try {
          if (attempt > 0) {
            const delay = Math.min(1000, Math.pow(2, attempt) * 200);
            await new Promise((r) => setTimeout(r, delay));
          }

          const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bodyPayload),
          });

          if (res.status === 429) {
            console.warn(`[Gemini API] Rate limited (429) on model "${model}". Escalating to fallback model...`);
            lastError = new Error(`Rate limited (429) on ${model}`);
            break; // Escalate immediately to next fallback model
          }

          if (res.ok) {
            const data = await res.json();
            console.log(`[Gemini API] ✅ Success using model "${model}" via ${new URL(url).hostname}`);
            return data;
          } else {
            console.warn(`[Gemini API] ${model} returned HTTP ${res.status} from ${new URL(url).hostname}`);
            lastError = new Error(`HTTP ${res.status} from ${new URL(url).hostname}`);
          }
        } catch (e) {
          lastError = e;
        }
      }
    }

    throw lastError || new Error(`Gemini API request failed across models: ${modelsToUse.join(', ')}`);
  }

  public async analyzeVisualDNA(images: string[], apiKey?: string): Promise<VisualDNA> {
    if (!images || images.length === 0) {
      return this.getMockVisualDNA();
    }

    const key = this.getEffectiveApiKey(apiKey);
    const imageParts = await this.prepareImageParts(images);

    const payload = {
      contents: [
        {
          role: 'user',
          parts: [
            ...imageParts,
            {
              text: `Inspect the attached reference keyframe image(s) and extract visual attributes into JSON strictly formatted as:
{
  "identity": { "faceShape": "...", "hairStyle": "...", "hairColor": "...", "wardrobe": "...", "expression": "..." },
  "environment": { "location": "...", "lighting": "...", "weather": "...", "timeOfDay": "..." },
  "cinematography": { "cameraAngle": "...", "composition": "...", "lightingPalette": "...", "mood": "..." }
}`,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.2,
        responseMimeType: 'application/json',
      },
    };

    try {
      const data = await this.callVertexExpress(payload, key);
      const allParts = data.candidates?.[0]?.content?.parts || [];
      const rawText = allParts.map((p: any) => p.text || '').join('\n').trim();
      const parsed = this.extractJsonObject(rawText);

      if (parsed) {
        return {
          identity: parsed.identity || {},
          environment: parsed.environment || {},
          cinematography: parsed.cinematography || {},
        };
      }
    } catch (err) {
      console.warn('[Vertex AI] Visual DNA analysis failed, using mock fallback', err);
    }

    return this.getMockVisualDNA();
  }

  public async generateStoryboard(params: StoryboardParams, apiKey?: string): Promise<Partial<StudioProject>> {
    params.onProgress?.({ step: 1, totalSteps: 4, percent: 15, message: 'Connecting to Vertex AI Express API...' });
    const key = this.getEffectiveApiKey(apiKey);
    const shotDuration = Math.max(1, Number((params.durationSeconds / params.shotsCount).toFixed(2)));

    params.onProgress?.({ step: 2, totalSteps: 4, percent: 35, message: `Preparing keyframe images & ${params.narrativeStyle} directives...` });
    const imageParts = await this.prepareImageParts(params.images);

    const isCreative = params.referenceMode === 'creative';
    const maxWordsPerShot = Math.max(4, Math.floor(shotDuration * 2.8));

    const imageInstruction = params.images && params.images.length > 0
      ? isCreative
        ? `Reference Image (<Picture 1>): Use <Picture 1> for character identity. You may place the character into a new setting or outfit requested by the idea ("${params.idea}").`
        : `Reference Image (<Picture 1>): Use <Picture 1> for character appearance, outfit, and starting location. Refer to the character as "the subject from <Picture 1>". If <Picture 1> is a multi-panel grid image, draw character poses and action beats directly from the panels.`
      : '';

    const modeInstruction = params.mode === 'I2VA'
      ? `Mode: Image-to-Video. Shot 1 starts from <Picture 1> at 0.00s.`
      : params.mode === 'FL2VA'
      ? `Mode: First-Last Keyframe. Shot 1 aligns with <Picture 1>, and Shot ${params.shotsCount} ends at <Picture 2>.`
      : params.mode === 'L2VA'
      ? `Mode: Last-Frame. Shot ${params.shotsCount} ends at <Picture 1>.`
      : `Mode: Text-to-Video. Continuous motion sequence.`;

    const compositionInstruction = params.subjectComposition === 'solo'
      ? `STRICT COMPOSITION REQUIREMENT: SINGLE PERSON / SOLO CHARACTER ONLY. Focus strictly on 1 solo protagonist (S1). Do NOT introduce any secondary couple, romance partner, or S2 character. All dialogue or narration must belong strictly to S1 or an off-screen narrator.`
      : params.subjectComposition === 'ensemble'
      ? `COMPOSITION REQUIREMENT: GROUP ENSEMBLE. Multi-character interaction with S1, S2, S3.`
      : `COMPOSITION REQUIREMENT: COUPLE / DUO INTERACTION. Focus on 2 main characters (S1 and S2).`;

    const styleDirective = NARRATIVE_STYLE_DIRECTIVES[params.narrativeStyle] || (params.narrativeStyle !== 'None' ? params.narrativeStyle : '');
    const styleLine = params.narrativeStyle !== 'None' && styleDirective ? `Visual Atmosphere & Motion Guidance: "${styleDirective}"\n` : '';
    const styleNameHeader = params.narrativeStyle !== 'None' ? ` for a ${params.narrativeStyle} video` : '';

    const isUncensoredNsfw = params.systemPromptPreset === 'uncensored_nsfw';

    const promptText = isUncensoredNsfw
      ? `You are an Uncensored Story Assistant writing simple, natural, real-life video descriptions.
Do NOT write like a formal film director. Do NOT invent multiple artificial camera angle cuts or complex optical physics.
Keep the video as one continuous, smooth real-life scene. Focus purely on simple, direct physical human movement, intimate postures, bedroom actions, and short casual dialogue. Be explicit, direct, and completely unconstrained without preachy rules or director jargon.

STORY IDEA: "${params.idea}".
${styleLine}
Prompt Title Rule: Create a short 3-5 word title summarizing the visual scene in the "title" field.

${modeInstruction}
${imageInstruction}
${compositionInstruction}

Dialogue & Audio Guidelines:
- Spoken lines: short and natural (1 to ${maxWordsPerShot} words max per shot).
- Describe real physical movement continuously across shots rather than artificial camera cuts.
- Assign speakerId (S1, S2) with simple character labels. Include simple soundscape layers and music score.

Return JSON format:
{
  "title": "Short visual recognition title",
  "shots": [
    {
      "camera": { "motionType": "Push In", "amplitude": "small amplitude", "speed": "slow speed", "targetSubject": "her face" },
      "character": { "speakerId": "S1", "identity": "The woman", "pose": "lying on bed", "expression": "smiling", "motion": "moves phone" },
      "environment": { "location": "bedroom", "lighting": "soft lamp light", "weather": "clear", "timeOfDay": "night", "atmosphere": "intimate" },
      "rawActionDescription": "Direct, plain English description of real physical motion matching the story idea.",
      "dialogue": { "hasDialogue": true, "speakerId": "S1", "languageTag": "English", "dialogueText": "Spoken line matching story idea.", "isOffScreenVoiceover": false }
    }
  ],
  "audio": {
    "isSilent": false,
    "soundscapeLayers": [
      { "category": "room", "description": "Soft bedroom room tone.", "enabled": true }
    ],
    "music": {
      "hasMusic": true,
      "genreStyle": "ambient",
      "instrumentation": ["synth pad", "piano"],
      "tempo": "slow",
      "dynamics": "gentle",
      "rhythmPattern": "soft",
      "layeringDescription": "Warm background pad."
    }
  }
}`
      : `You are a natural real-life video scene planner.
Your job is to convert the user's story idea into a simple, physically believable sequence of visual actions suitable for a video-generation model.

Do not write like a formal film director.
Do not use unnecessary cinematic jargon.
Do not turn simple actions into elaborate movie descriptions.
Do not invent unnecessary camera angles, cuts, transitions, or optical effects.

The video should feel like one continuous real-life scene. Characters should move naturally and continuously from one action to the next.

STORY IDEA: "${params.idea}".

${styleLine}
${modeInstruction}
${imageInstruction}
${compositionInstruction}

CORE SCENE RULES:

1. CONTINUOUS ACTION
Describe a continuous sequence of physical actions.
Each shot represents a sequential moment or action beat, NOT necessarily a camera cut.
Do not introduce cuts unless the user explicitly requests them.

2. REALISTIC HUMAN MOVEMENT
Use simple, observable physical actions:
walking, sitting, turning, looking, reaching, touching an object, adjusting clothing, moving closer, stepping back, smiling, speaking, dancing, etc.
Avoid exaggerated, impossible, or mechanically repetitive movement.

3. NATURAL CAMERA
Camera movement should support the action rather than dominate it.
Use simple movements such as: static, handheld, slow push in, slow pull back, gentle tracking, slight pan, natural follow movement.
Do not invent dramatic camera movements unless they are appropriate to the user's idea.

4. VISUAL DESCRIPTION
Describe only what can actually be seen.
Do not explain internal thoughts, backstory, symbolism, or emotions that are not visually expressed.

5. CHARACTER CONSISTENCY
When reference images are provided, preserve the referenced character's identity and visible appearance.
Do not arbitrarily change face, hairstyle, clothing, body proportions, or other established visual characteristics.

6. ENVIRONMENT CONSISTENCY
Keep the same location, lighting, time of day, and environmental conditions unless the story explicitly requires a change.

7. DIALOGUE
Spoken lines should be short, natural, conversational, and appropriate for the available duration (1 to ${maxWordsPerShot} words max per shot).
Each spoken line must have: speakerId, languageTag, dialogueText, and whether it is off-screen.
Do not add dialogue unless it fits the story.

8. AUDIO
Describe simple environmental sounds that would naturally exist in the scene.
Music should only be included when appropriate to the user's idea or requested style.

9. NO UNNECESSARY INVENTION
Do not add random characters, unexplained props, dramatic explosions, unnecessary camera cuts, or artificial visual effects.

10. ACTION CONTINUITY
The ending state of each shot must logically match the beginning state of the next shot. Do not reset the character's position between shots.

PROMPT TITLE RULE:
Create a short 3-5 word title describing the main visual scene in the "title" field.

RETURN ONLY VALID JSON:
{
  "title": "Short visual recognition title",
  "shots": [
    {
      "camera": {
        "motionType": "natural handheld",
        "amplitude": "subtle",
        "speed": "natural",
        "targetSubject": "the protagonist"
      },
      "character": {
        "speakerId": "S1",
        "identity": "The protagonist",
        "pose": "sitting stance",
        "expression": "soft smile",
        "motion": "looks at the screen"
      },
      "environment": {
        "location": "bedroom",
        "lighting": "soft lamp light",
        "weather": "clear",
        "timeOfDay": "night",
        "atmosphere": "quiet and intimate"
      },
      "rawActionDescription": "Direct, plain English description of the physical action occurring in this moment.",
      "dialogue": {
        "hasDialogue": false,
        "speakerId": "S1",
        "languageTag": "English",
        "dialogueText": "",
        "isOffScreenVoiceover": false
      }
    }
  ],
  "audio": {
    "isSilent": false,
    "soundscapeLayers": [
      {
        "category": "room",
        "description": "Soft room tone.",
        "enabled": true
      }
    ],
    "music": {
      "hasMusic": false,
      "genreStyle": "",
      "instrumentation": [],
      "tempo": "",
      "dynamics": "",
      "rhythmPattern": "",
      "layeringDescription": ""
    }
  }
}`;

    const temp = params.temperature ?? (params.directorMode === 'strict' ? 0.2 : params.directorMode === 'creative' ? 0.8 : 0.4);
    const thinkingBudget = params.thinkingBudget !== undefined ? params.thinkingBudget : 4096;

    const generationConfig: any = {
      temperature: temp,
      responseMimeType: 'application/json',
    };

    if (thinkingBudget > 0) {
      generationConfig.thinkingConfig = {
        thinkingBudget,
      };
    }

    const payload = {
      contents: [
        {
          role: 'user',
          parts: [...imageParts, { text: promptText }],
        },
      ],
      generationConfig,
    };

    try {
      params.onProgress?.({ step: 3, totalSteps: 4, percent: 65, message: `Reasoning with ${params.directorModel || 'Gemini 2.5 Pro'} to compile ${params.shotsCount} shots...` });
      const data = await this.callVertexExpress(payload, key, params.directorModel);
      params.onProgress?.({ step: 4, totalSteps: 4, percent: 95, message: 'Parsing structured H3 JSON payload & audio soundscape...' });
      const allParts = data.candidates?.[0]?.content?.parts || [];
      const rawText = allParts.map((p: any) => p.text || '').join('\n').trim();
      const parsed = this.extractJsonObject(rawText);

      if (parsed && parsed.shots && Array.isArray(parsed.shots)) {
        let currentTime = 0;
        const apiShots: Shot[] = parsed.shots.map((s: any, idx: number) => {
          const matrixCam = CAMERA_MOTION_MATRIX[idx % CAMERA_MOTION_MATRIX.length];
          const matrixChar = CHARACTER_POSE_MATRIX[idx % CHARACTER_POSE_MATRIX.length];
          const lightingList = GENRE_LIGHTING_MATRIX[params.narrativeStyle] || GENRE_LIGHTING_MATRIX['Anime'];

          const isLast = idx === params.shotsCount - 1;
          const currentDuration = isLast
            ? Math.max(0.5, Number((params.durationSeconds - currentTime).toFixed(2)))
            : shotDuration;

          const charData = (Array.isArray(s.characters) && s.characters.length > 0) ? s.characters[0] : (s.character || {});

          const shotObj: Shot = {
            id: `shot-ai-${idx + 1}`,
            shotNumber: idx + 1,
            startTimeSeconds: Number(currentTime.toFixed(2)),
            durationSeconds: currentDuration,
            transitionToNext: matrixCam.defaultTransition,
            camera: {
              motionType: s.camera?.motionType || matrixCam.motionType,
              amplitude: s.camera?.amplitude || matrixCam.amplitude,
              speed: s.camera?.speed || matrixCam.speed,
              targetSubject: s.camera?.targetSubject || 'the primary hero',
            },
            character: {
              speakerId: charData.speakerId || 'S1',
              identity: charData.identity || (params.narrativeStyle !== 'None' ? `The ${params.narrativeStyle} protagonist` : 'The protagonist'),
              pose: charData.pose || matrixChar.pose,
              expression: charData.expression || matrixChar.expression,
              motion: charData.motion || matrixChar.motion,
            },
            environment: {
              location: s.environment?.location || `${params.narrativeStyle} setting`,
              lighting: s.environment?.lighting || lightingList[idx % lightingList.length],
              weather: s.environment?.weather || 'clear',
              timeOfDay: s.environment?.timeOfDay || 'dramatic twilight',
              atmosphere: s.environment?.atmosphere || 'cinematic tension',
            },
            dialogue:
              s.dialogue && (s.dialogue.hasDialogue || (s.dialogue.dialogueText && s.dialogue.dialogueText.trim().length > 0))
                ? {
                    hasDialogue: true,
                    speakerId: s.dialogue.speakerId || 'S1',
                    languageTag: s.dialogue.languageTag || 'English',
                    dialogueText: s.dialogue.dialogueText,
                    isOffScreenVoiceover: s.dialogue.isOffScreenVoiceover ?? true,
                    lipsClosedDuringVoiceover: s.dialogue.lipsClosedDuringVoiceover ?? false,
                    carriesAcrossCut: s.dialogue.carriesAcrossCut ?? false,
                  }
                : undefined,
            rawActionDescription:
              s.rawActionDescription ||
              `Shot ${idx + 1}: Character performs dramatic action fitting ${params.narrativeStyle} vision. ${params.idea}`,
          };

          currentTime += currentDuration;
          return shotObj;
        });

        const derivedTitle = parsed.title && parsed.title.trim().length > 0
          ? parsed.title.trim()
          : TitleGenerator.generateCinematicTitle(params.idea, params.narrativeStyle);

        return {
          name: derivedTitle,
          description: params.idea,
          shots: apiShots,
          audio: parsed.audio
            ? {
                isSilent: false,
                soundscapeLayers: parsed.audio.soundscapeLayers || [
                  { category: 'ambient', description: `Ambient acoustics for ${params.narrativeStyle}.`, enabled: true },
                ],
                music: parsed.audio.music || {
                  hasMusic: true,
                  genreStyle: params.narrativeStyle,
                  instrumentation: ['strings', 'synth bass'],
                  tempo: 'moderate',
                  dynamics: 'steady crescendo',
                  rhythmPattern: 'driving pulse',
                  layeringDescription: 'Ambient sub-bass layer.',
                },
              }
            : undefined,
        };
      }
    } catch (err) {
      console.warn('[Vertex AI] Multimodal Storyboard generation failed, using dynamic preset matrix fallback', err);
    }

    // Dynamic Preset Matrix Fallback
    const shots: Shot[] = [];
    const lightingList = GENRE_LIGHTING_MATRIX[params.narrativeStyle] || GENRE_LIGHTING_MATRIX['Anime'];
    let currentTime = 0;

    for (let i = 0; i < params.shotsCount; i++) {
      const num = i + 1;
      const cam = CAMERA_MOTION_MATRIX[i % CAMERA_MOTION_MATRIX.length];
      const char = CHARACTER_POSE_MATRIX[i % CHARACTER_POSE_MATRIX.length];
      const lighting = lightingList[i % lightingList.length];

      const isLast = i === params.shotsCount - 1;
      const currentDuration = isLast
        ? Math.max(0.5, Number((params.durationSeconds - currentTime).toFixed(2)))
        : shotDuration;

      shots.push({
        id: `shot-ai-${num}`,
        shotNumber: num,
        startTimeSeconds: Number(currentTime.toFixed(2)),
        durationSeconds: currentDuration,
        transitionToNext: cam.defaultTransition,
        camera: {
          motionType: cam.motionType,
          amplitude: cam.amplitude,
          speed: cam.speed,
          targetSubject: 'the primary hero',
        },
        character: {
          speakerId: 'S1',
          identity: `The ${params.narrativeStyle.toLowerCase()} hero`,
          pose: char.pose,
          expression: char.expression,
          motion: char.motion,
        },
        environment: {
          location: `${params.narrativeStyle} setting`,
          lighting,
          weather: 'clear',
          timeOfDay: 'dramatic twilight',
          atmosphere: 'high voltage',
        },
        rawActionDescription: `Shot ${num}: Performs dramatic action fitting ${params.narrativeStyle} vision. ${params.idea}`,
      });

      currentTime += currentDuration;
    }

    return {
      shots,
      audio: {
        isSilent: false,
        soundscapeLayers: [
          { category: 'ambient', description: `Natural room tone and ambient acoustics for ${params.narrativeStyle}.`, enabled: true },
        ],
        music: {
          hasMusic: true,
          genreStyle: params.narrativeStyle,
          instrumentation: ['strings', 'synth bass'],
          tempo: 'moderate',
          dynamics: 'steady buildup',
          rhythmPattern: 'driving rhythm',
          layeringDescription: 'Ambient pad underneath.',
        },
      },
    };
  }

  public async enhanceCamera(shots: Shot[], apiKey?: string): Promise<Shot[]> {
    const key = this.getEffectiveApiKey(apiKey);
    if (key) {
      try {
        const payload = {
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: `You are an expert 3D Cinematographer for MiniMax H3. Optimize camera movements for these ${shots.length} shots to maximize visual pacing.
Input shots: ${JSON.stringify(shots.map((s) => ({ shotNumber: s.shotNumber, action: s.rawActionDescription, camera: s.camera })))}

Return JSON array of camera objects matching:
[
  { "motionType": "Push In", "amplitude": "small amplitude", "speed": "slow speed", "targetSubject": "her trembling hands" }
]`,
                },
              ],
            },
          ],
          generationConfig: { temperature: 0.3, responseMimeType: 'application/json' },
        };
        const data = await this.callVertexExpress(payload, key);
        const rawText = (data.candidates?.[0]?.content?.parts || []).map((p: any) => p.text || '').join('\n');
        const parsed = this.extractJsonObject(rawText);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return shots.map((shot, idx) => ({
            ...shot,
            camera: {
              ...shot.camera,
              motionType: parsed[idx]?.motionType || shot.camera?.motionType || 'Push In',
              amplitude: parsed[idx]?.amplitude || shot.camera?.amplitude || 'small amplitude',
              speed: parsed[idx]?.speed || shot.camera?.speed || 'slow speed',
              targetSubject: parsed[idx]?.targetSubject || shot.camera?.targetSubject || 'the main subject',
            },
          }));
        }
      } catch (err) {
        console.warn('[Gemini] enhanceCamera AI call failed, using matrix fallback', err);
      }
    }

    return shots.map((shot, idx) => {
      const cam = CAMERA_MOTION_MATRIX[(idx + 1) % CAMERA_MOTION_MATRIX.length];
      return {
        ...shot,
        camera: {
          motionType: cam.motionType,
          amplitude: cam.amplitude,
          speed: cam.speed,
          targetSubject: shot.camera?.targetSubject || 'the main character',
        },
      };
    });
  }

  public async enhanceAudio(audio: AudioSettings, apiKey?: string): Promise<AudioSettings> {
    const key = this.getEffectiveApiKey(apiKey);
    if (key) {
      try {
        const payload = {
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: `You are an AI Audio Director. Enhance this stereo soundscape and non-diegetic music score for MiniMax H3 video generation.
Current audio: ${JSON.stringify(audio)}

Return JSON object:
{
  "customSoundscape": "Crisp room acoustic tone, subtle patter of rain against window glass, and low rhythmic metallic hum.",
  "genreStyle": "Cinematic Thriller",
  "instrumentation": ["low sub-bass drone", "dissonant violins", "ticking clock"],
  "tempo": "slow",
  "dynamics": "quietly building crescendo"
}`,
                },
              ],
            },
          ],
          generationConfig: { temperature: 0.3, responseMimeType: 'application/json' },
        };
        const data = await this.callVertexExpress(payload, key);
        const rawText = (data.candidates?.[0]?.content?.parts || []).map((p: any) => p.text || '').join('\n');
        const parsed = this.extractJsonObject(rawText);
        if (parsed && typeof parsed === 'object') {
          return {
            ...audio,
            customSoundscape: parsed.customSoundscape || audio.customSoundscape,
            music: {
              ...audio.music,
              genreStyle: parsed.genreStyle || audio.music?.genreStyle || 'Cinematic',
              instrumentation: parsed.instrumentation || audio.music?.instrumentation || ['strings'],
              tempo: parsed.tempo || audio.music?.tempo || 'moderate',
              dynamics: parsed.dynamics || audio.music?.dynamics || 'building crescendo',
            },
          };
        }
      } catch (err) {
        console.warn('[Gemini] enhanceAudio AI call failed, using preset fallback', err);
      }
    }

    return {
      ...audio,
      customSoundscape: 'Rich atmospheric soundscape with crisp acoustic details and immersive room tone.',
    };
  }

  private getMockVisualDNA(): VisualDNA {
    return {
      identity: {
        ageRange: '20s',
        genderPresentation: 'Female',
        faceShape: 'Sharp oval',
        hairStyle: 'Short bob',
        hairColor: 'Crimson red',
        wardrobe: 'High-tech leather jacket',
        expression: 'Determined glare',
      },
      environment: {
        location: 'Cyberpunk alleyway',
        lighting: 'Neon cyan and magenta backlight',
        weather: 'Steady rain',
        timeOfDay: 'Midnight',
      },
      cinematography: {
        cameraAngle: 'Low angle',
        composition: 'Rule of thirds close-up',
        lightingPalette: 'Cyan, Magenta, Black',
        mood: 'High-voltage suspense',
      },
    };
  }
}
