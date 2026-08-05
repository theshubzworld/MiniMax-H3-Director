import { StudioProject } from '../types/project';

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
    return `# ${project.name || 'MiniMax H3 Video Prompt'}
**Mode:** ${project.settings.mode} | **Duration:** ${project.settings.durationSeconds}s | **Style:** ${project.settings.style} | **Aspect Ratio:** ${project.settings.aspectRatio}

\`\`\`text
${project.compiledPrompt}
\`\`\`
`;
  }

  /**
   * Formats project into JSON payload.
   */
  public static toJSON(project: StudioProject): string {
    return JSON.stringify(project, null, 2);
  }

  /**
   * Formats payload specifically for ComfyUI API ingestion matching MINIMAX H3 3in1 / api.json.
   */
  public static toComfyUIPayload(project: StudioProject): string {
    return JSON.stringify(
      {
        client_id: "minimax_studio_web",
        prompt: {
          "1": {
            inputs: {
              prompt_text: project.compiledPrompt,
              mode: project.settings.mode,
              duration: project.settings.durationSeconds,
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
}
