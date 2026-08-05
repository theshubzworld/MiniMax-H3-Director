export type MiniMaxMode = 'T2VA' | 'I2VA' | 'FL2VA' | 'L2VA';

export type AspectRatio = '16:9' | '9:16' | '1:1' | '2.39:1' | '4:3';

export type VisualStyle =
  | 'Cinematic'
  | 'Live-action'
  | '2D Anime'
  | '3D CG Animation'
  | 'Luxury Fashion'
  | 'Cyberpunk'
  | 'Film Noir'
  | 'Claymation'
  | 'Watercolor'
  | 'Vintage 35mm'
  | 'Documentary'
  | 'Ultra-Realistic Photorealism'
  | 'Dark Fantasy'
  | 'Sci-Fi Cyber-Noir'
  | 'Vaporwave / Synthwave'
  | 'Retro 80s VHS'
  | 'Hyper-Detailed 8K Uncut'
  | 'Isometric Low-Poly'
  | 'Chibi / Kawaii Anime'
  | 'Noir Neo-Realism'
  | 'Watercolor Sketch'
  | 'Surrealist Dreamscape'
  | 'Retro Comic Book / Manga'
  | 'Horror Gothic'
  | 'Architectural Minimalist'
  | 'IMAX High-Frame Rate'
  | 'Unreal Engine 5 Realtime Render';

export interface ReferenceImage {
  id: string;
  name: string;
  url: string;
  type: 'first_frame' | 'last_frame' | 'character' | 'style';
  shotIndex: number;
  traits?: {
    subject?: string;
    face?: string;
    hair?: string;
    wardrobe?: string;
    environment?: string;
    lighting?: string;
    composition?: string;
  };
}

export type ImageReferenceMode = 'strict' | 'creative';

export interface ProjectSettings {
  mode: MiniMaxMode;
  referenceMode?: ImageReferenceMode;
  durationSeconds: number;
  aspectRatio: AspectRatio;
  style: VisualStyle;
  fps: number;
  resolution: string;
  seed?: number;
}

export interface StudioProject {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  settings: ProjectSettings;
  references: ReferenceImage[];
  shots: Array<any>; // Shot interface will be typed in shot.ts
  audio: any; // AudioSettings interface in audio.ts
  compiledPrompt: string;
}
