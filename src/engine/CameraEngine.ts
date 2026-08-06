import { CameraConfig } from '../types/shot';

export class CameraEngine {
  /**
   * Compiles 3-dimensional camera configuration into natural English cinematography sentences.
   * Format: "The camera [motionType] [amplitude] [speed] [targetSubject]."
   */
  public static compileCameraSentence(camera: CameraConfig): string {
    if (!camera || camera.motionType === 'Static Shot') {
      return 'The camera holds a static shot.';
    }

    if (camera.customDescription && camera.customDescription.trim().length > 0) {
      return camera.customDescription.trim();
    }

    const verbMap: Record<string, string> = {
      'Push In': 'pushes in',
      'Pull Out': 'pulls out',
      'Pan Left': 'pans left',
      'Pan Right': 'pans right',
      'Truck Left': 'trucks left',
      'Truck Right': 'trucks right',
      'Tilt Up': 'tilts up',
      'Tilt Down': 'tilts down',
      'Pedestal Up': 'moves upward',
      'Pedestal Down': 'moves downward',
      'Arc Shot': 'arcs around the subject',
      'Tracking Shot': 'tracks alongside the subject',
      'Shake Slightly': 'shakes slightly',
      'Shake Strongly': 'shakes strongly',
      'POV': 'adopts a direct point-of-view perspective',
      'Roll Clockwise': 'rolls clockwise',
      'Roll Counterclockwise': 'rolls counterclockwise',
      'Zoom In': 'zooms in',
      'Zoom Out': 'zooms out',
    };

    const actionVerb = verbMap[camera.motionType] || 'moves';
    
    let rawAmp = (camera.amplitude || '').trim().toLowerCase();
    let amplitudeStr = '';
    if (rawAmp && !/^(n\/?a|none|null|undefined)$/i.test(rawAmp)) {
      if (/subtle|small|slight/i.test(rawAmp)) {
        amplitudeStr = ' with small amplitude';
      } else if (/large|dramatic|wide/i.test(rawAmp)) {
        amplitudeStr = ' with large amplitude';
      } else if (!rawAmp.startsWith('with ')) {
        amplitudeStr = ` with ${rawAmp}`;
      } else {
        amplitudeStr = ` ${rawAmp}`;
      }
    }

    let rawSpeed = (camera.speed || '').trim().toLowerCase();
    let speedStr = '';
    if (rawSpeed && !/^(n\/?a|none|null|undefined)$/i.test(rawSpeed)) {
      if (/slow/i.test(rawSpeed)) {
        speedStr = ' at slow speed';
      } else if (/fast|rapid|quick/i.test(rawSpeed)) {
        speedStr = ' at fast speed';
      } else if (!rawSpeed.startsWith('at ')) {
        speedStr = ` at ${rawSpeed}`;
      } else {
        speedStr = ` ${rawSpeed}`;
      }
    }

    let cleanTarget = (camera.targetSubject || '').trim();
    if (cleanTarget) {
      cleanTarget = cleanTarget.replace(/(the subject from <Picture \d+>)'s\s+(.+)/gi, 'the $2 of $1');
      cleanTarget = cleanTarget.replace(/<Picture (\d+)>'s\s+(.+)/gi, 'the $2 of the subject from <Picture $1>');
    }
    const targetStr = cleanTarget ? ` toward ${cleanTarget}` : '';

    return `The camera ${actionVerb}${amplitudeStr}${speedStr}${targetStr}.`;
  }
}
