# mcp-ripgrep

ripgrep の検索機能を提供する MCP サーバー。

## コマンド

```bash
bun install          # 依存関係インストール
bun test             # テスト実行
bun test tests/builder.test.ts  # 単体テストのみ
bun test tests/mcp.test.ts      # MCP 統合テストのみ
bunx tsc --noEmit    # 型チェック
bunx biome check .   # Lint
bunx biome check --write .  # Lint + フォーマット自動修正
bunx tsc             # ビルド (dist/ に出力)
bun run scripts/generate-param-table.ts --write  # README パラメータ対応表を再生成 (ツールのパラメータ追加・削除時に実行)
```

## コード規約

- ES Modules (`import`/`export`) を使用。CommonJS は不可
- インデント: スペース2個 (Biome で強制)
- フォーマッター/リンター: Biome (`recommended` ルール)
- 型チェック: TypeScript strict mode

## アーキテクチャ

```
src/
├── index.ts          # エントリポイント (CLI引数パース + stdio transport)
├── server.ts         # McpServer ファクトリ (ServerConfig, 6ツール登録)
├── path-guard.ts     # パス検証 (--allow-dir)
├── truncate.ts       # 結果の文字数制限
├── stats.ts          # search の --stats 出力パース (サマリ抽出)
├── format-result.ts  # ツール結果フォーマット (truncate + stderr 警告 + stats サマリ + executor truncation 警告)
├── rg/
│   ├── types.ts      # 型定義 (RgSearchOptions, RgCommand, RgResult 等)
│   ├── builder.ts    # 純粋関数: オプション → { command, args[] }
│   └── executor.ts   # spawn 実行、exit code ハンドリング、出力バイト数制限
└── tools/            # 各ツールの registerTool 定義
    ├── search.ts
    ├── search-replace.ts
    ├── search-count.ts
    ├── search-files.ts
    ├── list-files.ts
    └── list-file-types.ts

scripts/
└── generate-param-table.ts  # README のツール別パラメータ対応表を自動生成

.github/workflows/
├── ci.yml            # CI: push/PR で lint・型チェック・テスト実行
└── publish.yml       # npm 公開: v* タグ push で自動 publish (lint・テスト付き)
```

- `builder.ts` はシェルを介さず `spawn("rg", args)` 用の引数配列を構築する
- パターンとパスは `--` セパレータの後に配置し、フラグインジェクションを防止する
- `caseSensitive` 省略時は `-S` (smart-case) がデフォルト
- `executor.ts` は stdout のバイト数を追跡し、`maxOutputBytes` (デフォルト 20 MB) 超過時に SIGTERM でプロセスを停止する

## テスト

- `bun:test` を使用
- 5層構成: ユーティリティ単体テスト (path-guard, truncate, format-result, stats) → builder 単体テスト (rg 不要) → executor 統合テスト → MCP 統合テスト
- MCP 統合テストは `InMemoryTransport` + `Client` でプロトコルレベルの検証を行う
- テストフィクスチャは `tests/fixtures/` に配置

## CI/CD

- **CI** (`ci.yml`): main への push/PR で lint (`biome check`)・型チェック (`tsc --noEmit`)・テスト (`bun test`) を実行
- **Publish** (`publish.yml`): `v*` タグ push で `npm publish --provenance` を自動実行
- CI ランナーには `apt-get install -y ripgrep` で rg をインストール (テストが実バイナリを使用するため)

## リリース手順

```bash
git tag vX.Y.Z
git push origin vX.Y.Z
```

タグ push で publish ワークフローが起動し、npm に自動公開される。

## セキュリティ

- `shell: true` は絶対に使わない
- 文字列結合でコマンドを組み立てない
- ユーザー入力は必ず配列の個別要素として `spawn` に渡す
- `--allow-dir` でパス制限時、`path.resolve()` + プレフィックス一致で検証。symlink は未解決 (`fs.realpathSync` 未使用)
