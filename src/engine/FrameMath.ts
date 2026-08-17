/**
 * FrameMath.ts - Exact MiniMax H3 Frame Calculation & Snapping Engine
 *
 * MiniMax H3 video diffusion latents strictly require frame counts in steps of:
 *   frames = 17n + 5  (at 24.0 fps)
 *
 * Examples:
 *   - 3.0s  -> n=4  -> 73 frames  (3.04s)
 *   - 5.0s  -> n=7  -> 124 frames (5.17s)
 *   - 6.0s  -> n=8  -> 141 frames (5.88s)
 *   - 10.0s -> n=14 -> 243 frames (10.12s)
 */

export interface H3FrameCalculation {
  targetSeconds: number;
  n: number;
  frames: number;
  actualSeconds: number;
  fps: number;
  formula: string;
}

export class FrameMath {
  public static readonly FPS = 24.0;
  public static readonly STEP = 17;
  public static readonly PLUS = 5;

  /**
   * Calculates the exact MiniMax H3 frame count for a given target duration in seconds.
   */
  public static calculateH3Frames(durationSeconds: number, fps: number = FrameMath.FPS): H3FrameCalculation {
    const safeSeconds = Math.max(0.5, durationSeconds || 5.0);
    const rawFrames = safeSeconds * fps;
    
    // Find integer n >= 0 that best matches target duration
    const n = Math.max(0, Math.round((rawFrames - FrameMath.PLUS) / FrameMath.STEP));
    const frames = FrameMath.STEP * n + FrameMath.PLUS;
    const actualSeconds = Number((frames / fps).toFixed(2));

    return {
      targetSeconds: safeSeconds,
      n,
      frames,
      actualSeconds,
      fps,
      formula: `17 * ${n} + 5 = ${frames} frames`,
    };
  }

  /**
   * Returns a concise badge label for UI headers (e.g. "124 frames (5.17s)").
   */
  public static formatH3Badge(durationSeconds: number): string {
    const calc = FrameMath.calculateH3Frames(durationSeconds);
    return `${calc.frames} frames (${calc.actualSeconds}s)`;
  }

  /**
   * Returns a detailed calculation summary string for ComfyUI tooltips & inspection.
   */
  public static getCalculationSummary(durationSeconds: number): string {
    const calc = FrameMath.calculateH3Frames(durationSeconds);
    return `Target: ${calc.targetSeconds}s -> Snap to H3 grid (17n+5 @ 24fps): ${calc.frames} frames = ${calc.actualSeconds}s actual`;
  }
}
