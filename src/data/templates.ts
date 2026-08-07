import { PromptTemplate } from '../types/template';
import { RAW_TEMPLATES } from './templates/raw';
import { SULTRY_TEMPLATES } from './templates/sultry';
import { BOUDOIR_TEMPLATES } from './templates/boudoir';
import { SOCIAL_TEMPLATES } from './templates/social';
import { CINEMA_TEMPLATES } from './templates/cinema';
import { FASHION_TEMPLATES } from './templates/fashion';
import { LUXURY_TEMPLATES } from './templates/luxury';
import { ACTION_TEMPLATES } from './templates/action';
import { SCIFI_TEMPLATES } from './templates/scifi';
import { CARS_TEMPLATES } from './templates/cars';
import { FOOD_TEMPLATES } from './templates/food';
import { TRAVEL_TEMPLATES } from './templates/travel';
import { SPORTS_TEMPLATES } from './templates/sports';
import { MUSIC_TEMPLATES } from './templates/music';

/**
 * Modernized MiniMax H3 Prompt Template Library
 * Contains 140 total production templates (10 templates per category across 14 categories).
 */
export const TEMPLATES_LIBRARY: PromptTemplate[] = [
  ...RAW_TEMPLATES,
  ...SULTRY_TEMPLATES,
  ...BOUDOIR_TEMPLATES,
  ...SOCIAL_TEMPLATES,
  ...CINEMA_TEMPLATES,
  ...FASHION_TEMPLATES,
  ...LUXURY_TEMPLATES,
  ...ACTION_TEMPLATES,
  ...SCIFI_TEMPLATES,
  ...CARS_TEMPLATES,
  ...FOOD_TEMPLATES,
  ...TRAVEL_TEMPLATES,
  ...SPORTS_TEMPLATES,
  ...MUSIC_TEMPLATES,
];
