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

`verify` は `validate:data`、`test`、`build` を順に実行します。

## タイムライン描画メトリクス

開発サーバーで `?debugMetrics=1` を付けて開くと、タイムライン左下に開発用の描画メトリクスを表示します。

```bash
npm run dev
```

例: `http://localhost:5173/timeline/?debugMetrics=1`

表示は Vite の dev build のみ有効です。URL フラグを使うと `localStorage` に保存され、以後の開発表示でも継続します。無効化する場合は `?debugMetrics=0` で開きます。

主な確認項目:

- `events`: 現在データの displayed instance 数と canonical event 数
- `filtered`: 検索・絞り込み後の displayed instance 数と canonical event 数
- `visible`: 表示範囲に交差する summary 前のイベント数
- `render`: dense summary 置換後に描画へ渡る item 数
- `summary`: summary item 数、内包イベント数、削減 item 数
- `density`: レーン単位の表示密度
- `screen`: 画面面積あたりの表示密度

CLI の synthetic layout baseline は次で確認します。

```bash
npm run measure:layout
```

必要に応じて環境変数で規模を変えます。

```bash
TIMELINE_MEASURE_LANES=64 TIMELINE_MEASURE_EVENTS_PER_LANE=240 npm run measure:layout
```

性能作業では、デフォルトカテゴリ、共通イベント on/off、検索・絞り込み、レーン集中、レーン比較、密集範囲の拡大縮小でメトリクスを見ます。最適化へ進む判断は、数値の悪化だけでなくホイールズーム、ドラッグ、フィルタ変更、レーン表示切替、イベント選択の操作感確認とセットで行います。

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
