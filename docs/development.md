# 開発（ローカル実行）

このドキュメントは開発者向けです。利用者としては GitHub Pages 上の公開サイトを操作してください（README 参照）。

## 必要環境

- Node.js
- npm

## セットアップ

```bash
npm install
```

## 開発サーバー

```bash
npm run dev
```

## ビルド

```bash
npm run build
```

## テスト

```bash
npm run test
```

抽象時間変換やイベント正規化など、UI 回帰を起こしやすい基礎ロジックの確認に使います。

## 検証

```bash
npm run verify
```

`verify` は `test` と `build` を順に実行します。

## ローカルプレビュー

```bash
npm run preview
```

## デプロイ

GitHub Pages へのデプロイは [docs/deploy.md](docs/deploy.md) を参照してください。
