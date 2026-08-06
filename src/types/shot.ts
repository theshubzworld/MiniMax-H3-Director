export type CameraMotionType =
  | 'Push In'
  | 'Pull Out'
  | 'Pan Left'
  | 'Pan Right'
  | 'Truck Left'
  | 'Truck Right'
  | 'Tilt Up'
  | 'Tilt Down'
  | 'Pedestal Up'
  | 'Pedestal Down'
  | 'Arc Shot'
  | 'Tracking Shot'
  | 'Static Shot'
  | 'Shake Slightly'
  | 'Shake Strongly'
  | 'POV'
  | 'Roll Clockwise'
  | 'Roll Counterclockwise'
  | 'Zoom In'
  | 'Zoom Out';

export type CameraAmplitude = 'small amplitude' | 'medium amplitude' | 'large amplitude';
export type CameraSpeed = 'slow speed' | 'normal speed' | 'fast speed';

export interface CameraConfig {
  motionType: CameraMotionType;
  amplitude?: CameraAmplitude;
  speed?: CameraSpeed;
  targetSubject?: string;
  customDescription?: string;
}

export interface CharacterConfig {
  speakerId?: string; // e.g. "S1", "S2"
  identity?: string; // e.g. "The young woman with short raven hair"
  appearance?: string;
  wardrobe?: string;
  expression?: string;
  pose?: string;
  motion?: string;
}

export interface EnvironmentConfig {
  location?: string;
  lighting?: string;
  weather?: string;
  timeOfDay?: string;
  atmosphere?: string;
  backgroundDetails?: string;
}

export interface DialogueConfig {
  hasDialogue: boolean;
  speakerId: string; // e.g. "S1"
  languageTag: string; // e.g. "English", "Japanese"
  dialogueText: string;
  deliveryTone?: string; // e.g. "soft, reflective", "urgent", "whispering"
  isOffScreenVoiceover: boolean;
  lipsClosedDuringVoiceover: boolean;
  carriesAcrossCut: boolean;
}

export type ShotTransition = 'cut' | 'cross-dissolve' | 'fade' | 'wipe' | 'none';

export interface Shot {
  id: string;
  shotNumber: number;
  startTimeSeconds: number;
  durationSeconds: number;
  transitionToNext?: ShotTransition;
  camera: CameraConfig;
  character: CharacterConfig;
  environment: EnvironmentConfig;
  dialogue?: DialogueConfig;
  rawActionDescription: string;
  diegeticSounds?: string[];
}
