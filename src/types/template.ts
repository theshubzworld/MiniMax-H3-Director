import { MiniMaxMode, AspectRatio, VisualStyle } from './project';
import { Shot, DialogueConfig } from './shot';
import { AudioSettings } from './audio';

export type TemplateCategory =
  | 'Raw & Amateur'
  | 'Sultry & Romance'
  | 'Boudoir'
  | 'Social Media'
  | 'Cinematic Film'
  | 'Fashion'
  | 'Luxury'
  | 'Action'
  | 'Sci-Fi'
  | 'Cars'
  | 'Food'
  | 'Travel'
  | 'Sports'
  | 'Music Video';

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
  presetShots: Array<Omit<Partial<Shot>, 'dialogue'> & { dialogue?: Partial<DialogueConfig> }>;
  presetAudio: Partial<AudioSettings>;
}
