import { VisualDNA } from '../../types/visualDna';
import { StudioProject } from '../../types/project';
import { Shot } from '../../types/shot';
import { AudioSettings } from '../../types/audio';

export type NarrativeStyle =
  | 'Live-Action Realism'
  | 'Cinematic Film'
  | 'Commercial'
  | 'Fashion'
  | 'Action'
  | 'Music Video'
  | 'Documentary'
  | 'Product'
  | 'Travel'
  | 'Anime'
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
  | 'Experimental Surrealism'
  | 'Sultry Romance'
  | 'Sensual Intimacy'
  | 'Steamy Thriller'
  | 'Velvet Boudoir'
  | 'Erotic Romance';

export interface StoryboardParams {
  idea: string;
  images?: string[];
  mode: string;
  referenceMode?: 'strict' | 'creative';
  durationSeconds: number;
  shotsCount: number;
  narrativeStyle: NarrativeStyle;
  directorModel?: 'gemini-2.5-pro' | 'gemini-3.5-flash' | 'gemini-2.5-flash';
  thinkingBudget?: number;
  thinkingLevel?: 'off' | 'low' | 'medium' | 'high';
  temperature?: number;
  directorMode?: 'strict' | 'balanced' | 'creative';
}

export interface AIProvider {
  id: string;
  name: string;
  analyzeVisualDNA(images: string[], apiKey?: string): Promise<VisualDNA>;
  generateStoryboard(params: StoryboardParams, apiKey?: string): Promise<Partial<StudioProject>>;
  enhanceCamera(shots: Shot[], apiKey?: string): Promise<Shot[]>;
  enhanceAudio(audio: AudioSettings, apiKey?: string): Promise<AudioSettings>;
}
