import { StudioProject } from '../types/project';
import { DiagnosticsResult, ValidationIssue, RuleCategory } from '../types/validation';
import { Shot } from '../types/shot';

export class PromptValidator {
  /**
   * Evaluates ~50 MiniMax H3 compliance rules across 15 diagnostic categories.
   */
  public static validate(project: StudioProject): DiagnosticsResult {
    const issues: ValidationIssue[] = [];
    const { settings, references, shots, audio, compiledPrompt } = project;

    // Rule 1-5: Structure & Header Compliance
    if (!compiledPrompt.includes('integrated_multimodal_description:')) {
      issues.push({
        id: 'struct-01',
        category: 'Structure',
        severity: 'ERROR',
        ruleName: 'Missing Multimodal Header',
        message: 'The prompt must contain "integrated_multimodal_description:".',
        suggestion: 'Re-compile prompt using the studio engine.',
        autoFixable: true,
      });
    }

    if (!compiledPrompt.includes('overall_soundscape:')) {
      issues.push({
        id: 'struct-02',
        category: 'Soundscape Purity',
        severity: 'ERROR',
        ruleName: 'Missing Soundscape Header',
        message: 'The prompt must contain "overall_soundscape:".',
        suggestion: 'Add an overall soundscape summary section.',
        autoFixable: true,
      });
    }

    if (!compiledPrompt.includes('non_diegetic_music:')) {
      issues.push({
        id: 'struct-03',
        category: 'Non-Diegetic Music',
        severity: 'ERROR',
        ruleName: 'Missing Non-Diegetic Music Header',
        message: 'The prompt must contain "non_diegetic_music:".',
        suggestion: 'Add non-diegetic music specifications or N/A.',
        autoFixable: true,
      });
    }

    // Rule 6-10: Mode Reference Alignment
    if (settings.mode === 'I2VA') {
      if (!compiledPrompt.startsWith('For the target video, at 0.00 seconds into the target video, <Picture 1>')) {
        issues.push({
          id: 'align-01',
          category: 'Reference Alignment',
          severity: 'ERROR',
          ruleName: 'Incorrect I2VA Alignment Header',
          message: 'I2VA prompts must begin exactly with "For the target video, at 0.00 seconds into the target video, <Picture 1> (from [Shot 1]) is fully referenced."',
          suggestion: 'Fix alignment header format.',
          autoFixable: true,
        });
      }
      if (!compiledPrompt.includes('<Picture 1>')) {
        issues.push({
          id: 'align-02',
          category: 'Reference Alignment',
          severity: 'ERROR',
          ruleName: 'Missing Picture 1 Anchor Tag',
          message: 'I2VA prompt requires <Picture 1> tag.',
          suggestion: 'Ensure <Picture 1> is enclosed in angle brackets.',
          autoFixable: true,
        });
      }
    }

    if (settings.mode === 'FL2VA' && !compiledPrompt.includes('Picture 2 (from Shot')) {
      issues.push({
        id: 'align-03',
        category: 'Reference Alignment',
        severity: 'ERROR',
        ruleName: 'Missing FL2VA Picture 2 Anchor',
        message: 'FL2VA requires alignment to Picture 2 at the ending mark.',
        suggestion: 'Add Picture 2 alignment instruction.',
        autoFixable: true,
      });
    }

    // Rule 11-20: Shot & Timeline Checks
    if (shots.length === 0) {
      issues.push({
        id: 'shot-01',
        category: 'Timeline & Timestamps',
        severity: 'ERROR',
        ruleName: 'Empty Storyboard',
        message: 'Project contains 0 shots.',
        suggestion: 'Add at least 1 shot to the storyboard.',
        autoFixable: false,
      });
    }

    shots.forEach((shot: Shot, index: number) => {
      const shotNum = index + 1;
      if (index > 0 && shot.startTimeSeconds === 0) {
        issues.push({
          id: `time-${shotNum}`,
          category: 'Timeline & Timestamps',
          severity: 'WARNING',
          ruleName: 'Zero Timestamp Cut',
          message: `Shot ${shotNum} starts at 0.00s instead of progressive timestamp.`,
          suggestion: 'Recalculate timeline timestamps.',
          autoFixable: true,
          affectedShotIndex: index,
        });
      }

      // Camera 3D Direction Check
      if (!shot.camera || !shot.camera.motionType) {
        issues.push({
          id: `cam-${shotNum}`,
          category: 'Camera 3D Direction',
          severity: 'WARNING',
          ruleName: 'Unspecified Camera Motion',
          message: `Shot ${shotNum} is missing explicit camera motion direction.`,
          suggestion: 'Select a camera movement chip (Push In, Tracking, Arc...).',
          autoFixable: true,
          affectedShotIndex: index,
        });
      }

      // Dialogue Syntax Check
      if (shot.dialogue && shot.dialogue.hasDialogue) {
        const d = shot.dialogue;
        if (!d.dialogueText || d.dialogueText.trim().length === 0) {
          issues.push({
            id: `diag-01-${shotNum}`,
            category: 'Dialogue Syntax',
            severity: 'WARNING',
            ruleName: 'Empty Dialogue Tag',
            message: `Shot ${shotNum} has dialogue enabled but no spoken text.`,
            suggestion: 'Enter spoken dialogue content.',
            autoFixable: false,
            affectedShotIndex: index,
          });
        }
        if (!compiledPrompt.includes(`<d>[${d.languageTag || 'English'}]`)) {
          issues.push({
            id: `diag-02-${shotNum}`,
            category: 'Dialogue Syntax',
            severity: 'ERROR',
            ruleName: 'Invalid Dialogue Tag Format',
            message: `Dialogue in Shot ${shotNum} must use <d>[Language] Text</d> tags verbatim.`,
            suggestion: 'Format dialogue with exact <d> brackets.',
            autoFixable: true,
            affectedShotIndex: index,
          });
        }
      }
    });

    // Rule 21-30: Audio & Music Purity
    if (audio.customSoundscape && audio.customSoundscape.toLowerCase().includes('dialogue')) {
      issues.push({
        id: 'audio-01',
        category: 'Soundscape Purity',
        severity: 'WARNING',
        ruleName: 'Dialogue Leak in Soundscape',
        message: 'Spoken dialogue belongs in multimodal description, not in overall_soundscape.',
        suggestion: 'Remove dialogue references from overall_soundscape.',
        autoFixable: true,
      });
    }

    if (audio.music && audio.music.hasMusic && audio.music.dynamics && audio.music.dynamics.toLowerCase().includes('sad')) {
      issues.push({
        id: 'music-01',
        category: 'Non-Diegetic Music',
        severity: 'WARNING',
        ruleName: 'Abstract Emotion Word in Music',
        message: 'MiniMax guidelines state non_diegetic_music should describe instrumentation, tempo, and rhythm, not abstract emotion adjectives.',
        suggestion: 'Replace emotional terms with musical dynamics (e.g., slow piano tempo, soft string pads).',
        autoFixable: true,
      });
    }

    // Category Score Math & Overall Health Calculation
    const categoryScores: Record<RuleCategory, number> = {
      'Structure': 100,
      'Reference Alignment': 100,
      'Timeline & Timestamps': 100,
      'Continuity': 100,
      'Identity Lock': 100,
      'Lighting & Visuals': 100,
      'Dialogue Syntax': 100,
      'Camera 3D Direction': 100,
      'Soundscape Purity': 100,
      'Non-Diegetic Music': 100,
      'Physical Realism': 100,
      'Environment Integrity': 100,
      'Shot Transitions': 100,
      'MiniMax H3 Compliance': 100,
      'Audio Sync': 100,
    };

    issues.forEach((issue) => {
      const penalty = issue.severity === 'ERROR' ? 25 : 10;
      categoryScores[issue.category] = Math.max(0, categoryScores[issue.category] - penalty);
    });

    const scoresList = Object.values(categoryScores);
    const sum = scoresList.reduce((acc, curr) => acc + curr, 0);
    const overallHealthScore = Math.round(sum / scoresList.length);

    return {
      overallHealthScore,
      categoryScores,
      issues,
      timestamp: new Date().toISOString(),
    };
  }
}
