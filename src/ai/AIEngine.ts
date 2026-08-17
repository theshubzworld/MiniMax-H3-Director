import { AIProvider } from './interfaces/AIProvider';
import { GeminiProvider } from './providers/GeminiProvider';
import { OpenAIProvider } from './providers/OpenAIProvider';
import { LocalProvider } from './providers/LocalProvider';

export class AIEngine {
  private static providers: Map<string, AIProvider> = new Map<string, AIProvider>([
    ['gemini', new GeminiProvider()],
    ['local', new LocalProvider()],
    ['openai', new OpenAIProvider()],
  ]);

  private static activeProviderId = 'gemini';

  public static getActiveProvider(): AIProvider {
    return this.providers.get(this.activeProviderId) || this.providers.get('gemini')!;
  }

  public static setActiveProvider(id: string): void {
    if (this.providers.has(id)) {
      this.activeProviderId = id;
    }
  }

  public static getAvailableProviders(): { id: string; name: string }[] {
    return Array.from(this.providers.values()).map((p) => ({ id: p.id, name: p.name }));
  }
}
