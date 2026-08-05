export type ValidationSeverity = 'PASS' | 'WARNING' | 'ERROR';

export type RuleCategory =
  | 'Structure'
  | 'Reference Alignment'
  | 'Timeline & Timestamps'
  | 'Continuity'
  | 'Identity Lock'
  | 'Lighting & Visuals'
  | 'Dialogue Syntax'
  | 'Camera 3D Direction'
  | 'Soundscape Purity'
  | 'Non-Diegetic Music'
  | 'Physical Realism'
  | 'Environment Integrity'
  | 'Shot Transitions'
  | 'MiniMax H3 Compliance'
  | 'Audio Sync';

export interface ValidationIssue {
  id: string;
  category: RuleCategory;
  severity: ValidationSeverity;
  ruleName: string;
  message: string;
  suggestion?: string;
  autoFixable: boolean;
  affectedShotIndex?: number;
}

export interface DiagnosticsResult {
  overallHealthScore: number; // 0 - 100
  categoryScores: Record<RuleCategory, number>;
  issues: ValidationIssue[];
  timestamp: string;
}
