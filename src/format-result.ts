import type { RgResult } from "./rg/types.js";
import { truncateText } from "./truncate.js";

export function formatToolResult(
  result: RgResult,
  emptyMessage: string,
  maxCharacters?: number,
  statsSummary?: string | null,
): { content: Array<{ type: "text"; text: string }> } {
  const body = result.stdout || emptyMessage;
  const { text, truncated, originalLength } = truncateText(body, maxCharacters);

  const parts: string[] = [];

  if (statsSummary) {
    parts.push(`[${statsSummary}]\n\n`);
  }

  parts.push(text);

  if (truncated) {
    parts.push(
      `\n\n--- Result truncated ---\nShowing: ${maxCharacters?.toLocaleString()} / ${originalLength.toLocaleString()} characters\nTip: Use fileType, glob, maxResults, or maxDepth to narrow the search scope.`,
    );
  }

  if (result.stderr.trim()) {
    parts.push(`\n\n--- Warning (stderr) ---\n${result.stderr.trim()}`);
  }

  return { content: [{ type: "text", text: parts.join("") }] };
}
