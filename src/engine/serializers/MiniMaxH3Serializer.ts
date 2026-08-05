import { PromptAST } from '../ast/PromptAST';

export interface SerializerAdapter {
  id: string;
  name: string;
  serialize(ast: PromptAST): string;
}

export class MiniMaxH3Serializer implements SerializerAdapter {
  public id = 'minimax-h3';
  public name = 'MiniMax H3 Official Prose';

  public serialize(ast: PromptAST): string {
    const parts: string[] = [];

    ast.rootNodes.forEach((node) => {
      if (node.content && node.content.trim().length > 0) {
        parts.push(node.content.trim());
      }
    });

    return parts.join('\n\n');
  }
}
