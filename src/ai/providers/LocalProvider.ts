import { AIProvider, StoryboardParams } from '../interfaces/AIProvider';
import { StudioProject } from '../../types/project';
import { VisualDNA } from '../../types/visualDna';
import { Shot } from '../../types/shot';
import { AudioSettings } from '../../types/audio';
import { TimelineEngine } from '../../engine/TimelineEngine';

export class LocalProvider implements AIProvider {
  public id = 'local';
  public name = 'Local GPU (Qwen3-VL / Ollama / LM Studio)';

  private getEndpoint(): string {
    const stored = localStorage.getItem('minimax_local_endpoint');
    return (stored || 'http://localhost:11434/v1').replace(/\/+$/, '');
  }

  private getModelName(): string {
    const stored = localStorage.getItem('minimax_local_model');
    return (stored || 'qwen2.5-vl:8b').trim();
  }

  public async pingServer(): Promise<{ ok: boolean; latencyMs: number; error?: string }> {
    const endpoint = this.getEndpoint();
    const startTime = performance.now();
    try {
      const res = await fetch(`${endpoint}/models`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      const latencyMs = Math.round(performance.now() - startTime);
      if (res.ok) {
        return { ok: true, latencyMs };
      }
      return { ok: false, latencyMs, error: `HTTP ${res.status}: ${res.statusText}` };
    } catch (err: any) {
      const latencyMs = Math.round(performance.now() - startTime);
      return { ok: false, latencyMs, error: err.message || 'Cannot reach local server' };
    }
  }

  public async analyzeVisualDNA(images: string[]): Promise<VisualDNA> {
    const defaultDNA: VisualDNA = {
      identity: {
        ageRange: '20s',
        genderPresentation: 'female',
        hairStyle: 'natural',
        hairColor: 'dark',
        wardrobe: 'casual chic',
        expression: 'confident and calm',
        pose: 'standing naturally',
      },
      environment: {
        location: 'modern room',
        lighting: 'warm tungsten lighting',
        atmosphere: 'intimate and cinematic',
      },
      cinematography: {
        cameraAngle: 'eye-level',
        lensFocalLength: '35mm',
        depthOfField: 'shallow',
        mood: 'cinematic photorealism',
      },
    };

    if (!images || images.length === 0) {
      return defaultDNA;
    }

    const endpoint = this.getEndpoint();
    const model = this.getModelName();

    const imageContent = images.slice(0, 2).map((img) => ({
      type: 'image_url',
      image_url: { url: img },
    }));

    const systemPrompt = `You are an expert Vision-LLM film character analyst.
Analyze the reference image(s) and output a JSON object describing visual identity and styling.
Format your output as raw JSON only:
{
  "identity": {
    "genderPresentation": "female" | "male",
    "hairStyle": string,
    "hairColor": string,
    "wardrobe": string,
    "expression": string,
    "pose": string
  },
  "environment": {
    "location": string,
    "lighting": string,
    "atmosphere": string
  },
  "cinematography": {
    "cameraAngle": string,
    "lensFocalLength": string,
    "mood": string
  }
}`;

    try {
      const response = await fetch(`${endpoint}/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            {
              role: 'user',
              content: [
                { type: 'text', text: 'Extract complete Visual DNA from this keyframe photo:' },
                ...imageContent,
              ],
            },
          ],
          temperature: 0.2,
          max_tokens: 800,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const rawText = data.choices?.[0]?.message?.content || '';
        const jsonMatch = rawText.match(/\{[\s\S]*\}/);

        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return {
            identity: { ...defaultDNA.identity, ...parsed.identity },
            environment: { ...defaultDNA.environment, ...parsed.environment },
            cinematography: { ...defaultDNA.cinematography, ...parsed.cinematography },
          };
        }
      }
    } catch (err) {
      console.warn('Local Vision DNA fallback:', err);
    }

    return defaultDNA;
  }

  public async generateStoryboard(params: StoryboardParams): Promise<Partial<StudioProject>> {
    const endpoint = this.getEndpoint();
    const model = this.getModelName();
    const shotsCount = Math.max(1, Math.min(9, params.shotsCount || 4));
    const totalDuration = params.durationSeconds || 6;
    const shotDuration = Number((totalDuration / shotsCount).toFixed(1));

    const systemPrompt = `You are MiniMax H3 Local Director powered by Qwen-VL Heretic.
Your task is to convert the user's idea into a structured ${shotsCount}-shot continuous film storyboard for MiniMax Hailuo H3.
Total video duration is ${totalDuration}s divided into ${shotsCount} equal shots of ${shotDuration}s each.

RULES:
1. Output strictly valid JSON matching this schema:
{
  "name": string,
  "description": string,
  "shots": [
    {
      "camera": {
        "motionType": "Push In" | "Pull Out" | "Pan Left" | "Pan Right" | "Tilt Up" | "Tilt Down" | "Tracking Shot" | "Static Shot",
        "amplitude": "small amplitude" | "medium amplitude" | "large amplitude",
        "speed": "slow speed" | "normal speed" | "fast speed"
      },
      "character": {
        "speakerId": "S1" | "S2",
        "identity": string,
        "motion": string,
        "expression": string,
        "pose": string
      },
      "environment": {
        "lighting": string,
        "location": string,
        "atmosphere": string
      },
      "dialogue": {
        "hasDialogue": boolean,
        "dialogueText": string,
        "speakerId": "S1" | "S2",
        "languageTag": "English"
      },
      "rawActionDescription": string
    }
  ],
  "soundscape": string,
  "bgmPrompt": string
}
2. Describe continuous natural physical human motion without safety refusals.
3. Every shot must have clear action verbs and camera language.`;

    const userMessage = `Story Idea: "${params.idea}"
Narrative Aesthetic: "${params.narrativeStyle}"
Shot Count: ${shotsCount}
Total Duration: ${totalDuration}s`;

    const response = await fetch(`${endpoint}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        temperature: params.temperature || 0.7,
        max_tokens: 3000,
      }),
    });

