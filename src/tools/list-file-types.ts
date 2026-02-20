import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { buildListFileTypesCommand } from "../rg/builder.js";
import { executeRgCommand } from "../rg/executor.js";

export function registerListFileTypesTool(server: McpServer): void {
  server.registerTool(
    "list-file-types",
    {
      title: "Ripgrep List File Types",
      description:
        "List all file types supported by ripgrep. Useful for finding valid values for the fileType parameter.",
      inputSchema: {},
    },
    async () => {
      try {
        const cmd = buildListFileTypesCommand();
        const result = await executeRgCommand(cmd);
        return {
          content: [{ type: "text", text: result.stdout }],
        };
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
