import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { formatToolResult } from "../format-result.js";
import { validatePath } from "../path-guard.js";
import { buildCountCommand } from "../rg/builder.js";
import { type ExecuteOptions, executeRgCommand } from "../rg/executor.js";
import type { ServerConfig } from "../server.js";

type SortMode = "path" | "count" | "count-asc";

function sortCountOutput(output: string, mode: SortMode): string {
  const lines = output.split("\n").filter((l) => l.length > 0);
  const parsed = lines.map((line) => {
    const sep = line.lastIndexOf(":");
    return {
      path: line.slice(0, sep),
      count: Number(line.slice(sep + 1)),
      raw: line,
    };
  });

  if (mode === "path") {
    parsed.sort((a, b) => a.path.localeCompare(b.path));
  } else if (mode === "count") {
    parsed.sort((a, b) => b.count - a.count);
  } else {
    parsed.sort((a, b) => a.count - b.count);
  }

  return parsed.map((p) => p.raw).join("\n");
}

export function registerSearchCountTool(
  server: McpServer,
  config: ServerConfig,
): void {
  server.registerTool(
    "search-count",
    {
      title: "Ripgrep Search Count",
      description:
        "Count pattern matches per file using ripgrep. Returns file paths with their match counts.",
      inputSchema: {
        pattern: z.string().describe("Search pattern (regex by default)"),
        path: z.string().describe("Directory or file to search"),
        countMode: z
          .enum(["lines", "matches"])
          .optional()
          .describe(
            "'lines' counts matching lines (default), 'matches' counts all matches including multiple per line",
          ),
        fixedStrings: z
          .boolean()
          .optional()
          .describe("Treat pattern as a literal string"),
        caseSensitive: z
          .boolean()
          .optional()
          .describe(
            "true = case-sensitive, false = case-insensitive, omit = smart-case",
          ),
        wordMatch: z.boolean().optional().describe("Only match whole words"),
        fileType: z
          .union([z.string(), z.array(z.string())])
          .optional()
          .describe("Filter by file type (e.g. 'ts', 'py')"),
        fileTypeNot: z
          .union([z.string(), z.array(z.string())])
          .optional()
          .describe("Exclude file type"),
        glob: z
          .union([z.string(), z.array(z.string())])
          .optional()
          .describe("Glob pattern to filter files"),
        includeHidden: z
          .boolean()
          .optional()
          .describe("Include hidden files and directories"),
        includeZero: z
          .boolean()
          .optional()
          .describe("Include files with zero matches in the output"),
        noIgnore: z
          .boolean()
          .optional()
          .describe(
            "Do NOT respect .gitignore rules (search files that are normally ignored)",
          ),
        sortBy: z
          .enum(["path", "count", "count-asc"])
          .optional()
          .describe(
            "Sort results: 'path' (alphabetical), 'count' (descending), 'count-asc' (ascending)",
          ),
        maxCharacters: z
          .number()
          .optional()
          .describe(
            "Maximum characters in the result. Truncated with summary if exceeded.",
          ),
      },
    },
    async (args) => {
      try {
        validatePath(args.path, config.allowedDirs);
        const cmd = buildCountCommand(args);
        const execOpts: ExecuteOptions = {
          maxOutputBytes: config.maxOutputBytes,
        };
        const result = await executeRgCommand(cmd, execOpts);
        const stdout =
          args.sortBy && result.stdout
            ? sortCountOutput(result.stdout, args.sortBy)
            : result.stdout;
        const limit = args.maxCharacters ?? config.defaultMaxCharacters;
        return formatToolResult(
          { ...result, stdout },
          "No matches found.",
          limit,
        );
      } catch (error) {
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: `Error: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    },
  );
}
