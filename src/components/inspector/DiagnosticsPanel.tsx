import React from 'react';
import { DiagnosticsResult } from '../../types/validation';
import { ShieldCheck, AlertTriangle, AlertCircle, CheckCircle } from 'lucide-react';

interface DiagnosticsPanelProps {
  result: DiagnosticsResult;
}

export const DiagnosticsPanel: React.FC<DiagnosticsPanelProps> = ({ result }) => {
  return (
    <div className="space-y-4">
      {/* Overall Health Card */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            Prompt Health Score
          </span>
          <span className="text-sm font-extrabold text-cyan-400 font-mono">
            {result.overallHealthScore}%
          </span>
        </div>

        <div className="w-full bg-zinc-950 h-2 rounded-full overflow-hidden border border-zinc-800">
          <div
            className={`h-full transition-all duration-500 ${
              result.overallHealthScore >= 90
                ? 'bg-emerald-500'
                : result.overallHealthScore >= 70
                ? 'bg-amber-500'
                : 'bg-red-500'
            }`}
            style={{ width: `${result.overallHealthScore}%` }}
          />
        </div>
      </div>

      {/* Category Health Bars */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3">
        <span className="text-xs font-bold text-zinc-300 block">Category Health Breakdown</span>
        <div className="space-y-2">
          {Object.entries(result.categoryScores).map(([cat, score]) => (
            <div key={cat} className="space-y-1">
              <div className="flex justify-between text-[11px] text-zinc-400">
                <span>{cat}</span>
                <span className="font-mono text-zinc-200">{score}%</span>
              </div>
              <div className="w-full bg-zinc-950 h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full ${
                    score >= 90 ? 'bg-cyan-400' : score >= 70 ? 'bg-amber-400' : 'bg-red-400'
                  }`}
                  style={{ width: `${score}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active Diagnostics Issues */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3">
        <span className="text-xs font-bold text-zinc-300 block">
          Diagnostic Rules ({result.issues.length} Issues)
        </span>
        {result.issues.length === 0 ? (
          <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/40 p-2.5 rounded-lg border border-emerald-500/30">
            <CheckCircle className="w-4 h-4" />
            <span>100% MiniMax H3 specification compliant! Zero issues.</span>
          </div>
        ) : (
          <div className="space-y-2">
            {result.issues.map((issue) => (
              <div
                key={issue.id}
                className={`p-2.5 rounded-lg border text-xs space-y-1 ${
                  issue.severity === 'ERROR'
                    ? 'bg-red-950/40 border-red-500/40 text-red-200'
                    : 'bg-amber-950/40 border-amber-500/40 text-amber-200'
                }`}
              >
                <div className="flex items-center gap-1.5 font-semibold">
                  {issue.severity === 'ERROR' ? (
                    <AlertCircle className="w-3.5 h-3.5 text-red-400" />
                  ) : (
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  )}
                  <span>{issue.ruleName}</span>
                </div>
                <p className="text-[11px] text-zinc-300">{issue.message}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
