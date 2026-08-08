export class TitleGenerator {
  /**
   * Generates a clean, punchy 3-5 word recognition heading from raw prompt text, idea, or visual descriptors.
   */
  public static generateCinematicTitle(rawText: string, style?: string, mode?: string): string {
    if (!rawText || !rawText.trim()) {
      return style ? `${style} Scene` : 'Untitled MiniMax Scene';
    }

    const textLower = rawText.toLowerCase();

    if (textLower.includes('under blanket') || textLower.includes('under the blanket')) {
      if (textLower.includes('selfie')) return 'Blanket Naked Selfie';
      return 'Under Blanket Bedroom Scene';
    }

    if (textLower.includes('video call') || textLower.includes('nude video')) {
      return 'Bedroom Naked Video Call';
    }

    if (textLower.includes('beach') && textLower.includes('sunny')) {
      return 'Sunny Beach Towel & Surf Run';
    }

    let clean = rawText
      .replace(/<\/?Picture[^>]*>/gi, '')
      .replace(/<d>.*?<\/d>/gi, '')
      .replace(/analyze\s+image/gi, '')
      .replace(/identify\s+dress\s+and\s+take\s+it\s+off/gi, 'Dress Removal')
      .replace(/doing\s+nude\s+video\s+call\s+with\s+her\s+bf/gi, 'Nude Video Call')
      .replace(/camera\s+angle\s+is\s+from\s+phones?\s+perspective/gi, '')
      .replace(/no\s+othe\s*r?\s*person\s+visible/gi, '')
      .replace(/and\s+saying\s+like\s+this\s+is\s+the\s+last\s+nude\s+photo\s+etc/gi, '')
      .replace(/take\s+it\s+off/gi, 'Removal')
      .replace(/need\s+same\s+pose\s+shots?/gi, 'Pose Series')
      .replace(/make\s+it\s+sensual\s+scene/gi, 'Sensual Scene')
      .replace(/make\s+her\s+naked/gi, 'Nude Scene')
      .replace(/keeping\s+camera\s+at\s+same\s+angle/gi, '')
      .replace(/start\s+same\s+scene\s+from\s+dark/gi, '')
      .replace(/keep\s+penis\s+inside\s+her\s+mouth\s+fully\s+innside/gi, 'Intimate Mouth Action')
      .replace(/she\s+removes\s+her\s+clothes\s+and\s+throw\s+away\s+then\s+keep\s+taking\s+selfie\s+naked/gi, 'Selfie Strip & Posing')
      .replace(/using\s+mobile\s+amateur/gi, '')
      .replace(/cinematic\s+view/gi, '')
      .replace(/cinematic\s+video-generation\s+prompt/gi, '')
      .replace(/etc\.?/gi, '')
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (!clean || clean.length < 3) {
      return style ? `${style} Scene` : 'Cinematic Video Scene';
    }

    const words = clean.split(' ').filter((w) => w.length > 1 || w.toLowerCase() === 'a');
    const capitalized = words
      .slice(0, 5)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');

    return capitalized || 'MiniMax H3 Scene';
  }
}
