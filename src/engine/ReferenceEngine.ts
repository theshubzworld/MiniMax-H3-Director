import { MiniMaxMode, ReferenceImage } from '../types/project';

export class ReferenceEngine {
  /**
   * Compiles the exact official Part One Reference Alignment Instruction header.
   */
  public static compileReferenceHeader(mode: MiniMaxMode, references: ReferenceImage[], durationSeconds: number, shotCount: number): string {
    const formattedDuration = durationSeconds.toFixed(2);
    const finalShotNum = Math.max(1, shotCount);

    switch (mode) {
      case 'T2VA':
        return ''; // T2VA has no reference instruction line

      case 'I2VA':
        return `For the target video, at 0.00 seconds into the target video, <Picture 1> (from [Shot 1]) is fully referenced.\n\n`;

      case 'FL2VA':
        return `How the reference pictures align with the target video — Picture 1 (from Shot 1) aligns with the 0.00-second mark of the target video; Picture 2 (from Shot ${finalShotNum}) aligns with the ${formattedDuration}-second mark of the target video.\n\n`;

      case 'L2VA':
        return `How the reference pictures align with the target video — <Picture 1> (from [Shot ${finalShotNum}]) aligns with the ${formattedDuration}-second mark of the target video.\n\n`;

      default:
        return '';
    }
  }
}
