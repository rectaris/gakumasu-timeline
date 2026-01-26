# データ構造

データは `src/data/worldline_commu/` 配下の JS モジュールとして定義されています。

- 集約: `src/data/index.js`
  - `characters`（アイドルコミュ）
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
- `events: Event[]`

## Event オブジェクト

- `id: string`（URL 同期に使うため、全イベントで一意であることが望ましい）
- `start: DateLike`
- `end: DateLike`
- `title: string`
- `detail: string`
- `occurrenceType?: "continuous" | "singleWithinRange"`
  - 省略時は `continuous` 扱い
  - `singleWithinRange` は「期間内のどこか1日」イベントを示す

### DateLike

- `year: number`
- `month: number`（1〜12）
- `day?: number`（任意、月/日ズーム時に表示へ反映）

## 年の表現（`src/utils/time.js`）

`year` は「学園の 1 年目」を基準にした相対表現として扱っています。

- `yearOf(year)`
  - 指定した年をそのまま返す
  - 例: `yearOf(1)` は「1年目」
- `yearsAgo(n)`
  - 「n 年前」を `year` の値に変換する
  - 実装は `1 - n` なので、例えば `yearsAgo(16) = -15`
  - UI のラベルは `yearLabel(year)` が `year < 1` を `n年前` に変換します

## timeValue ユーティリティ（注意点）

`src/utils/time.js` では月単位 (`timeValue(year, month)`) と日単位 (`dayTimeValue(year, month, day)`) を併用します。

- 年/全期間表示は月単位
- 月/日表示は日単位

## データ追加の手順（現状）

1. `src/data/worldline_commu/` 配下の適切な世界線ディレクトリにキャラファイルを追加
2. `src/data/index.js` で import して `characters` 配列に追加
3. `events` の `id` は他キャラと衝突しない命名にする（`<char>_<event>` など）
