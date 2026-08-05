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
  Anime: ['neon cyan and magenta key backlight', 'dramatic high-contrast rim light', 'volumetric atmospheric sunbeams'],
  Fashion: ['soft diffuse studio lighting', 'warm golden hour glow', 'high-key minimalist backlight'],
  Action: ['strobing emergency alert lights', 'fiery orange and deep shadow contrast', 'harsh industrial spotlight'],
  Commercial: ['clean balanced 3-point daylight', 'crisp product rim lighting', 'soft natural window fill'],
  Documentary: ['authentic ambient golden sunlight', 'overcast moody diffusion', 'soft morning mist light'],
};

export class GeminiProvider implements AIProvider {
  public id = 'gemini';
  public name = 'Google Vertex AI Express / Gemini (3.5 Flash / 2.5 Flash / 2.5 Pro)';

  // Models ordered matching Reference InstaDNA: high-speed 3.5 Flash / 2.5 Flash first (0 rate limits), 2.5 Pro as fallback
  private models = ['gemini-3.5-flash', 'gemini-2.5-flash', 'gemini-2.5-pro'];

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
      const p = JSON.parse(t);
      if (Array.isArray(p)) return p.find((x) => x && typeof x === 'object') || null;
      if (p && typeof p === 'object') return p;
    } catch {
      /* ignore */
    }

    const fenced = t.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    const candidate = fenced ? fenced[1] : t;
    try {
      const p = JSON.parse(candidate.trim());
      if (Array.isArray(p)) return p.find((x) => x && typeof x === 'object') || null;
      if (p && typeof p === 'object') return p;
    } catch {
      /* ignore */
    }

    const first = candidate.indexOf('{');
    const last = candidate.lastIndexOf('}');
    if (first < 0 || last <= first) return null;
    try {
      return JSON.parse(candidate.slice(first, last + 1));
    } catch {
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
      } else if (url.startsWith('http')) {
        try {
          const res = await fetch(url);
          const blob = await res.blob();
          const buffer = await blob.arrayBuffer();
          const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
          parts.push({
            inlineData: {
              mimeType: blob.type || 'image/png',
              data: base64,
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
   * Vertex AI Express REST API caller with 429 Rate-Limit region failover matching Reference InstaDNA gemini.js
   */
  private async callVertexExpress(payload: any, apiKey: string): Promise<any> {
    const regionalFallbacks = ['us-central1', 'us-east4', 'us-west1', 'europe-west1', 'europe-west4'];

    const safetySettings = [
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
    ];

    const bodyPayload = { ...payload, safetySettings };
    let lastError: any;

    for (const model of this.models) {
      const isGlobalOnly = /gemini-3\.5-|gemini-3\.1-|gemini-3-/.test(model);
      const locationsToTry = isGlobalOnly ? [''] : ['us-central1', ...regionalFallbacks];

      for (let attempt = 0; attempt < locationsToTry.length; attempt++) {
        const currentLocation = locationsToTry[attempt];
        const host = currentLocation
          ? `https://${currentLocation}-aiplatform.googleapis.com`
          : `https://aiplatform.googleapis.com`;

        const url = `${host}/v1/publishers/google/models/${encodeURIComponent(model)}:generateContent?key=${apiKey}`;

        try {
          if (attempt > 0) {
            const delay = Math.pow(2, attempt) * 400;
            console.warn(`[Vertex AI] Retrying at failover location "${currentLocation || 'global'}" in ${delay}ms...`);
            await new Promise((r) => setTimeout(r, delay));
          }

          const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bodyPayload),
          });

          if (res.status === 429) {
            console.warn(`[Vertex AI] Rate limited (429) on ${model} at location "${currentLocation || 'global'}". Escalating model...`);
            lastError = new Error(`Rate limited (429) on ${model} at ${currentLocation || 'global'}`);
            break; // Immediately break location loop to escalate to next model (3.5 Flash -> 2.5 Flash -> 2.5 Pro)
          }

          if (res.ok) {
            const data = await res.json();
            console.log(`[Vertex AI] ✅ Success at ${url} (model: ${model})`);
            return data;
          } else {
            console.warn(`[Vertex AI] ${model} at ${currentLocation || 'global'} returned ${res.status}`);
          }
        } catch (e) {
          lastError = e;
        }
      }
    }

    throw lastError || new Error(`Vertex AI request failed across endpoints for models ${this.models.join(', ')}`);
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
    const imageRuleText = params.images && params.images.length > 0
      ? isCreative
        ? `CRITICAL I2V CREATIVE IDENTITY MODE RULES:
Inspect the attached keyframe image(s) (Picture 1).
- Picture 1 is used STRICTLY for character identity, face shape, and hair style.
- You ARE ALLOWED to re-place the character into a NEW environment, wardrobe, and lighting requested by the user's idea ("${params.idea}") and style ("${params.narrativeStyle}").`
        : `CRITICAL I2V STRICT KEYFRAME MODE RULES:
Inspect the attached keyframe image(s) (Picture 1).
- Picture 1 is the AUTHORITATIVE SOURCE OF TRUTH for: subject identity, face, hair, clothing, accessories, location, background, lighting, and composition.
- Shot 1 MUST begin EXACTLY from Picture 1.
- DO NOT invent specific hair color, hair style, or clothing text descriptions (e.g. "brown hair tied back", "wearing a beige sweater"). Refer to the character strictly as "the subject from <Picture 1>" or "the woman from <Picture 1>" so Picture 1 provides 100% of her visual identity.
- The narrative genre (${params.narrativeStyle}) MUST ONLY influence physical action, camera movement, atmosphere, events, and audio—NOT the starting room, wardrobe, or lighting of Shot 1.`
      : '';

    const promptText = `You are an AI Video Director for MiniMax H3.
Generate a complete, structured ${params.shotsCount}-shot storyboard JSON for a ${params.narrativeStyle} video in ${params.mode} mode based on idea: "${params.idea}".
${imageRuleText}

You MUST auto-generate ALL fields for ALL ${params.shotsCount} shots:
1. camera: { motionType (Push In/Pull Out/Arc Shot/Tracking Shot/etc), amplitude (small amplitude/medium amplitude/large amplitude), speed (slow speed/normal speed/fast speed), targetSubject }
2. character: { speakerId ("S1"), identity, pose, expression, motion }
3. environment: { location, lighting, weather, timeOfDay, atmosphere }
4. rawActionDescription: Cinematic, highly descriptive action prose unique for every shot while keeping character identity consistent.
5. audio: Soundscape layers and background music score.

Return JSON format:
{
  "shots": [
    {
      "camera": { "motionType": "Push In", "amplitude": "small amplitude", "speed": "slow speed", "targetSubject": "her glowing cybernetic eyes" },
      "character": { "speakerId": "S1", "identity": "The cyborg warrior", "pose": "low combat stance", "expression": "intense glare", "motion": "slowly raises plasma katana" },
      "environment": { "location": "rain-soaked alleyway", "lighting": "cyan neon signs", "weather": "heavy rain", "timeOfDay": "midnight", "atmosphere": "gritty suspense" },
      "rawActionDescription": "Raindrops sizzle as they strike her energized katana edge."
    }
  ],
  "audio": {
    "isSilent": false,
    "soundscapeLayers": [
      { "category": "weather", "description": "Heavy rain drumming on metal walkways.", "enabled": true }
    ],
    "music": {
      "hasMusic": true,
      "genreStyle": "${params.narrativeStyle}",
      "instrumentation": ["analog synth", "industrial drums"],
      "tempo": "fast",
      "dynamics": "building crescendo",
      "rhythmPattern": "driving rhythm",
      "layeringDescription": "Sub-bass pad pulsating underneath."
    }
  }
}`;

    const payload = {
      contents: [
        {
          role: 'user',
          parts: [...imageParts, { text: promptText }],
        },
      ],
      generationConfig: {
        temperature: 0.4,
        responseMimeType: 'application/json',
      },
    };

    try {
      const data = await this.callVertexExpress(payload, key);
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
