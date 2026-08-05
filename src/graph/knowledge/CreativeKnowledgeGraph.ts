export type RelationType =
  | 'OWNS'
  | 'LOCATED_IN'
  | 'SEEN_BY'
  | 'USED_IN'
  | 'TARGETS'
  | 'CONTINUOUS_WITH';

export interface GraphEdge {
  fromId: string;
  toId: string;
  relation: RelationType;
  metadata?: Record<string, any>;
}

export class CreativeKnowledgeGraph {
  private nodes: Map<string, any> = new Map();
  private edges: GraphEdge[] = [];

  public addNode(id: string, data: any): void {
    this.nodes.set(id, data);
  }

  public getNode(id: string): any {
    return this.nodes.get(id);
  }

  public addRelation(fromId: string, relation: RelationType, toId: string, metadata?: Record<string, any>): void {
    this.edges.push({ fromId, toId, relation, metadata });
  }

  public queryRelations(fromId: string, relation?: RelationType): GraphEdge[] {
    return this.edges.filter(
      (edge) => edge.fromId === fromId && (!relation || edge.relation === relation)
    );
  }

  public getRelatedNodes(fromId: string, relation?: RelationType): any[] {
    const matchingEdges = this.queryRelations(fromId, relation);
    return matchingEdges.map((edge) => this.nodes.get(edge.toId)).filter(Boolean);
  }
}
