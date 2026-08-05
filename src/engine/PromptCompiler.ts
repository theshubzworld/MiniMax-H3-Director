import { StudioProject } from '../types/project';
import { Shot } from '../types/shot';
import { CameraEngine } from './CameraEngine';
import { AudioEngine } from './AudioEngine';
import { ReferenceEngine } from './ReferenceEngine';
import { TimelineEngine } from './TimelineEngine';

export class PromptCompiler {
  /**
   * Compiles the complete StudioProject state into official MiniMax H3 format string.
   */
  public static compile(project: StudioProject): string {
    const { settings, references, shots, audio } = project;

    // 1. Compile Reference Alignment Header (Part One)
    const header = ReferenceEngine.compileReferenceHeader(
      settings.mode,
      references,
      settings.durationSeconds,
      shots.length
    );

    // 2. Compile Multimodal Description (Part Two - Section 1)
    const compiledShots = shots.map((shot: Shot, index: number) => {
      return PromptCompiler.compileSingleShot(shot, index, settings.style, settings.mode);
    });

    const multimodalDescription = `integrated_multimodal_description: ${compiledShots.join(' ')}`;

    // 3. Compile Soundscape & Non-Diegetic Music unless Audio is Silent
    if (audio?.isSilent) {
      return `${header}${multimodalDescription}`;
    }

    const soundscape = AudioEngine.compileSoundscape(audio);
    const music = AudioEngine.compileNonDiegeticMusic(audio);

    return `${header}${multimodalDescription}\n\n${soundscape}\n\n${music}`;
  }

  /**
   * Compiles a single shot into natural English storyboard prose.
   */
  private static compileSingleShot(shot: Shot, index: number, style: string, mode: string): string {
    const shotNum = index + 1;
    const parts: string[] = [];

    // Shot Header & Cut Timing
    if (index === 0) {
      parts.push(`[Shot 1] ${style},`);
      if (mode === 'I2VA') {
        parts.push(`the opening frame begins from <Picture 1>,`);
      }
    } else {
      const timeStamp = TimelineEngine.formatTimestamp(shot.startTimeSeconds);
      const transitionWord = shot.transitionToNext === 'cross-dissolve' ? 'cross-dissolves to' : 'cuts to';
      parts.push(`[Shot ${shotNum}] At ${timeStamp}, the camera ${transitionWord}`);
    }

    // Environment & Setting
    if (shot.environment) {
      const env = shot.environment;
      const envParts = [env.location, env.lighting, env.weather, env.timeOfDay, env.atmosphere].filter(Boolean) as string[];
      if (envParts.length > 0 && envParts[0]) {
        const cleanLocation = envParts[0].replace(/^(a|an|the)\s+/i, '');
        const joinedEnv = [cleanLocation, ...envParts.slice(1)].join(', ');
        parts.push(`set in a ${joinedEnv} environment.`);
      }
    }

    // Character & Identity
    if (shot.character) {
      const char = shot.character;
      const charDesc = char.identity || 'the subject';
      const speakerTag = char.speakerId ? ` (${char.speakerId})` : '';

      const rawPose = (char.pose || '').replace(/^standing\s+(in\s+)?/i, '').trim();
      let poseStr = '';
      if (rawPose) {
        if (/^(kneeling|sitting|perched|crouched|lying|leaning|walking|running|drawn|facing)\b/i.test(rawPose)) {
          poseStr = ` ${rawPose}`;
        } else if (/^(at|on|in|near|by|under|over|beside|facing)\b/i.test(rawPose)) {
          poseStr = ` standing ${rawPose}`;
        } else {
          poseStr = ` standing in ${rawPose}`;
        }
      }

      const rawExpr = (char.expression || '').replace(/^(a|an|the)\s+/i, '').trim();
      const exprStr = rawExpr ? ` with a ${rawExpr} expression` : '';

      const motionStr = char.motion ? `, ${char.motion}` : '';
      parts.push(`${charDesc}${speakerTag}${poseStr}${exprStr}${motionStr}.`);
    }

    // Action Description
    if (shot.rawActionDescription && shot.rawActionDescription.trim().length > 0) {
      parts.push(shot.rawActionDescription.trim());
    }

    // Camera Motion
    const cameraSentence = CameraEngine.compileCameraSentence(shot.camera);
    parts.push(cameraSentence);

    // Spoken Dialogue Tagging: <d>[Language] Dialogue</d>
    if (shot.dialogue && shot.dialogue.hasDialogue && shot.dialogue.dialogueText.trim().length > 0) {
      const d = shot.dialogue;
      const speakerId = d.speakerId || 'S1';
      const lang = d.languageTag || 'English';
      
      if (d.isOffScreenVoiceover) {
        parts.push(
          `says in an off-screen voiceover: <d>[${lang}] ${d.dialogueText.trim()}</d> while their lips remain completely closed.`
        );
      } else {
        parts.push(
          `(${speakerId}) speaks clearly: <d>[${lang}] ${d.dialogueText.trim()}</d>.`
        );
      }
    }

    return parts.join(' ').replace(/\.\./g, '.');
  }
}
