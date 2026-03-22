# データ構造

データは `src/data/worldline_commu/` 配下の JS モジュールとして定義されています。

- 集約: `src/data/index.js`
  - `idolCommu`（アイドルコミュ）
  - `hatsuboshiCommus`（初星コミュ）
  - `eventCommus`（イベントコミュ）
  - `supportCardCommus`（サポートカードコミュ）
- 個別キャラ: `src/data/worldline_commu/**/` 配下の各モジュール
- 時間ユーティリティ: `src/utils/time.js`
- 世界線一覧: `src/data/worldlines.js`
- キャラクター一覧: `src/data/characterCatalog.js`

## Character オブジェクト

各キャラファイルは以下の形のオブジェクトを `export default` します。

- `id: string`
- `name: string`
- `color: string`（CSS 色。イベントバーに使用）
- レーンラベルの文字色にも使用し、背景色は表示側で自動補正されます
- `events: Event[]`

## Event オブジェクト

- `id: string`（URL 同期に使うため、全イベントで一意であることが望ましい）
- `start: DateLike`
- `end: DateLike`
- `title: string`
- `detail: string`
- `occurrenceType?: "continuous" | "singleWithinRange"`
  - 省略時は `continuous` 扱い
  - `continuous` は `start` から `end` まで継続している期間を示します
  - `singleWithinRange` は `start` から `end` までの範囲内のどこか1日を示します
- `worldlineId?: string[]`
- `participants?: string[]`
- `source?: string[]`
- `note?: string[]`

## DateLike

- `year: number`
- `month: number`（1〜12）
- `day?: number`

`day` がない場合でも、表示系では抽象時系列として扱います。

- 開始側に `day` がない場合: その月の 1 日目として表示開始
- 終了側に `day` がない場合: その月の 31 日目として表示終了
- 実カレンダーではなく、各月31日換算の抽象時系列です

## 年の表現（`src/utils/time.js`）

`year` は「学園の 1 年目」を基準にした相対表現として扱っています。

- `yearOf(year)`
  - 指定した年をそのまま返す
  - 例: `yearOf(1)` は「1年目」
- `yearsAgo(n)`
  - 「n 年前」を `year` の値に変換する
  - 実装は `1 - n` なので、例えば `yearsAgo(16) = -15`
  - UI のラベルは `yearLabel(year)` が `year < 1` を `n年前` に変換します

## timeValue / dayTimeValue ユーティリティ

`src/utils/time.js` では月単位 (`timeValue(year, month)`) と日単位 (`dayTimeValue(year, month, day)`) を併用します。

- `timeValue(year, month) = year * 12 + (month - 1)`
- `dayTimeValue(year, month, day) = timeValue(year, month) * 31 + (day - 1)`
- 日付表示・連続 viewport・イベント幅計算は日単位の内部表現を使います
- 1か月は固定で31日換算です

## 表示時に付与される派生プロパティ

描画前に、各イベントには以下の値が付与されます。

- `canonicalId`
  - URL 同期に使う ID
- `instanceId`
  - 描画上の一意 ID
  - 共通イベントはレーンごとに複製されるため、`canonicalId` と分離されます
- `startTime` / `endTime`
  - 月単位の内部時刻
- `startTimeDay` / `endTimeDay`
  - 生データ上の開始日・終了日
- `displayStartDay` / `displayEndDay`
  - 画面描画に使う表示用レンジ
  - `day` 未指定時は月初 / 月末相当へ補完されます

## データ追加の手順（現状）

1. `src/data/worldline_commu/` 配下の適切な世界線ディレクトリにキャラファイルを追加
2. `src/data/index.js` で import して配列へ追加
3. `events` の `id` は他キャラと衝突しない命名にする
4. `occurrenceType` を `continuous` / `singleWithinRange` のどちらかで明示する
