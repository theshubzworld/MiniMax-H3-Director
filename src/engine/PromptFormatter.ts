import { StudioProject } from '../types/project';
import { FrameMath } from './FrameMath';

export class PromptFormatter {
  /**
   * Formats prompt for raw TXT output.
   */
  public static toTXT(project: StudioProject): string {
    return project.compiledPrompt;
  }

  /**
   * Formats prompt into Markdown document.
   */
  public static toMarkdown(project: StudioProject): string {
    const frameCalc = FrameMath.calculateH3Frames(project.settings.durationSeconds);
    return `# ${project.name || 'MiniMax H3 Video Prompt'}
**Mode:** ${project.settings.mode} | **Duration:** ${project.settings.durationSeconds}s (${frameCalc.frames} frames @ 24fps) | **Style:** ${project.settings.style} | **Aspect Ratio:** ${project.settings.aspectRatio}

\`\`\`text
${project.compiledPrompt}
\`\`\`
`;
  }

  /**
   * Formats project into JSON payload.
   */
  public static toJSON(project: StudioProject): string {
    const frameCalc = FrameMath.calculateH3Frames(project.settings.durationSeconds);
    return JSON.stringify({ ...project, h3FrameCalc: frameCalc }, null, 2);
  }

  /**
   * Formats payload specifically for standard ComfyUI API ingestion matching MINIMAX H3 3in1 / api.json.
   */
  public static toComfyUIPayload(project: StudioProject): string {
    const frameCalc = FrameMath.calculateH3Frames(project.settings.durationSeconds);
    return JSON.stringify(
      {
        client_id: "minimax_studio_web",
        prompt: {
          "1": {
            inputs: {
              prompt_text: project.compiledPrompt,
              mode: project.settings.mode,
              duration_seconds: project.settings.durationSeconds,
              frames_h3_grid: frameCalc.frames,
              actual_runtime_seconds: frameCalc.actualSeconds,
              fps: frameCalc.fps,
              formula_grid: frameCalc.formula,
              aspect_ratio: project.settings.aspectRatio,
              style: project.settings.style
            },
            class_type: "MiniMaxH3PromptNode"
          }
        }
      },
      null,
      2
    );
  }

  /**
   * Formats payload specifically for ComfyUI-Pixaroma (Video Prompt Pixaroma & H3 Audio Sync nodes).
   */
  public static toPixaromaPayload(project: StudioProject): string {
    const frameCalc = FrameMath.calculateH3Frames(project.settings.durationSeconds);
    const modeMapping = project.settings.mode === 'T2VA'
      ? 'text_to_video'
      : project.settings.mode === 'I2VA'
      ? 'first_frame'
      : 'first_last';

    return JSON.stringify(
      {
        node_family: "Pixaroma",
        video_prompt_node: {
          class_type: "PixaromaVideoPrompt",
          inputs: {
            mode: modeMapping,
            idea: project.description || project.name || "Cinematic video prompt",
            compiled_prompt_text: project.compiledPrompt,
            asked_seconds: project.settings.durationSeconds,
            output_frames: frameCalc.frames,
            output_seconds: frameCalc.actualSeconds,
            fps: 24.0,
            frame_formula: "17n + 5",
            model_target: "qwen3-vl-8b-heretic-1.3.0_fp8_e4m3fn.safetensors"
          }
        },
        audio_sync_node: {
          class_type: "PixaromaH3AudioSync",
          inputs: {
            has_dialogue: project.shots.some(s => s.dialogue?.hasDialogue),
            audio_track_target_seconds: frameCalc.actualSeconds,
            noise_mask: { video: 1.0, audio: 0.0 }
          }
        },
        duration_node: {
          class_type: "PixaromaDuration",
          inputs: {
            seconds: project.settings.durationSeconds,
            snapped_frames: frameCalc.frames,
            true_runtime_seconds: frameCalc.actualSeconds
          }
        }
      },
      null,
      2
    );
  }
}
