# 処理フロー詳細

このドキュメントは、現状の実装（主に `src/App.vue`）が「データ → 表示用構造 → 描画 → インタラクション」をどの順で処理しているかを、コードの意図に沿って説明します。

## 起動

- `index.html` に `#app` があり、`src/main.js` が読み込まれる
- `src/main.js` で `createApp(App).mount('#app')`

## データの取り込み

- `src/App.vue` が `src/data/index.js` から `characters` / `hatsuboshiCommus` / `eventCommus` / `supportCardCommus` を import
- カテゴリ別のレーン情報は正規化され、選択されたレーンのみ表示対象になる

## カテゴリ/レーンの選択

- 左メニューでカテゴリとレーンを選択
- 選択結果は `activeLanes` としてタイムライン描画に反映
- 初期状態は全レーン未選択
- 「一括」チェックでカテゴリ内の全レーンを選択/解除

## 表示用イベントへの変換

`allEvents`（computed）で、選択済みレーンのイベント配列へフラット化します。

- 入力: `activeLanes[n].events[m]`
- 出力: `[{...event, character, color, laneIndex, startTime, endTime}, ...]`

### 時間の内部表現（現状）

`src/utils/time.js` の `timeValue(year, month)` を使用します。

- `timeValue(year, month) = year * 12 + (month - 1)`
- したがって、時間粒度は「月」です

注意:
- 年/全期間は月単位、月/日ズームは日単位で描画されます

月ズーム時は日単位の内部表現 `dayTimeValue(year, month, day)` を使用します。

- `dayTimeValue = timeValue(year, month) * 31 + (day - 1)`
- `day` がない場合は `1` を使用

## 表示範囲（ズーム）

`viewRange`（computed）で表示する最小〜最大の内部時刻を決めます（ズーム状態機械）。

- `mode === 'FULL'`
  - 全イベントの `startTime/endTime` から `min/max` を算出
- `mode === 'YEAR'`
  - `centerYear` を中心に `± zoomRangeYears` 年（現在は 1 年）
  - 内部時刻は「月」なので年→月に変換して `center = centerYear * 12`
- `mode === 'MONTH'`
  - `centerMonth` を中心に `± zoomRangeMonths` 月（現在は 1 ヶ月）
  - `centerMonth` は `timeValue(year, month)` の内部時刻で扱う
  - 月ズーム時の `viewRange` は日単位（31日/月）で算出
- `mode === 'DAY'`
  - `centerDay` を中心に `± zoomRangeDays` 日（現在は 1 日）

関連: `yearBounds` / `monthBounds` はスライダーの `min/max` を、全イベントの範囲から算出します。

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
  - 月ズーム時は日付（1〜31）を薄く補助表示
  - 月ズーム時の月名ラベルは 1 日目位置の上部に表示
2. キャラレーン
   - キャラ名テキスト
   - レーン線
3. イベント
  - `visibleEvents`（表示範囲に重なるイベント）だけを描画
   - 期間バー: `rect (x=start, width=end-start)`
  - 開始点・終了点: `circle`
  - `occurrenceType === "singleWithinRange"` の場合、バーに破線＋中央マーカーを追加

## インタラクション

- イベントクリック
  - `selectEvent(event)` → `selectedEvent` を更新
  - `updateUrl(event.id)` で URL クエリ `event` を同期
- パネルを閉じる
  - `selectedEvent = null`
  - URL クエリから `event` を削除
- キーボード
  - `onMounted` で `keydown` リスナーを登録
  - `Escape` でパネルを閉じる

## URL からの復元

初回マウント時に `window.location.search` を読み、`?event=<id>` があれば `allEvents` から該当イベントを検索して `selectedEvent` を復元します。

## 既知の制約（現状）

- 年/全期間は月単位、月ズームは日単位で描画されます
- `start` と `end` が同一（月単位で同値）だとバー幅が 0 になり視認性が落ちます（開始点の円は表示されます）
- 「期間内のどこか1日」イベントは `occurrenceType` の有無で判別します（具体的な日付は未確定）
