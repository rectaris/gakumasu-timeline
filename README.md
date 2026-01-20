# gakumasu-timeline

キャラクターごとの出来事（期間）を、横軸＝時間・縦軸＝キャラクターのレーンで可視化するシンプルなタイムライン表示アプリです。

## 公開サイト（GitHub Pages）

このプロジェクトは GitHub Pages 上で動作することを前提としています。

- URL: `https://rectaris.github.io/gakumasu-timeline/`

## 使い方（サイト操作）

### 画面の見方

- 横軸: 時間
- 縦軸: キャラクター（キャラごとに 1 レーン）
- 色付きのバー: イベント（開始〜終了の期間）

### イベントの詳細を見る

- バー（イベント）をクリックすると、右側のパネルに詳細が表示されます
- バーにマウスオーバーすると、ブラウザのツールチップ（`title`）で概要が表示されます

### 詳細パネルを閉じる

- 右上の「×」を押す
- キーボードの `Escape` を押す

### 表示範囲（ズーム）

- 「全期間」: すべてのイベントが入るスケールで表示
- 「年ズーム」: 特定の年付近を拡大して表示
  - 「中心年」スライダーで中心となる年を動かせます

### URL 共有（選択状態のリンク）

イベントを選択すると URL に `?event=<eventId>` が付きます。

- その URL を共有すると、同じイベントが選択された状態で開けます
- `event` の値はデータ側のイベント `id` です

## 既知の制約（現状）

- タイムラインの位置計算は月単位です（イベントデータの `day` は表示に反映されません）
- 開始と終了が同じ月のイベントは、期間バーの幅が 0 に近く見えにくい場合があります（開始点の丸は表示されます）

## 技術スタック

- Vue 3（SFC / `<script setup>`）
- Vite
- デプロイ: GitHub Pages（`gh-pages`）

## データの置き場所

- キャラ/イベントデータ: [src/data/characters/](src/data/characters/)
- データ集約: [src/data/index.js](src/data/index.js)

## 詳細ドキュメント

実装の細部（データ構造、描画の計算式、URL 同期、既知の制約など）は `docs/` 配下にまとめています。

- [docs/processing-flow.md](docs/processing-flow.md)
- [docs/data-structure.md](docs/data-structure.md)
- [docs/ui-behavior.md](docs/ui-behavior.md)
- [docs/deploy.md](docs/deploy.md)
- [docs/development.md](docs/development.md)
