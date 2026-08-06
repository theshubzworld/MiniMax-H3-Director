export type MiniMaxMode = 'T2VA' | 'I2VA' | 'FL2VA' | 'L2VA';

export type AspectRatio =
  | '16:9'
  | '9:16'
  | '1:1'
  | '2.39:1'
  | '21:9'
  | '4:3'
  | '3:4'
  | '3:2'
  | '2:3'
  | '4:5'
  | '5:4';

export const ALL_VISUAL_STYLES = [
  'Ultra Realistic Photorealism',
  'Cinematic 35mm Film',
  'Raw Smartphone Selfie',
  'Kodak Portra 400 Color',
  'Fuji Velvia Chrome',
  'Polaroid Instant 1990s',
  'Studio Flash High Fashion',
  'IMAX High Frame Rate',
  'Anamorphic Lens Flare Cinema',
  'Modern 2D Anime',
  'Retro 80s Cel Shaded Anime',
  'Makoto Shinkai Sky Aesthetic',
  'Studio Ghibli Pastoral Style',
  '3D CG Animation Render',
  'Arcane Dishonored Oil Painting',
  'Unreal Engine 5 Render',
  'Action Sci-Fi Blockbuster',
  'Cyberpunk Neon Noir',
  'Sci-Fi Cyber Ethereal Hologram',
  'Steampunk Industrial Copper',
  'Dark Fantasy Gothic',
  'Surrealist Dreamscape',
  'Vaporwave Synthwave Neon',
  'Retro 80s VHS Grain',
  'Film Noir Monochrome',
  'Claymation Stop Motion',
  'Retro Comic Book Manga Ink',
  'Watercolor Sketch',
  'Isometric Low Poly 3D',
  'Infrared Spectral Thermal',
  'GoPro Ultra Wide Action Cam',
  'CCTV Surveillance Night Vision',
  'Underwater Bioluminescent Realm',
  'Architectural Minimalist Glass',
  'Chibi Kawaii Pastel Anime',
] as const;

export type VisualStyle = typeof ALL_VISUAL_STYLES[number] | string;

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

export interface StudioProjectSettings {
  mode: MiniMaxMode;
  durationSeconds: number;
  aspectRatio: AspectRatio;
  style: VisualStyle;
  fps: number;
  resolution?: '720p' | '1080p' | '4K' | string;
  referenceMode?: 'strict' | 'creative';
}

export interface StudioProject {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  settings: StudioProjectSettings;
  references: ReferenceImage[];
  shots: import('./shot').Shot[];
  audio: import('./audio').AudioSettings;
  compiledPrompt: string;
}

export interface SavedPrompt {
  id: string;
  title: string;
  idea: string;
  compiledPrompt: string;
  narrativeStyle: string;
  mode: MiniMaxMode;
  shotsCount: number;
  durationSeconds: number;
  aspectRatio: string;
  createdAt: string;
  tags?: string[];
  isFavorite?: boolean;
}

export type SceneGridLayout = 'single' | '2x1_dual' | '2x2_grid' | '3x3_grid';

export type QualityResolution = '1K' | '2K' | '4K' | '0.5K';

