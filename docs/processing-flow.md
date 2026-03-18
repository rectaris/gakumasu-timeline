# 処理フロー詳細

このドキュメントは、現状の実装が「データ → 表示用構造 → 描画 → インタラクション」をどの順で処理しているかを説明します。

## 起動

- `index.html` に `#app` があり、`src/main.js` が読み込まれる
- `src/main.js` で `createApp(App).mount('#app')`

## データの取り込み

- `src/App.vue` が `src/data/index.js` から `idolCommu` / `hatsuboshiCommus` / `eventCommus` / `supportCardCommus` を import
- カテゴリ別のレーン情報は正規化され、選択されたレーンのみ表示対象になる

## カテゴリ/レーンの選択

- 左メニューでカテゴリとレーンを選択
- 選択結果は `activeLanes` としてタイムライン描画に反映
- 初期状態はカテゴリ内の全レーン選択
- 「一括」チェックでカテゴリ内の全レーンを選択/解除

## 表示用イベントへの変換

`allEvents`（computed）で、選択済みレーンのイベント配列へフラット化します。

- 入力: `activeLanes[n].events[m]`
- 出力: `[{ ...event, character, color, laneIndex, canonicalId, instanceId, startTime, endTime, displayStartDay, displayEndDay }, ...]`
- 共通イベントは各レーンへ複製されます
- URL 同期は `canonicalId`、描画キーは `instanceId` を使います

## 時間の内部表現

`src/utils/time.js` の `timeValue(year, month)` と `dayTimeValue(year, month, day)` を使用します。

- `timeValue(year, month) = year * 12 + (month - 1)`
- `dayTimeValue(year, month, day) = timeValue(year, month) * 31 + (day - 1)`
- `day` がない場合でも、表示用レンジは抽象時系列として月初 / 月末へ補完します
- 実カレンダーではなく、各月31日換算です

## 表示範囲（水平 pan / zoom）

`viewRange`（computed）で表示する最小〜最大の内部時刻を決めます。

- `horizontalCenter`
  - 表示中心の日単位内部時刻
- `horizontalSpan`
  - 表示幅（日数）
- `viewRange.min/max`
  - `horizontalCenter ± horizontalSpan / 2`
- `timeBounds`
  - 全イベントの `displayStartDay / displayEndDay` をもとに算出
- 選択イベントが表示範囲外に出る場合は `fit if needed` で span を広げて再センタリングします

縦方向は `verticalScale` でレーン高さ・行間・バー高さを伸縮します。

## 描画

描画は 1 枚の `<svg>` で行います。

- `xPos(time)`
  - `viewRange.min/max` に対する比率で x 座標を計算
  - 描画幅は `timelineViewport` の幅に合わせる
- イベントの縦位置はサブレーン計算で決定
  - `yPos(laneIndex, subLaneIndex)` が `laneTop + padding + subLaneIndex * rowHeight` を返す

描画内容:

1. 年目盛り（縦グリッド）
   - `years` computed が `viewRange` から年の配列を生成
   - 各年について縦線とラベル（`1年目`, `2年目`, `n年前`）を描画
   - 水平ズームが寄ると日付（1〜31）を薄く補助表示
   - 月ラベルは `◯月` 表記で 1 日目位置の上部に表示
2. キャラレーン
   - キャラ名テキスト
   - レーン線
3. イベント
   - `visibleEvents`（表示範囲に重なるイベント）だけを描画
   - 期間バー: `rect (x=start, width=end-start)`
   - 開始点・終了点: `circle`
   - `occurrenceType === "singleWithinRange"` の場合、バーに破線＋両端の不確定マーカーを追加

## インタラクション

- イベントクリック
  - `selectEvent(event)` → `selectedEvent` を更新
  - `updateUrl(event.canonicalId)` で URL クエリ `event` を同期
- パネルを閉じる
  - `selectedEvent = null`
  - URL クエリから `event` を削除
- キーボード
  - `onMounted` で `keydown` リスナーを登録
  - `ArrowLeft / ArrowRight` で水平 pan
  - `+ / -` で水平 zoom
  - `Escape` でパネルを閉じる
- ホイール
  - 通常ホイールで水平 pan
  - `Ctrl / Cmd / Alt + Wheel` で水平 zoom
- タッチ
  - 横ドラッグで水平 pan

## URL からの復元

初回マウント時に `window.location.search` を読み、`?event=<id>` があれば `allEvents` から該当 canonical ID のイベントを検索して `selectedEvent` を復元します。

## 既知の制約（現状）

- 各月31日換算の抽象時系列であり、実カレンダー計算はしていません
- `singleWithinRange` は候補期間だけを持ち、具体的な発生日は未確定です
- 共通イベントは表示上レーンごとに複製されます
