export interface TruncateResult {
  text: string;
  truncated: boolean;
  originalLength: number;
}

export function truncateText(
  text: string,
  maxCharacters?: number,
): TruncateResult {
  if (maxCharacters === undefined || text.length <= maxCharacters) {
    return { text, truncated: false, originalLength: text.length };
  }

  // Find the last newline within the limit to cut at a line boundary
  const lastNewline = text.lastIndexOf("\n", maxCharacters);
  const cutPoint = lastNewline > 0 ? lastNewline : maxCharacters;

  return {
    text: text.slice(0, cutPoint),
    truncated: true,
    originalLength: text.length,
  };
}
