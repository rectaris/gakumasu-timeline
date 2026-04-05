---
date: "2026-04-05"
topic: "vercel-labs/agent-browser"
type: consultation
---

# Research: vercel-labs/agent-browser

社長からのご質問に基づき、`https://github.com/vercel-labs/agent-browser` について調査した内容をまとめます。

## 概要
AIエージェント（Gemini CLI, Cursor, Claude Codeなど）がウェブブラウザを操作・自動化するために特化して開発されたCLIツールです。

## 主な特徴
- **トークン効率の最適化 (Snapshot-based)**:
  巨大なDOMツリーをそのままAIに渡すのではなく、画面上のインタラクティブな要素だけを抽出し、`@e1`, `@e2` といった短い参照ID（スナップショット）で表現します。これにより、Playwrightなどを直接使うよりもLLMのトークン消費量を最大90%削減できます。
- **高速な実行環境**:
  コアとなるCLIはRustで書かれており（50ms以下で応答）、裏側でNode.jsのデーモンがPlaywrightを管理するアーキテクチャを採用しています。
- **セマンティックな操作**:
  AIは抽出された短いID（例: `agent-browser click @e1`）を使って、正確に要素をクリックしたりテキストを入力したりできます。
- **独立したセッション**:
  複数のブラウザセッションを並列で立ち上げ、Cookieや履歴を分離できるため、マルチエージェントでの並行作業にも向いています。

## 導入方法（Quick Start）
```bash
npm install -g agent-browser
agent-browser install  # Chromiumのダウンロード
```
使用例:
```bash
agent-browser open https://example.com
agent-browser snapshot  # 要素リストとID（@e1など）の生成
agent-browser click @e1 # IDを指定してクリック
```

## 当社（ワークスペース）での活用可能性
- **Skillとしての統合**:
  VercelはAIエージェント向けのSkillファイル (`SKILL.md`) も提供しています。当社の `codex-skills/` リポジトリにこのSkillを配置することで、現在のGemini CLI環境に「ブラウザを直接操作してリサーチやテストを行う機能」をネイティブに組み込むことが可能です。
- Timelineアプリの実ブラウザE2Eテストの自動化などにも応用できる可能性があります。
