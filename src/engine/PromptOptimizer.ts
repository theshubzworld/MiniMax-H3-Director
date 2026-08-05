import { StudioProject } from '../types/project';
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

    // 2. Ensure Camera Motions & Focal Targets are populated
    updatedProject.shots = updatedProject.shots.map((shot, idx) => {
      const camera = shot.camera || {};
      const character = shot.character || {};
      return {
        ...shot,
        camera: {
          motionType: camera.motionType || 'Push In',
          amplitude: camera.amplitude || 'small amplitude',
          speed: camera.speed || 'slow speed',
          targetSubject: camera.targetSubject || 'the main focal subject',
        },
        character: {
          ...character,
          speakerId: character.speakerId || `S${idx + 1}`,
          identity: character.identity || 'The main protagonist',
        },
      };
    });

    // 3. Clean Soundscape Text
    if (updatedProject.audio && updatedProject.audio.customSoundscape) {
      updatedProject.audio.customSoundscape = updatedProject.audio.customSoundscape
        .replace(/says:.*$/gi, '')
        .replace(/dialogue:.*$/gi, '')
        .trim();
    }

    // 4. Re-compile
    updatedProject.compiledPrompt = PromptCompiler.compile(updatedProject);
    return updatedProject;
  }
}
