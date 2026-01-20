# データ構造

データは `src/data/characters/` 配下の JS モジュールとして定義されています。

- 集約: `src/data/index.js`
- 個別キャラ: `src/data/characters/*.js`
- 時間ユーティリティ: `src/data/utils/time.js`

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

### DateLike

- `year: number`
- `month: number`（1〜12）
- `day?: number`（任意、現状 UI では未使用）

## 年の表現（`src/data/utils/time.js`）

`year` は「学園の 1 年目」を基準にした相対表現として扱っています。

- `yearOf(year)`
  - 指定した年をそのまま返す
  - 例: `yearOf(1)` は「1年目」
- `yearsAgo(n)`
  - 「n 年前」を `year` の値に変換する
  - 実装は `1 - n` なので、例えば `yearsAgo(16) = -15`
  - UI のラベルは `yearLabel(year)` が `year < 1` を `n年前` に変換します

## timeValue ユーティリティ（注意点）

`src/data/utils/time.js` には日付込みの内部表現 `timeValue({year,month,day})` が定義されています。

```js
export function timeValue({ year, month, day = 1 }) {
  return year * 12 * 31 + (month - 1) * 31 + (day - 1);
}
```

ただし現状の UI（`src/App.vue`）は、別のローカル関数 `timeValue(year, month)` を持っており、内部表現は月単位です。

- データ側: 日付まで表現できる
- UI 側: 月までしか反映されない

この差分は「既存データを日付付きで書けるようにする」途中の状態の可能性があります。

## データ追加の手順（現状）

1. `src/data/characters/` にキャラファイルを追加
2. `src/data/index.js` で import して `characters` 配列に追加
3. `events` の `id` は他キャラと衝突しない命名にする（`<char>_<event>` など）
