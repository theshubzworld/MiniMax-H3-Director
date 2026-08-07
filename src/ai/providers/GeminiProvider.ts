import { AIProvider, StoryboardParams } from '../interfaces/AIProvider';
import { VisualDNA } from '../../types/visualDna';
import { StudioProject } from '../../types/project';
import { Shot, CameraMotionType, CameraAmplitude, CameraSpeed, ShotTransition } from '../../types/shot';
import { AudioSettings } from '../../types/audio';

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
    const key = this.getEffectiveApiKey(apiKey);
    const shotDuration = Math.max(1, Number((params.durationSeconds / params.shotsCount).toFixed(2)));
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

    const promptText = `You are an AI Video Director creating a continuous ${params.shotsCount}-shot storyboard JSON for a ${params.narrativeStyle} video based on: "${params.idea}".

${modeInstruction}
${imageInstruction}

Audio & Dialogue Guidelines:
- If dialogue or narration is requested in the story idea, write short, original spoken lines (1 to ${maxWordsPerShot} words max per shot) so voiceovers sound natural and unhurried (~2.5 words/sec).
- Assign a unique speakerId (S1, S2, etc.) to each vocal source, and specify their distinct character identity (e.g. S1: "The man", S2: "The woman") so every dialogue line clearly identifies who is speaking.
- Include realistic foley soundscape layers and a matching background music score.

Return JSON format:
{
  "shots": [
    {
      "camera": { "motionType": "Push In", "amplitude": "small amplitude", "speed": "slow speed", "targetSubject": "her eyes" },
      "character": { "speakerId": "S1", "identity": "The protagonist", "pose": "standing stance", "expression": "focused glare", "motion": "slowly turns head" },
      "environment": { "location": "cinematic setting", "lighting": "dramatic lighting", "weather": "clear", "timeOfDay": "twilight", "atmosphere": "tense" },
      "rawActionDescription": "Action prose tailored to story idea.",
      "dialogue": { "hasDialogue": true, "speakerId": "S1", "languageTag": "English", "dialogueText": "Spoken line matching story idea.", "isOffScreenVoiceover": true }
    }
  ],
  "audio": {
    "isSilent": false,
    "soundscapeLayers": [
      { "category": "weather", "description": "Atmospheric ambient soundscape.", "enabled": true }
    ],
    "music": {
      "hasMusic": true,
      "genreStyle": "${params.narrativeStyle}",
      "instrumentation": ["piano", "strings"],
      "tempo": "normal",
      "dynamics": "building",
      "rhythmPattern": "flowing",
      "layeringDescription": "Ambient pad underneath."
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
      const data = await this.callVertexExpress(payload, key, params.directorModel);
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
              speakerId: s.character?.speakerId || 'S1',
              identity: s.character?.identity || `The ${params.narrativeStyle} protagonist`,
              pose: s.character?.pose || matrixChar.pose,
              expression: s.character?.expression || matrixChar.expression,
              motion: s.character?.motion || matrixChar.motion,
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

        return {
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
