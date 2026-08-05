import { AIProvider, StoryboardParams } from '../interfaces/AIProvider';
import { VisualDNA } from '../../types/visualDna';
import { StudioProject } from '../../types/project';
import { Shot } from '../../types/shot';
import { AudioSettings } from '../../types/audio';
import { GeminiProvider } from './GeminiProvider';

export class OpenAIProvider implements AIProvider {
  public id = 'openai';
  public name = 'OpenAI GPT-4o';

  private fallback = new GeminiProvider();

  public async analyzeVisualDNA(images: string[], apiKey: string): Promise<VisualDNA> {
    return this.fallback.analyzeVisualDNA(images, apiKey);
  }

  public async generateStoryboard(params: StoryboardParams, apiKey: string): Promise<Partial<StudioProject>> {
    return this.fallback.generateStoryboard(params, apiKey);
  }

  public async enhanceCamera(shots: Shot[], apiKey: string): Promise<Shot[]> {
    return this.fallback.enhanceCamera(shots);
  }

  public async enhanceAudio(audio: AudioSettings, apiKey: string): Promise<AudioSettings> {
    return this.fallback.enhanceAudio(audio);
  }
}
