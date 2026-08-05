import { StudioProject, MiniMaxMode } from '../types/project';
import { Shot } from '../types/shot';

export class PromptParser {
  /**
   * Parses raw MiniMax text string into structured studio project state.
   */
  public static parse(rawText: string): Partial<StudioProject> {
    const mode: MiniMaxMode = rawText.includes('Picture 2')
      ? 'FL2VA'
      : rawText.includes('Picture 1')
      ? 'I2VA'
      : 'T2VA';

    const shots: Shot[] = [];
    const shotRegex = /\[Shot (\d+)\](?: At ([\d:\.]+),)? (.*?)(?=\[Shot \d+\]|overall_soundscape:|$)/gs;
    let match;
    let index = 0;

    while ((match = shotRegex.exec(rawText)) !== null) {
      const shotNum = parseInt(match[1], 10);
      const actionText = match[3].trim();

      shots.push({
        id: `parsed-shot-${shotNum}`,
        shotNumber: shotNum,
        startTimeSeconds: index * 3,
        durationSeconds: 3,
        camera: {
          motionType: actionText.includes('push') ? 'Push In' : actionText.includes('track') ? 'Tracking Shot' : 'Push In',
          amplitude: 'small amplitude',
          speed: 'slow speed',
        },
        character: {
          identity: 'The main character',
        },
        environment: {
          location: 'Cinematic scene setting',
        },
        rawActionDescription: actionText,
      });
      index++;
    }

    return {
      settings: {
        mode,
        durationSeconds: shots.length * 3 || 6,
        aspectRatio: '16:9',
        style: 'Cinematic',
        fps: 24,
        resolution: '1080p',
      },
      shots: shots.length > 0 ? shots : [],
      compiledPrompt: rawText,
    };
  }
}
