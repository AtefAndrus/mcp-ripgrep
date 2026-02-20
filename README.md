# @atefandrus/mcp-ripgrep

[![npm version](https://img.shields.io/npm/v/@atefandrus/mcp-ripgrep)](https://www.npmjs.com/package/@atefandrus/mcp-ripgrep)
[![CI](https://github.com/AtefAndrus/mcp-ripgrep/actions/workflows/ci.yml/badge.svg)](https://github.com/AtefAndrus/mcp-ripgrep/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

[ripgrep](https://github.com/BurntSushi/ripgrep) の検索機能を提供する MCP サーバー。

## 前提条件

- [ripgrep](https://github.com/BurntSushi/ripgrep) (`rg`) がインストール済みで PATH に含まれていること
- Node.js 22+ または Bun 1.3+

## インストール

```bash
npm install @atefandrus/mcp-ripgrep
```

## 使い方

### MCP サーバーとして利用

MCP クライアントの設定に以下を追加する:

```json
{
  "mcpServers": {
    "ripgrep": {
      "command": "npx",
      "args": ["@atefandrus/mcp-ripgrep"]
    }
  }
}
```

### ツール一覧

| ツール | 説明 |
|---|---|
| `search` | 正規表現・リテラル文字列・複数行マッチ・コンテキスト行・各種フィルタに対応したパターン検索 |
| `search-and-replace` | 検索置換のプレビュー (読み取り専用。ファイルは変更しない) |
| `search-count` | ファイルごとのマッチ数カウント (行数またはマッチ総数) |
| `search-files` | パターンにマッチする/しないファイルの一覧 |
| `list-files` | 検索スコープ内の全ファイル一覧 |
| `list-file-types` | ripgrep がサポートするファイルタイプの一覧 |

### 主要パラメータ

| パラメータ | 説明 |
|---|---|
| `pattern` | 検索パターン (デフォルトは正規表現) |
| `path` | 検索対象のディレクトリまたはファイル |
| `fixedStrings` | パターンをリテラル文字列として扱う |
| `caseSensitive` | `true` = 大小区別、`false` = 大小無視、省略 = smart-case |
| `fileType` | ファイルタイプでフィルタ (例: `ts`, `py`) |
| `glob` | glob パターンでフィルタ |
| `includeHidden` | 隠しファイルを含める |

## 開発

```bash
# 依存関係のインストール
bun install

# テスト実行
bun test

# 型チェック
bunx tsc --noEmit

# Lint とフォーマット
bunx biome check --write .

# ビルド
bunx tsc

# 開発モードで起動
bun run dev
```

## セキュリティ

このサーバーは `spawn("rg", args)` で引数を配列として渡す (シェル補間なし)。パターンとパスは `--` セパレータの後に配置し、フラグインジェクションを防止する。

## ライセンス

MIT