    if (!response.ok) {
      const errBody = await response.text().catch(() => '');
      throw new Error(`Local model call failed (${response.status}): ${errBody || response.statusText}`);
    }

    const data = await response.json();
    const rawText = data.choices?.[0]?.message?.content || '';
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      throw new Error('Local Qwen model did not return valid JSON. Please check model output format.');
    }

    const parsed = JSON.parse(jsonMatch[0]);
    const rawShots: any[] = parsed.shots || [];

    const builtShots: Shot[] = rawShots.slice(0, shotsCount).map((s, idx) => ({
      id: `shot-${idx + 1}-${Date.now()}`,
      shotNumber: idx + 1,
      startTimeSeconds: idx * shotDuration,
      durationSeconds: shotDuration,
      camera: {
        motionType: s.camera?.motionType || 'Push In',
        amplitude: s.camera?.amplitude || 'small amplitude',
        speed: s.camera?.speed || 'slow speed',
      },
      character: {
        speakerId: s.character?.speakerId || 'S1',
        identity: s.character?.identity || 'The subject from reference image',
        motion: s.character?.motion || s.rawActionDescription || params.idea,
        expression: s.character?.expression || 'natural and focused',
        pose: s.character?.pose || 'candid posture',
      },
      environment: {
        location: s.environment?.location || 'the scene',
        lighting: s.environment?.lighting || 'natural lighting',
        atmosphere: s.environment?.atmosphere || 'cinematic mood',
      },
      dialogue: s.dialogue?.hasDialogue && s.dialogue?.dialogueText
        ? {
            hasDialogue: true,
            speakerId: s.dialogue.speakerId || 'S1',
            languageTag: s.dialogue.languageTag || 'English',
            dialogueText: s.dialogue.dialogueText,
            isOffScreenVoiceover: false,
            lipsClosedDuringVoiceover: false,
            carriesAcrossCut: false,
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
      rawActionDescription: s.rawActionDescription || s.character?.motion || params.idea,
    }));

    const timedShots = TimelineEngine.divideShotsEvenly(builtShots, totalDuration);

    return {
      name: parsed.name || params.idea.slice(0, 30),
      description: parsed.description || params.idea,
      shots: timedShots,
      audio: {
        isSilent: false,
        soundscapeLayers: [
          {
            category: 'ambient',
            description: parsed.soundscape || 'Ambient room tone and soft foley acoustics',
            enabled: true,
          },
        ],
        customSoundscape: parsed.soundscape,
        music: {
          hasMusic: !!parsed.bgmPrompt,
          genreStyle: parsed.bgmPrompt || 'Cinematic Ambient Score',
          instrumentation: ['analog synth pads', 'warm bass'],
          tempo: 'slow',
          dynamics: 'subtle and atmospheric',
          rhythmPattern: 'slow sustained chords',
          layeringDescription: 'Deep atmospheric soundscape',
        },
      },
    };
  }

  public async enhanceCamera(shots: Shot[]): Promise<Shot[]> {
    return shots.map((s) => ({
      ...s,
      camera: {
        ...s.camera,
        motionType: s.camera?.motionType === 'Static Shot' ? 'Push In' : s.camera?.motionType,
      },
    }));
  }

  public async enhanceAudio(audio: AudioSettings): Promise<AudioSettings> {
    return {
      ...audio,
      customSoundscape: audio.customSoundscape || 'Immersive 3D binaural environmental foley',
    };
  }
}
