const STATS_LINE =
  /^\d+ (match(es)?|matched lines?|files? contained match(es)?|files? searched|bytes? printed|bytes? searched)$/;
const STATS_TIME = /^[\d.]+ seconds?( spent searching| total)?$/;

function isStatsLine(line: string): boolean {
  const trimmed = line.trim();
  return STATS_LINE.test(trimmed) || STATS_TIME.test(trimmed);
}

export interface StatsResult {
  content: string;
  summary: string | null;
}

export function extractStats(stdout: string): StatsResult {
  const lines = stdout.split("\n");

  let statsStart = lines.length;
  for (let i = lines.length - 1; i >= 0; i--) {
    if (isStatsLine(lines[i])) {
      statsStart = i;
    } else if (lines[i].trim() === "") {
      if (statsStart < lines.length) break;
    } else {
      break;
    }
  }

  if (statsStart >= lines.length) {
    return { content: stdout, summary: null };
  }

  const statsLines = lines.slice(statsStart).filter((l) => l.trim());
  const content = lines.slice(0, statsStart).join("\n").replace(/\n+$/, "");

  const matches = statsLines.find((l) => /^\d+ match(es)?$/.test(l.trim()));
  const filesMatched = statsLines.find((l) =>
    /^\d+ files? contained match(es)?$/.test(l.trim()),
  );
  const filesSearched = statsLines.find((l) =>
    /^\d+ files? searched$/.test(l.trim()),
  );
  const parts = [matches, filesMatched, filesSearched]
    .filter(Boolean)
    .map((s) => (s as string).trim());
  const summary = parts.length > 0 ? parts.join(", ") : null;

  return { content, summary };
}
