import { StudioProject } from '../types/project';
import { Shot } from '../types/shot';
import { CameraEngine } from './CameraEngine';
import { AudioEngine } from './AudioEngine';
import { ReferenceEngine } from './ReferenceEngine';
import { TimelineEngine } from './TimelineEngine';
import { TitleGenerator } from './TitleGenerator';

export class PromptCompiler {
  /**
   * Compiles the complete StudioProject state into official MiniMax H3 format string.
   */
  public static compile(project: StudioProject): string {
    const { settings, references, shots, audio } = project;

    // 1. Compile Reference Alignment Header (Part One)
    const header = ReferenceEngine.compileReferenceHeader(
      settings.mode,
      references,
      settings.durationSeconds,
      shots.length
    );

    const referenceMode = settings.referenceMode || 'strict';

    // 2. Compile Multimodal Description (Part Two - Section 1)
    const compiledShots = shots.map((shot: Shot, index: number) => {
      return PromptCompiler.compileSingleShot(shot, index, settings.style, settings.mode, referenceMode);
    });

    const multimodalDescription = `integrated_multimodal_description:\n\n${compiledShots.join('\n\n')}`;

    // 3. Compile Dialogue Section (if any shot has spoken dialogue)
    let dialogueBlock = '';
    const dialogueShots: string[] = [];

    shots.forEach((shot, idx) => {
      const shotNum = idx + 1;
      if (shot.dialogue && shot.dialogue.hasDialogue && shot.dialogue.dialogueText?.trim()) {
        const d = shot.dialogue;
        const speakerId = d.speakerId || 'S1';
        const cleanRole = shot.character?.identity
          ? shot.character.identity
              .replace(/^(the|a|an)\s+/i, '')
              .replace(/,?\s*subject from <Picture \d+>/gi, '')
              .trim()
          : '';
        const roleLabel = cleanRole ? ` (${cleanRole})` : '';
        const delivery = d.deliveryTone ? ` (${d.deliveryTone})` : '';
        const transTag = d.carriesAcrossCut ? ' <scenetrans>' : '';
        dialogueShots.push(`[Shot ${shotNum}]\n${speakerId}${roleLabel}${delivery}: "${d.dialogueText.trim()}"${transTag}`);
      } else {
        dialogueShots.push(`[Shot ${shotNum}]\n(No dialogue.)`);
      }
    });

    const hasAnyDialogue = shots.some(s => s.dialogue && s.dialogue.hasDialogue && s.dialogue.dialogueText?.trim());
    if (hasAnyDialogue) {
      dialogueBlock = `\n\ndialogue:\n\n${dialogueShots.join('\n\n')}`;
    }

    // 4. Compile Soundscape & Non-Diegetic Music unless Audio is Silent
    if (audio?.isSilent) {
      return `${header}${multimodalDescription}${dialogueBlock}`;
    }

    const soundscape = AudioEngine.compileSoundscape(audio);
    const music = AudioEngine.compileNonDiegeticMusic(audio);

    return `${header}${multimodalDescription}${dialogueBlock}\n\n${soundscape}\n\n${music}`;
  }

