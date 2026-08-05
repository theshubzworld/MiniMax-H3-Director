import { VisualDNA } from '../../types/visualDna';
import { StudioProject } from '../../types/project';
import { Shot } from '../../types/shot';
import { AudioSettings } from '../../types/audio';

export type NarrativeStyle =
  | 'Commercial'
  | 'Fashion'
  | 'Action'
  | 'Music Video'
  | 'Documentary'
  | 'Product'
  | 'Travel'
  | 'Anime'
  | 'Cinematic Film'
  | 'Sci-Fi Thriller'
  | 'Dark Fantasy'
  | 'Horror Suspense'
  | 'Romance Drama'
  | 'Gaming Trailer'
  | 'Sports Hype'
  | 'Automotive Showcase'
  | 'Comedy Sketch'
  | 'Historical Epic'
  | 'Superhero Origin'
  | 'Experimental Surrealism';

export interface StoryboardParams {
  idea: string;
  images?: string[];
  mode: string;
  durationSeconds: number;
  shotsCount: number;
  narrativeStyle: NarrativeStyle;
}

export interface AIProvider {
  id: string;
  name: string;
  analyzeVisualDNA(images: string[], apiKey?: string): Promise<VisualDNA>;
  generateStoryboard(params: StoryboardParams, apiKey?: string): Promise<Partial<StudioProject>>;
  enhanceCamera(shots: Shot[], apiKey?: string): Promise<Shot[]>;
  enhanceAudio(audio: AudioSettings, apiKey?: string): Promise<AudioSettings>;
}
