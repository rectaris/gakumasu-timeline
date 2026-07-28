# 処理フロー詳細

このドキュメントは、現状の実装が「データ → 表示用構造 → 描画 → インタラクション」をどの順で処理しているかを説明します。

## 起動

- `index.html` に `#app` があり、`src/main.js` が読み込まれる
- `src/main.js` で`ApplicationRoot.vue`をマウントする
- `ApplicationRoot.vue`はURLの`mode`から1ページだけを遅延読込し、モード別の最終URL、ブラウザ履歴、共通配色を管理する
- 「物語時系列」の実装本体は`src/pages/NarrativeTimelinePage.vue`が所有する

## データの取り込み

- `src/pages/NarrativeTimelinePage.vue` が `src/data/index.js` から `idolCommu` / `hatsuboshiCommus` / `eventCommus` / `supportCardCommus` / `commonTimeline` を import
- アイドルコミュは `data/raw/worldline_commu/idol_commu/` から `src/data/generated/worldline_commu/idol_commu/` へ生成され、`import.meta.glob` により番号付きファイル名順で自動集約される
- 初星コミュは `data/raw/worldline_commu/hatsuboshi_commu/` から `src/data/generated/worldline_commu/hatsuboshi_commu/` へ生成され、`import.meta.glob` により番号付きファイル名順で自動集約される
- イベントコミュとサポートカードコミュは `data/raw/worldline_commu/event_commu/` と `data/raw/worldline_commu/support_story/` から対応する generated ディレクトリへ生成され、番号付きファイル名順で自動集約される
- 共通イベントは `data/raw/worldline_commu/common_timeline.json` から `src/data/generated/worldline_commu/common_timeline.js` へ生成され、`src/data/index.js` は生成済みモジュールを import する
- 物語イベントの未レビューパイロットは `data/raw/story_events/pilot.json` から `src/data/generated/story_events/pilot.js` へ生成される
- 物語時系列の `storyReferences` は raw 側を正本とし、StoryBlockから参照元を引く逆引き索引を `src/data/generated/story_events/referenceIndex.js` へ生成する
- 生成済みデータは `npm run generate:data` で更新し、`npm run validate:data` で raw との鮮度一致を確認する
- ローカル開発時の `/timeline/?editor=worldline` は dev server 専用 API から raw JSON を読み込み、保存時に raw JSON と generated データを更新する
- 編集画面では保存先をコミュ種別とファイルで選び、ファイル付きカテゴリでは新規 raw JSON ファイルを作成してから generated データへ反映できる
- カテゴリ別のレーン情報は正規化され、選択されたレーンのみ表示対象になる

## データ検証

- `npm run validate:data` が生成済みデータの鮮度を確認し、耐久データを検証する
- 移行済みデータでは `data/raw/` を source of truth とし、検証エラーは raw 側の source file を指す
- `npm run validate:data -- <path>` は指定ファイルまたは指定ディレクトリを主対象にした focused validation を実行する
- focused validation でも、イベント ID の重複と参加者/世界線参照は全データ文脈を使って確認する
- 検証は表示用正規化の前に、イベント ID、日付範囲、`occurrenceType`、参加者参照、世界線参照、空文字値、不確実性メタデータを確認する
- `storyReferences`は参照IDの一意性、型、表示順、StoryBlockの参照整合性を全データ文脈で確認する
- 失敗時は元ファイル、カテゴリ、レーン、イベント ID / title、フィールド、理由を表示する
- `npm run verify` はデータ検証、ユニットテスト、ビルドを実行する

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
- `dateConfidence`、`sourceBasis`、`sourceStatus`、`rangeReason`、`sourceDetails`、`conflicts` はイベント上に保持され、詳細パネルや検索で `src/utils/events.js` の派生ヘルパーから日本語ラベルへ変換されます
- `sourceDetails[].id` と `sourceDetails[].supports` は出典追跡、詳細表示、検索テキストに使われます
- レビュー済みの`storyReferences`がある場合は、物語イベントの該当StoryBlockを開くリンクとして詳細パネルへ表示します
- メタデータ未指定の `singleWithinRange` は `rangeOnly` として派生し、未確定の単日候補であることを保ちます
- source model 強化では `canonicalId` を変更しません。共有 URL と初回復元は既存 ID を使い続けます

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

縦方向は `verticalScale` で最小レーン高さと全体の縦方向表示量を調整します。

イベントバー高さ、レーン上端から最上イベントまでの余白、重なりイベントを上下に分けるサブレーン間隔は固定です。

操作上の下限は 25% です。

ただし実際のレーン高さは、イベントバー1本と固定の上下余白だけで表示できる高さを下回りません。

低密度では、2 段以上に分かれる近接イベントも件数マーカーへ置換し、レーン高さは置換後の表示量で計算します。

## 描画

描画は 1 枚の `<svg>` で行います。

- `xPos(time)`
  - `viewRange.min/max` に対する比率で x 座標を計算
  - 描画幅は `timelineViewport` の幅に合わせる
- イベントの縦位置はサブレーン計算で決定
  - `yPos(laneIndex, subLaneIndex)` が `laneTop + fixedPadding + subLaneIndex * fixedSubLaneSpacing` をもとに返す
  - レーン密度を変えても、レーン上端から最上イベントまでの距離と、隣接サブレーン上のイベント同士の中心間隔は変わらない

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
   - 近接イベントは表示範囲とレーン密度から算出した個別表示容量を超える場合だけ、件数マーカーへ置換
   - 期間バー: `rect (x=start, width=end-start)`
   - 開始点・終了点: `circle`
   - `occurrenceType === "singleWithinRange"` の場合、バーに破線＋両端の不確定マーカーを追加
   - 推定や出典矛盾はタイムライン本体の幾何ではなく、検索と詳細パネルで明示する

## インタラクション

- イベントクリック
  - `selectEvent(event)` → `selectedEvent` を更新
  - `updateUrl(event.canonicalId)` で URL クエリ `event` を同期
- パネルを閉じる
  - `selectedEvent = null`
  - URL クエリから `event` を削除
  - `Escape`、右上の閉じるボタン、またはヘッダー / メニュー / 設定 / マニュアル / 詳細パネル / ズーム操作 UI / 案内カード / イベント本体以外のクリックで実行
- 画面下部のズーム操作 UI
  - 表示期間ボタンで水平ズームアウト / 全体表示 / 水平ズームイン
  - レーン密度ボタンでレーン密度の調整 / 初期値復帰
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

物語イベントは`?mode=story-graph`で開き、`node=<StoryBlock ID>`または`edge=<StoryEdge ID>`を選択として復元します。
生成済み逆引き索引に参照元があるStoryBlockでは、`?event=<event ID>`で物語時系列へ戻るリンクを表示します。

## 既知の制約（現状）

- 各月31日換算の抽象時系列であり、実カレンダー計算はしていません
- `singleWithinRange` は候補期間だけを持ち、具体的な発生日は未確定です
- `dateConfidence` や `sourceStatus` が未指定でも、`singleWithinRange` は `rangeOnly` として扱われます
- 共通イベントは表示上レーンごとに複製されます
