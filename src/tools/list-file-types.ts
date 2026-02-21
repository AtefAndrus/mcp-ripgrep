import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { formatToolResult } from "../format-result.js";
import { buildListFileTypesCommand } from "../rg/builder.js";
import { executeRgCommand } from "../rg/executor.js";
import type { ServerConfig } from "../server.js";

export function registerListFileTypesTool(
  server: McpServer,
  config: ServerConfig,
): void {
  server.registerTool(
    "list-file-types",
    {
      title: "Ripgrep List File Types",
      description:
        "List all file types supported by ripgrep. Useful for finding valid values for the fileType parameter.",
      inputSchema: {
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
        const cmd = buildListFileTypesCommand();
        const result = await executeRgCommand(cmd);
        const limit = args.maxCharacters ?? config.defaultMaxCharacters;
        return formatToolResult(result, "", limit);
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
