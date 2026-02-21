# @atef_andrus/mcp-ripgrep

[![npm version](https://img.shields.io/npm/v/@atef_andrus/mcp-ripgrep)](https://www.npmjs.com/package/@atef_andrus/mcp-ripgrep)
[![CI](https://github.com/AtefAndrus/mcp-ripgrep/actions/workflows/ci.yml/badge.svg)](https://github.com/AtefAndrus/mcp-ripgrep/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

An MCP server that provides [ripgrep](https://github.com/BurntSushi/ripgrep) search capabilities.

## Prerequisites

- [ripgrep](https://github.com/BurntSushi/ripgrep) (`rg`) installed and available on PATH
- Node.js 22+ or Bun 1.3+

## Installation

```bash
npm install @atef_andrus/mcp-ripgrep
```

## Usage

### Use as an MCP Server

Add the following to your MCP client configuration:

```json
{
  "mcpServers": {
    "ripgrep": {
      "command": "npx",
      "args": ["@atef_andrus/mcp-ripgrep"]
    }
  }
}
```

### Startup Options

| Option | Description |
|---|---|
| `--allow-dir <path>` | Restrict search scope to the specified directory (can be specified multiple times) |
| `--max-result-chars <number>` | Maximum characters in results. Truncates at line boundaries when exceeded (default: 50,000) |
| `--max-output-bytes <number>` | Maximum bytes of ripgrep output. Terminates the process and truncates results when exceeded (default: 20 MB) |

Configuration example with startup options:

```json
{
  "mcpServers": {
    "ripgrep": {
      "command": "npx",
      "args": [
        "@atef_andrus/mcp-ripgrep",
        "--allow-dir", "/home/user/project",
        "--max-result-chars", "50000",
        "--max-output-bytes", "20000000"
      ]
    }
  }
}
```

### Tools

| Tool | Description |
|---|---|
| `search` | Pattern search with regex, literal strings, multiline matching, OR matching, context lines, and various filters. Prepends a summary of match count and file count to results |
| `search-and-replace` | Search-and-replace preview (read-only). Supports multiline matching and capture groups ($1, ${name}) |
| `search-count` | Count matches per file (by line count or total matches). Supports sorting results |
| `search-files` | List files that match or do not match a pattern |
| `list-files` | List all files within the search scope |
| `list-file-types` | List file types supported by ripgrep |

### Key Parameters

| Parameter | Description |
|---|---|
| `pattern` | Search pattern (regex by default) |
| `path` | Directory or file to search |
| `fixedStrings` | Treat the pattern as a literal string |
| `caseSensitive` | `true` = case-sensitive, `false` = case-insensitive, omitted = smart-case |
| `fileType` | Filter by file type (e.g., `"ts"`, `["ts", "js"]`). String or array |
| `fileTypeNot` | Exclude file types (e.g., `"json"`, `["json", "md"]`). String or array |
| `glob` | Filter by glob pattern (e.g., `"*.test.ts"`, `["src/**", "!vendor/**"]`). String or array |
| `includeHidden` | Include hidden files |
| `followSymlinks` | Follow symbolic links |
| `maxDepth` | Maximum directory traversal depth |
| `noIgnore` | Ignore .gitignore rules and search files that are normally excluded |
| `multiline` | Enable multiline matching (function signatures, import blocks, etc.) |
| `additionalPatterns` | Additional patterns for OR matching (array) |
| `sortBy` | Sort results. search / search-files / list-files: `"path"` `"modified"` `"created"`. search-count: `"path"` `"count"` `"count-asc"` |
| `maxCharacters` | Maximum characters in results. Truncates at line boundaries and appends a summary when exceeded |

### Parameter Support by Tool

<!-- params-table-start -->
| Parameter | `list-file-types` | `list-files` | `search` | `search-and-replace` | `search-count` | `search-files` |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| `pattern` | - | - | o | o | o | o |
| `path` | - | o | o | o | o | o |
| `fixedStrings` | - | - | o | o | o | o |
| `caseSensitive` | - | - | o | o | o | o |
| `wordMatch` | - | - | o | o | o | o |
| `multiline` | - | - | o | o | - | - |
| `fileType` | - | o | o | o | o | o |
| `fileTypeNot` | - | o | o | o | o | o |
| `glob` | - | o | o | o | o | o |
| `maxResults` | - | - | o | o | - | - |
| `contextLines` | - | - | o | - | - | - |
| `beforeContext` | - | - | o | - | - | - |
| `afterContext` | - | - | o | - | - | - |
| `invertMatch` | - | - | o | - | - | o |
| `includeHidden` | - | o | o | o | o | o |
| `followSymlinks` | - | o | o | o | o | o |
| `maxDepth` | - | o | o | o | o | o |
| `additionalPatterns` | - | - | o | - | - | - |
| `jsonOutput` | - | - | o | - | - | - |
| `maxColumns` | - | - | o | - | - | - |
| `noIgnore` | - | o | o | o | o | o |
| `sortBy` | - | o | o | - | o | o |
| `maxCharacters` | o | o | o | o | o | o |
| `replacement` | - | - | - | o | - | - |
| `onlyMatching` | - | - | - | o | - | - |
| `countMode` | - | - | - | - | o | - |
| `includeZero` | - | - | - | - | o | - |
<!-- params-table-end -->

## Development

```bash
# Install dependencies
bun install

# Run tests
bun test

# Type check
bunx tsc --noEmit

# Lint and format
bunx biome check --write .

# Build
bunx tsc

# Start in development mode
bun run dev
```

## Security

- This server passes arguments as an array via `spawn("rg", args)` (no shell interpolation). Patterns and paths are placed after a `--` separator to prevent flag injection.
- The `--allow-dir` option restricts the search scope to specified directories. Paths are resolved to absolute paths using `path.resolve()` and validated via prefix matching.
- **Limitation**: When `followSymlinks` is enabled, symbolic links may allow access to directories outside the allowed scope. Be aware of this when using `--allow-dir` together with `followSymlinks`.

## License

MIT
