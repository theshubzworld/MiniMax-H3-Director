import { StudioProject } from '../types/project';
import { CameraAmplitude, CameraSpeed } from '../types/shot';
import { TimelineEngine } from './TimelineEngine';
import { PromptCompiler } from './PromptCompiler';

export class PromptOptimizer {
  /**
   * Applies automatic fix transformations for common compliance issues.
   */
  public static autoFix(project: StudioProject): StudioProject {
    const updatedProject: StudioProject = { ...project };

    // 1. Recalculate Timeline Shot Timings
    if (updatedProject.shots && updatedProject.shots.length > 0) {
      updatedProject.shots = TimelineEngine.recalculateShotTimings(updatedProject.shots);
    }

    // 2. Ensure Camera Motions & Focal Targets are populated + Cleanse Banned Adverbs
    updatedProject.shots = updatedProject.shots.map((shot, idx) => {
      const camera = shot.camera || {};
      const character = shot.character || {};

      let cleanAction = (shot.rawActionDescription || '')
        .replace(/\bslowly and gently\b/gi, 'with small amplitude at slow speed')
        .replace(/\bgently\b/gi, 'with small amplitude at slow speed')
        .replace(/\bslightly\b/gi, 'with small amplitude')
        .replace(/\bsubtly\b/gi, 'with small amplitude')
        .replace(/\bgradually\b/gi, 'at slow speed')
        .replace(/\ba little\b/gi, 'with small amplitude');

      let cleanAmp: CameraAmplitude = 'small amplitude';
      if (camera.amplitude === 'large amplitude' || /large/i.test(camera.amplitude || '')) {
        cleanAmp = 'large amplitude';
      } else if (camera.amplitude === 'medium amplitude' || /medium/i.test(camera.amplitude || '')) {
        cleanAmp = 'medium amplitude';
      }

      let cleanSpeed: CameraSpeed = 'slow speed';
      if (camera.speed === 'fast speed' || /fast/i.test(camera.speed || '')) {
        cleanSpeed = 'fast speed';
      } else if (camera.speed === 'normal speed' || /normal/i.test(camera.speed || '')) {
        cleanSpeed = 'normal speed';
      }

      return {
        ...shot,
        rawActionDescription: cleanAction,
        camera: {
          motionType: camera.motionType || 'Push In',
          amplitude: cleanAmp,
          speed: cleanSpeed,
          targetSubject: camera.targetSubject || 'the main focal subject',
        },
        character: {
          ...character,
          speakerId: character.speakerId || `S${idx + 1}`,
          identity: character.identity || 'The main protagonist',
        },
      };
    });

    // 3. Dialogue Pacing Auto-Fix (Trim dialogue exceeding human speech rate)
    updatedProject.shots = updatedProject.shots.map((shot) => {
      if (shot.dialogue && shot.dialogue.hasDialogue && shot.dialogue.dialogueText) {
        const words = shot.dialogue.dialogueText.trim().split(/\s+/);
        const maxWords = Math.max(3, Math.floor((shot.durationSeconds || 1.67) * 2.8));
        if (words.length > maxWords) {
          const trimmedText = words.slice(0, maxWords).join(' ') + '...';
          return {
            ...shot,
            dialogue: {
              ...shot.dialogue,
              dialogueText: trimmedText,
            },
          };
        }
      }
      return shot;
    });

    // 4. Clean Soundscape Text
    if (updatedProject.audio && updatedProject.audio.customSoundscape) {
      updatedProject.audio.customSoundscape = updatedProject.audio.customSoundscape
        .replace(/says:.*$/gi, '')
        .replace(/dialogue:.*$/gi, '')
        .trim();
    }

    // 5. Re-compile
    updatedProject.compiledPrompt = PromptCompiler.compile(updatedProject);
    return updatedProject;
  }
}
