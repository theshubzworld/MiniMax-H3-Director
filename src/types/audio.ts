export interface SoundscapeLayer {
  category: 'ambient' | 'weather' | 'footsteps' | 'machinery' | 'animals' | 'impacts' | 'crowd' | 'physics';
  description: string;
  enabled: boolean;
}

export interface NonDiegeticMusicConfig {
  hasMusic: boolean;
  genreStyle: string;
  instrumentation: string[];
  tempo: 'very slow' | 'slow' | 'moderate' | 'fast' | 'energetic';
  dynamics: string; // e.g. "crescendo towards cut", "subdued low strings"
  rhythmPattern: string;
  layeringDescription: string;
}

export interface AudioSettings {
  isSilent: boolean;
  soundscapeLayers: SoundscapeLayer[];
  customSoundscape?: string;
  music: NonDiegeticMusicConfig;
}
