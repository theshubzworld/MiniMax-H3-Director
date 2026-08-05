import { describe, it, expect } from 'vitest';
import { PromptCompiler } from '../engine/PromptCompiler';
import { CreativeKnowledgeGraph } from '../graph/knowledge/CreativeKnowledgeGraph';
import { PromptAST } from '../engine/ast/PromptAST';
import { MiniMaxH3Serializer } from '../engine/serializers/MiniMaxH3Serializer';
import { StudioProject } from '../types/project';

describe('Universal Authoring Architecture Tests', () => {
  it('should build CKG relationships correctly', () => {
    const ckg = new CreativeKnowledgeGraph();
    ckg.addNode('char-1', { name: 'Cyborg Heroine' });
    ckg.addNode('ward-1', { name: 'Leather Trench Coat' });
    ckg.addRelation('char-1', 'OWNS', 'ward-1');

    const related = ckg.getRelatedNodes('char-1', 'OWNS');
    expect(related.length).toBe(1);
    expect(related[0].name).toBe('Leather Trench Coat');
  });

  it('should serialize PromptAST using MiniMaxH3Serializer adapter', () => {
    const ast = new PromptAST();
    ast.addNode({
      type: 'Header',
      content: 'For the target video, at 0.00 seconds into the target video, <Picture 1> (from [Shot 1]) is fully referenced.',
    });
    ast.addNode({
      type: 'MultimodalBlock',
      content: 'integrated_multimodal_description: [Shot 1] 2D Anime shot of cyborg heroine.',
    });

    const serializer = new MiniMaxH3Serializer();
    const output = serializer.serialize(ast);

    expect(output).toContain('<Picture 1>');
    expect(output).toContain('integrated_multimodal_description:');
  });
});