  /**
   * Compiles a single shot into natural English storyboard prose.
   */
  private static compileSingleShot(shot: Shot, index: number, style: string, mode: string, referenceMode: string = 'strict'): string {
    const shotNum = index + 1;
    const parts: string[] = [];
    const isStrict = referenceMode === 'strict';
    const isImageMode = mode === 'I2VA' || mode === 'FL2VA' || mode === 'L2VA';

    // Shot Header & Cut Timing
    if (index === 0) {
      if (style && style.trim() !== '' && style !== 'None' && style !== 'Unstyled') {
        parts.push(`[Shot 1] ${style}.`);
      } else {
        parts.push(`[Shot 1]`);
      }
      if (mode === 'I2VA') {
        if (isStrict) {
          parts.push(`The opening frame begins exactly from <Picture 1>, preserving the original subject appearance, hairstyle, wardrobe, environment, lighting, and composition shown in the reference image.`);
        } else {
          parts.push(`The opening frame references character facial identity from <Picture 1>.`);
        }
      } else if (mode === 'FL2VA') {
        if (isStrict) {
          parts.push(`The opening frame begins exactly from <Picture 1>, preserving the original starting subject appearance, environment, lighting, wardrobe, and composition.`);
        } else {
          parts.push(`The opening frame references starting character features from <Picture 1>.`);
        }
      } else if (mode === 'L2VA') {
        parts.push(`The scene builds toward the final frame which resolves into <Picture 1>.`);
      }
    } else {
      const timeStamp = TimelineEngine.formatTimestamp(shot.startTimeSeconds);
      const transitionWord = shot.transitionToNext === 'cross-dissolve' ? 'cross-dissolves to' : 'cuts to';
      if (isImageMode && isStrict) {
        parts.push(`[Shot ${shotNum}] At ${timeStamp}, the camera ${transitionWord} a new angle, preserving the subject appearance and wardrobe from <Picture 1>.`);
      } else {
        parts.push(`[Shot ${shotNum}] At ${timeStamp}, the camera ${transitionWord} a new framing.`);
      }
    }

    // Environment & Setting (omit in Shot 1 strict mode if reference photo is authoritative)
    if (shot.environment) {
      const env = shot.environment;
      const rawEnvParts = [env.location, env.lighting, env.weather, env.timeOfDay, env.atmosphere]
        .filter(Boolean)
        .map((s) => (s || '').trim())
        .filter((s) => s.length > 0 && !/^n\/?a/i.test(s) && !/^\(.*\)$/.test(s));

      if (rawEnvParts.length > 0 && rawEnvParts[0]) {
        const shouldOmitEnv = isStrict && index === 0 && isImageMode;
        if (!shouldOmitEnv) {
          const cleanLocation = rawEnvParts[0].replace(/^(a|an|the)\s+/i, '');
          const cleanedParts = [cleanLocation, ...rawEnvParts.slice(1)].map((p, idx) => {
            let s = p.trim().replace(/\.+$/, '').replace(/,$/, '');
            if (idx > 0 && /^[A-Z]/.test(s) && !/^(IMAX|HDR|CG|3D|4K|8K)\b/.test(s)) {
              s = s.charAt(0).toLowerCase() + s.slice(1);
            }
            return s;
          });
          const joinedEnv = cleanedParts.join(', ');
          if (!joinedEnv.toLowerCase().includes('picture 1') && !joinedEnv.toLowerCase().includes('setting from')) {
            parts.push(`Set in a ${joinedEnv} environment.`);
          }
        }
      }
    }

    // Character Staging & Identity
    if (shot.character) {
      const char = shot.character;
      let charDesc = char.identity || 'the subject';

      if (isStrict && isImageMode) {
        if (/hair|eyes|skin|sweater|shirt|top|jacket|dress|pants|jeans|hoodie|outfit|wearing|tied back|blonde|brunette|loungewear|camisole|clothing|apparel|robe|vest|coat|attire/i.test(charDesc)) {
          charDesc = 'the subject from <Picture 1>';
        }
      }

      const speakerTag = char.speakerId ? ` (${char.speakerId})` : '';

      // Check if rawActionDescription already contains full sentence prose
      const hasActionProse = shot.rawActionDescription && shot.rawActionDescription.trim().length > 15;

      if (!hasActionProse) {
        const rawPose = (char.pose || '').replace(/^standing\s+(in\s+|on\s+|at\s+)?/i, '').trim().replace(/\.+$/, '');
        let poseStr = '';
        if (rawPose && !rawPose.toLowerCase().includes('starting exactly from') && !rawPose.toLowerCase().includes('picture 1')) {
          if (/^(kneeling|sitting|perched|crouched|lying|leaning|walking|running|drawn|facing|backing|pressing|standing|shoulders|body|head|arms|hands)\b/i.test(rawPose)) {
            poseStr = ` ${rawPose}`;
          } else if (/^(at|on|in|near|by|under|over|beside|facing)\b/i.test(rawPose)) {
            poseStr = ` standing ${rawPose}`;
          } else {
            poseStr = ` standing in ${rawPose}`;
          }
        }

        const rawExpr = (char.expression || '').replace(/^(a|an|the)\s+/i, '').trim().replace(/\.+$/, '');
        let exprStr = '';
        if (rawExpr) {
          if (/\bexpression\b/i.test(rawExpr) || /\beyes\b/i.test(rawExpr) || /\bgasp\b/i.test(rawExpr) || /\bintensifies\b/i.test(rawExpr) || /\bwelling\b/i.test(rawExpr)) {
            exprStr = `, ${rawExpr}`;
          } else if (/^[aeiou]/i.test(rawExpr)) {
            exprStr = ` with an ${rawExpr} expression`;
          } else {
            exprStr = ` with a ${rawExpr} expression`;
          }
        }

        const motionStr = char.motion && !char.motion.toLowerCase().includes('starting exactly') ? `, ${char.motion}` : '';
        parts.push(`${charDesc}${speakerTag}${poseStr}${exprStr}${motionStr}.`);
      }
    }

    // Action Prose
    if (shot.rawActionDescription && shot.rawActionDescription.trim().length > 0) {
      parts.push(shot.rawActionDescription.trim());
    }

    // Spoken Dialogue Inline Tagging: [Character Identity] (Sx) says: <d>[Language] Dialogue</d>
    if (shot.dialogue && shot.dialogue.hasDialogue && shot.dialogue.dialogueText.trim().length > 0) {
      const d = shot.dialogue;
      const speakerId = d.speakerId || 'S1';
      const lang = d.languageTag || 'English';
      
      let charSubject = shot.character?.identity
        ? shot.character.identity.replace(/,?\s*subject from <Picture \d+>/gi, '').trim()
        : isImageMode
        ? 'The subject from <Picture 1>'
        : 'The subject';
      if (!charSubject) {
        charSubject = isImageMode ? 'The subject from <Picture 1>' : 'The subject';
      }

      const transTag = d.carriesAcrossCut ? ' <scenetrans>' : '';
      if (d.isOffScreenVoiceover) {
        parts.push(
          `${charSubject} (${speakerId}) says in an off-screen voiceover: <d>[${lang}] ${d.dialogueText.trim()}</d>${transTag} while their lips remain completely closed.`
        );
      } else {
        parts.push(
          `${charSubject} (${speakerId}) says: <d>[${lang}] ${d.dialogueText.trim()}</d>${transTag}.`
        );
      }
    }

    // Camera Motion (One clean sentence at the end of the shot)
    const cameraSentence = CameraEngine.compileCameraSentence(shot.camera);
    if (cameraSentence && cameraSentence.trim()) {
      parts.push(cameraSentence);
    }

    // Sanitize and deduplicate
    const rawJoined = parts.join(' ');
    return PromptCompiler.sanitizeShotProse(rawJoined);
  }

