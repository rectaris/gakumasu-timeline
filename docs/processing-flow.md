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
- カテゴリごとに検索語と並び替え状態を保持する
- 検索はメニュー上の表示対象だけを絞り込む
- 並び替えはメニュー表示順と `activeLanes` の並び順の両方に反映する
- 選択結果は `activeLanes` としてタイムライン描画に反映
- 初期状態はカテゴリ内の全レーン選択
- 「表示中を一括」で現在見えているレーンを選択/解除

## 表示用イベントへの変換

`allEvents`（computed）で、選択済みレーンのイベント配列へフラット化します。

- 入力: `activeLanes[n].events[m]`
- 出力: `[{ ...event, character, color, laneIndex, canonicalId, instanceId, displayStartDay, displayEndDay }, ...]`
- 共通イベントは各レーンへ複製されます
- URL 同期は `canonicalId`、描画キーは `instanceId` を使います

## 時間の内部表現

`src/utils/time.js` の `timeValue(year, month)` と `dayTimeValue(year, month, day)` を使用します。

- `timeValue(year, month) = year * 12 + (month - 1)`
- `dayTimeValue(year, month, day) = timeValue(year, month) * 31 + (day - 1)`
- `day` がない場合でも、表示用レンジは抽象時系列として月初 / 月末へ補完します
- 実カレンダーではなく、各月31日換算です

## 表示範囲（水平移動 / 拡大縮小）

`viewRange`（computed）で表示する最小〜最大の内部時刻を決めます。

- `horizontalCenter`
  - 表示中心の日単位内部時刻
- `horizontalSpan`
  - 表示幅（日数）
- `viewRange.min/max`
  - `horizontalCenter ± horizontalSpan / 2`
- `timeBounds`
  - 全イベントの `displayStartDay / displayEndDay` をもとに算出
  - 一時的に表示イベントが 0 件になった場合は、直前の有効な境界を維持
- 選択イベントが表示範囲外に出る場合は、必要な幅まで span を広げて再センタリングします

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
  - `Escape`、右上の閉じるボタン、またはヘッダー / メニュー / 設定 / マニュアル / 詳細パネル / ズーム操作 UI / 案内カード / イベント本体以外のクリックで実行
- 右上のズーム操作 UI
  - 横操作ボタンで水平ズームアウト / 全体表示 / 水平ズームイン
  - 縦操作ボタンでレーン密度の調整 / 初期値復帰
  - 詳細パネルを開いたままでも操作可能
- キーボード
  - `onMounted` で `keydown` リスナーを登録
  - `ArrowLeft / ArrowRight` で水平移動
  - `+ / -` で水平拡大縮小
  - `Escape` でパネルを閉じる
- ホイール
  - 通常ホイールで水平拡大縮小
  - `Ctrl + ホイール` で縦倍率を調整
  - 横方向ホイールで水平移動
- マウス
  - ドラッグでタイムライン領域を上下左右に移動
- タッチ
  - 1 本指ドラッグでタイムライン領域を上下左右に移動
- 2 本指ピンチで横方向と縦方向を同時に拡大縮小
- 横方向はピンチアウトで拡大、ピンチインで縮小
- 縦方向はピンチインでレーン密度が上がり、ピンチアウトで下がる

## URL からの復元

初回マウント時に `window.location.search` を読み、`?event=<id>` があれば `allEvents` から該当 canonical ID のイベントを検索して `selectedEvent` を復元します。

## 既知の制約（現状）

- 各月31日換算の抽象時系列であり、実カレンダー計算はしていません
- `singleWithinRange` は候補期間だけを持ち、具体的な発生日は未確定です
- 共通イベントは表示上レーンごとに複製されます
