import { MiniMaxMode, AspectRatio, VisualStyle } from './project';
import { Shot } from './shot';
import { AudioSettings } from './audio';

export type TemplateCategory =
  | 'Fashion'
  | 'Commercial'
  | 'Luxury'
  | 'Travel'
  | 'Wedding'
  | 'Music Video'
  | 'Action'
  | 'Sci-Fi'
  | 'Fantasy'
  | 'Anime'
  | 'Sports'
  | 'Cars'
  | 'Food'
  | 'Real Estate'
  | 'Nature'
  | 'Product'
  | 'Social Media'
  | 'Cinematic Film'
  | 'Game Trailer'
  | 'Documentary';

export interface PromptTemplate {
  id: string;
  title: string;
  category: TemplateCategory;
  description: string;
  thumbnailUrl: string;
  tags: string[];
  presetSettings: {
    mode: MiniMaxMode;
    durationSeconds: number;
    aspectRatio: AspectRatio;
    style: VisualStyle;
  };
  presetShots: Partial<Shot>[];
  presetAudio: Partial<AudioSettings>;
}
