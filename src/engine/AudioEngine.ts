import { AudioSettings } from '../types/audio';

export class AudioEngine {
  /**
   * Compiles overall_soundscape field.
   * Summarizes ambient sound, physical action sounds, and non-verbal human sounds.
   */
  public static compileSoundscape(audio: AudioSettings): string {
    if (audio.isSilent) {
      return 'overall_soundscape: N/A';
    }

    if (audio.customSoundscape && audio.customSoundscape.trim().length > 0) {
      return `overall_soundscape: ${audio.customSoundscape.trim()}`;
    }

    const activeLayers = audio.soundscapeLayers
      .filter((layer) => layer.enabled && layer.description.trim().length > 0)
      .map((layer) => layer.description.trim());

    if (activeLayers.length === 0) {
      return 'overall_soundscape: Natural ambient room tone continues smoothly in the background with subtle atmospheric acoustics.';
    }

    return `overall_soundscape: ${activeLayers.join(' ')}`;
  }

  /**
   * Compiles non_diegetic_music field.
   * Describes background music focusing on instrumentation, speed, rhythm, and dynamics.
   */
  public static compileNonDiegeticMusic(audio: AudioSettings): string {
    if (!audio.music || !audio.music.hasMusic) {
      return 'non_diegetic_music: N/A';
    }

    const m = audio.music;
    const parts: string[] = [];

    if (m.genreStyle) {
      parts.push(`${m.genreStyle} score`);
    }

    if (m.instrumentation && m.instrumentation.length > 0) {
      parts.push(`featuring ${m.instrumentation.join(', ')}`);
    }

    if (m.tempo) {
      parts.push(`at a ${m.tempo} tempo`);
    }

    if (m.rhythmPattern) {
      parts.push(`with ${m.rhythmPattern}`);
    }

    if (m.dynamics) {
      parts.push(`and ${m.dynamics}`);
    }

    if (m.layeringDescription) {
      parts.push(`. ${m.layeringDescription}`);
    }

    const text = parts.join(' ').replace(/ \./g, '.');
    return `non_diegetic_music: ${text.length > 0 ? text : 'Minimalist orchestral pad at a slow tempo fading softly at the end.'}`;
  }
}
