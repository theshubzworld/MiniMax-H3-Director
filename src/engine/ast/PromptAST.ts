export interface ASTNode {
  type: 'Header' | 'ShotNode' | 'MultimodalBlock' | 'SoundscapeBlock' | 'MusicBlock' | 'DialogueTag';
  content: string;
  metadata?: Record<string, any>;
  children?: ASTNode[];
}

export class PromptAST {
  public rootNodes: ASTNode[] = [];

  public addNode(node: ASTNode): void {
    this.rootNodes.push(node);
  }
}