  /**
   * Sanitizes shot prose to remove repetitive template fragments and stuttering phrases.
   */
  private static sanitizeShotProse(text: string): string {
    return text
      // Fix "[Shot 1] None." or "[Shot 1] None " fragment
      .replace(/\[Shot 1\]\s*None[\.\,\s]\s*/gi, '[Shot 1] ')
      // Fix empty parentheses
      .replace(/\(\s*\)/g, '')
      // Fix space before punctuation
      .replace(/\s+([,.!?])/g, '$1')
      // Fix "standing in Starting..."
      .replace(/standing in Starting /gi, 'Starting ')
      // Fix hardcoded "same room" contradiction
      .replace(/preserving the same room,\s*wardrobe,\s*lighting,\s*and appearance/gi, 'preserving the subject appearance and wardrobe')
      // Fix "set in a setting from <Picture 1>, the lighting from <Picture 1>, as depicted in <Picture 1>, as depicted in <Picture 1>"
      .replace(/(?:as depicted in <Picture 1>|the lighting from <Picture 1>|setting from <Picture 1>)(?:,\s*)?/gi, '')
      .replace(/set in a\s*,?\s*environment\./gi, '')
      // Fix "n/a" and "n/A (indoors)" fragments
      .replace(/,\s*n\/?a\b(\s*\([^)]*\))?/gi, '')
      .replace(/\bwith N\/A\b/gi, '')
      .replace(/\bat N\/A\b/gi, '')
      // Fix duplicate "as depicted in <Picture 1>"
      .replace(/(<Picture 1>)\s*,\s*as depicted in\s*<Picture 1>/gi, '$1')
      // Fix repetitive camera zoom sentences
      .replace(/(The camera [^.]+?\.)\s*The camera \1/gi, '$1')
      // Fix duplicate periods & whitespace
      .replace(/\s+,\s+/g, ', ')
      .replace(/,\s*\./g, '.')
      .replace(/\.\s*\./g, '.')
      .replace(/\s+/g, ' ')
      .trim();
  }
}
