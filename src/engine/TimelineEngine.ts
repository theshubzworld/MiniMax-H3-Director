import { Shot } from '../types/shot';

export class TimelineEngine {
  /**
   * Formats timestamp according to official MiniMax H3 rules:
   * Shot 1: No timestamp at the start.
   * Shot N (N >= 2): "At 00:03.500, the camera cuts to..."
   */
  public static formatTimestamp(startTimeSeconds: number): string {
    const mins = Math.floor(startTimeSeconds / 60);
    const secs = (startTimeSeconds % 60).toFixed(3);
    const paddedMins = String(mins).padStart(2, '0');
    const paddedSecs = Number(secs) < 10 ? `0${secs}` : secs;
    return `00:${paddedMins}:${paddedSecs}`.replace('00:00:', '00:'); // Produces 00:03.500
  }

  /**
   * Recalculates shot start times strictly based on shot durations.
   */
  public static recalculateShotTimings(shots: Shot[]): Shot[] {
    let currentTime = 0;
    return shots.map((shot, index) => {
      const updatedShot: Shot = {
        ...shot,
        shotNumber: index + 1,
        startTimeSeconds: currentTime,
      };
      currentTime += shot.durationSeconds || 3;
      return updatedShot;
    });
  }

  /**
   * Divides total video duration evenly across all active shots.
   */
  public static divideShotsEvenly(shots: Shot[], totalDurationSeconds: number): Shot[] {
    if (!shots || shots.length === 0) return [];
    const count = shots.length;
    const duration = Math.max(0.5, Number((totalDurationSeconds / count).toFixed(2)));
    let currentTime = 0;

    return shots.map((shot, index) => {
      const isLast = index === count - 1;
      const shotDuration = isLast
        ? Math.max(0.5, Number((totalDurationSeconds - currentTime).toFixed(2)))
        : duration;

      const updatedShot: Shot = {
        ...shot,
        shotNumber: index + 1,
        startTimeSeconds: Number(currentTime.toFixed(2)),
        durationSeconds: shotDuration,
      };
      currentTime += shotDuration;
      return updatedShot;
    });
  }
}
