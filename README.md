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
- 丸マーカー: 開始点・終了点（キャラ色で表示）
- 破線バー＋中央点: 「期間内のどこか1日」で起きるイベント（`occurrenceType: "singleWithinRange"`）
- キャラ名: キャラ色の背景＋補色テキスト
- タイムライン枠: 描画領域を薄い枠線と背景で表示

### イベントの詳細を見る

- バー（イベント）をクリックすると、右側のパネルに詳細が表示されます
- バーにマウスオーバーすると、ブラウザのツールチップ（`title`）で概要が表示されます

### 詳細パネルを閉じる

- 右上の「×」を押す
- キーボードの `Escape` を押す

### 表示範囲（ズーム）

- 「全期間」: すべてのイベントが入るスケールで表示
- 「年表示」: 特定の年付近を拡大して表示
  - 「中心年」スライダーで中心となる年を動かせます
- 「月表示」: 中心年月の前後数か月を拡大して表示
  - 「中心年月」スライダーで中心月を動かせます
- ズーム切り替えは「− / ＋」で段階的に変更します
- 年・月スライダーの左右に `< / >` ボタンがあり、1単位ずつ移動できます（長押し対応）
- 月表示時は日単位で正確に描画され、日付ラベルと月名ラベルが上部に表示されます

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

- キャラ/イベントデータ: [src/data/worldline_commu/](src/data/worldline_commu/)
- データ集約: [src/data/index.js](src/data/index.js)
- 世界線一覧: [src/data/worldlines.js](src/data/worldlines.js)
- キャラクター一覧: [src/data/characterCatalog.js](src/data/characterCatalog.js)

## 詳細ドキュメント

実装の細部（データ構造、描画の計算式、URL 同期、既知の制約など）は `docs/` 配下にまとめています。

- [docs/processing-flow.md](docs/processing-flow.md)
- [docs/data-structure.md](docs/data-structure.md)
- [docs/ui-behavior.md](docs/ui-behavior.md)
- [docs/deploy.md](docs/deploy.md)
- [docs/development.md](docs/development.md)
