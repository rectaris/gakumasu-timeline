# 処理フロー詳細

このドキュメントは、現状の実装（主に `src/App.vue`）が「データ → 表示用構造 → 描画 → インタラクション」をどの順で処理しているかを、コードの意図に沿って説明します。

## 起動

- `index.html` に `#app` があり、`src/main.js` が読み込まれる
- `src/main.js` で `createApp(App).mount('#app')`

## データの取り込み

- `src/App.vue` が `src/data/index.js` から `characters` を import
- `characters` は、キャラ定義オブジェクトの配列

## 表示用イベントへの変換

`allEvents`（computed）で、キャラ配列をイベント配列へフラット化します。

- 入力: `characters[n].events[m]`
- 出力: `[{...event, character, color, laneIndex, startTime, endTime}, ...]`

### 時間の内部表現（現状）

`src/App.vue` 内のローカル関数 `timeValue(year, month)` を使用します。

- `timeValue(year, month) = year * 12 + (month - 1)`
- したがって、時間粒度は「月」です

注意:
- イベントデータ側は `day` を持つ場合がありますが、`src/App.vue` の `timeValue` は `day` を見ません
- `src/data/utils/time.js` に日付込みの `timeValue({year,month,day})` があるものの、現状 UI 側では使われていません

## 表示範囲（ズーム）

`viewRange`（computed）で表示する最小〜最大の内部時刻を決めます。

- `zoomMode === 'all'`
  - 全イベントの `startTime/endTime` から `min/max` を算出
- `zoomMode === 'year'`
  - `zoomCenterYear` を中心に `± zoomRangeYears` 年（現在は 1 年）
  - 内部時刻は「月」なので年→月に変換して `center = zoomCenterYear * 12`

関連: `yearBounds` はスライダーの `min/max` を、全イベントの範囲から算出します。

## 描画

描画は 1 枚の `<svg>` で行います。

- `xPos(time)`
  - `viewRange.min/max` に対する比率で x 座標を計算
- `yPos(laneIndex)`
  - `topOffset + laneIndex * laneHeight`

描画内容:

1. 年目盛り（縦グリッド）
   - `years` computed が `viewRange` から年の配列を生成
   - 各年について縦線とラベル（`1年目`, `2年目`, `n年前`）を描画
2. キャラレーン
   - キャラ名テキスト
   - レーン線
3. イベント
   - `visibleEvents`（表示範囲に重なるイベント）だけを描画
   - 期間バー: `rect (x=start, width=end-start)`
   - 開始点: `circle`

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

- 日付（`day`）は UI の時間計算に反映されません（表示は月単位）
- `start` と `end` が同一（月単位で同値）だとバー幅が 0 になり視認性が落ちます（開始点の円は表示されます）
