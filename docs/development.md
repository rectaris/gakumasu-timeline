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

## UI変更時の確認

- `npm run verify` を通して、基礎ロジックと build が崩れていないことを先に確認します。
- UI や操作感に関わる変更では、これに加えて実ブラウザ確認も行ってください。

優先して確認する項目:

- ホイールによる横方向の拡大縮小
- ドラッグによる上下左右の移動
- イベント選択と詳細パネルの開閉
- 共通イベント選択時の URL 復元
- `singleWithinRange` の表示と詳細文言

可能なら、Windows Chrome を最優先に確認してください。

## ローカルプレビュー

```bash
npm run preview
```

## デプロイ

GitHub Pages へのデプロイは [docs/deploy.md](docs/deploy.md) を参照してください。
