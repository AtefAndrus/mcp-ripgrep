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
bun run scripts/generate-param-table.ts --write  # README パラメータ対応表を再生成
```

## アーキテクチャ

- ツール定義は `src/tools/` に 1 ファイル 1 ツールで配置。新ツール追加時は既存ツール (例: `src/tools/search.ts`) をテンプレートとして使い、`src/server.ts` に register 呼び出しを追加する
- コマンド構築 (`src/rg/builder.ts`) と実行 (`src/rg/executor.ts`) は分離されている。builder は純粋関数で `{ command, args[] }` を返すだけなので、rg バイナリなしで単体テスト可能
- builder はシェルを介さず `spawn("rg", args)` 用の引数配列を構築する。この設計はセキュリティ上の要件 (後述) による

## テスト

- `bun:test` を使用。テストファイルは `tests/` 直下に配置
- builder テスト (`tests/builder.test.ts`) は rg バイナリ不要。executor テスト以降は rg が必要
- MCP 統合テスト (`tests/mcp.test.ts`) は `InMemoryTransport` + `Client` でプロトコルレベル検証。新ツール追加時はここにテストケースを追加する
- テストフィクスチャは `tests/fixtures/` に配置

## 注意事項

- ツールのパラメータを追加・削除・変更したら `bun run scripts/generate-param-table.ts --write` を実行して README の対応表を更新する。CI では検証されないため忘れやすい
- `caseSensitive` は `true`/`false`/`undefined` の三値で挙動が変わる (`builder.ts:10-17`)。`if (caseSensitive)` のような二値判定をすると `undefined` (smart-case) のパスが壊れる
- `executor.ts` の exit code 判定: rg は「マッチなし」を exit code 1 で返す。code 0-1 は正常、2 以上がエラー
- `path-guard.ts` は `path.resolve()` + プレフィックス一致で検証する。`fs.realpathSync` は意図的に使っていない (symlink は未解決)
- リリースは `git tag vX.Y.Z && git push origin vX.Y.Z` で自動公開。publish ワークフローが npm に `--provenance` 付きで publish する

## セキュリティ

このサーバーは MCP 経由でユーザー入力 (検索パターン、パス) をそのまま rg プロセスに渡す。シェルインジェクション防止が最重要。

- `shell: true` は絶対に使わない。`spawn` の第2引数に配列で引数を渡す
- 文字列結合やテンプレートリテラルでコマンド文字列を組み立てない
- パターンとパスは `--` セパレータの後に配置する (フラグインジェクション防止)
