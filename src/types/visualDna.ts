export interface VisualIdentityDNA {
  ageRange?: string;
  genderPresentation?: string;
  faceShape?: string;
  hairStyle?: string;
  hairColor?: string;
  eyeColor?: string;
  bodyType?: string;
  wardrobe?: string;
  accessories?: string[];
  expression?: string;
  pose?: string;
}

export interface VisualEnvironmentDNA {
  location?: string;
  lighting?: string;
  foreground?: string;
  background?: string;
  weather?: string;
  timeOfDay?: string;
  atmosphere?: string;
}

export interface VisualCinematographyDNA {
  cameraAngle?: string;
  lensFocalLength?: string;
  composition?: string;
  lightingPalette?: string;
  mood?: string;
  depthOfField?: string;
}

export interface VisualDNA {
  identity: VisualIdentityDNA;
  environment: VisualEnvironmentDNA;
  cinematography: VisualCinematographyDNA;
  objects?: string[];
}
