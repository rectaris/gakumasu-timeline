# データ構造

データは段階的に raw/generated 分離へ移行しています。

- 移行済みデータの source of truth: `data/raw/`
- 移行済みデータのアプリ用生成物: `src/data/generated/`
- 未移行カテゴリと雛形: `src/data/worldline_commu/`

`src/data/generated/` は `npm run generate:data` で生成されるため、手編集しません。`npm run validate:data` は生成物が raw から再生成した内容と一致するか確認します。

- 集約: `src/data/index.js`
  - `idolCommu`（アイドルコミュ）
  - `hatsuboshiCommus`（初星コミュ）
  - `eventCommus`（イベントコミュ）
  - `supportCardCommus`（サポートカードコミュ）
- 個別キャラ: 移行済みカテゴリは `data/raw/worldline_commu/**/` 配下の各モジュール
- 時間ユーティリティ: `src/utils/time.js`
  - `src/data/utils/time.js` は既存データ import 向けの互換 shim
- 型定義: `src/types/timeline.d.ts`
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
  - 表示正規化では省略時に `continuous` 扱いできます
  - 耐久データでは必ず明示します
  - `continuous` は `start` から `end` まで継続している期間を示します
  - `singleWithinRange` は `start` から `end` までの範囲内のどこか1日を示します
- `dateConfidence?: "confirmed" | "inferred" | "rangeOnly"`
  - 日付・時期の確度を示します
  - 未指定の `continuous` は `confirmed`、未指定の `singleWithinRange` は `rangeOnly` として表示できます
  - `rangeOnly` は `occurrenceType: "singleWithinRange"` のときだけ使います
- `sourceBasis?: "explicit" | "inferred" | "mixed" | "unknown"`
  - 時期判断の根拠が出典明記か、推論か、混在か、未分類かを示します
- `sourceStatus?: "confirmed" | "inferred" | "conflicting" | "unreviewed" | "unsourced" | "unknown"`
  - 出典状態を示します
  - `conflicts` がある場合、明示するなら `conflicting` にします
  - `unreviewed` は未確認、`unsourced` は出典なし、`unknown` は分類不能を示します
- `rangeReason?: "monthOnly" | "sourceRange" | "chapterOrder" | "relativeOrder" | "unknown"`
  - `singleWithinRange` の候補範囲理由を示します
- `worldlineId?: string[]`
- `participants?: string[]`
- `source?: string[]`
  - 既存互換の出典ラベル配列です
- `sourceDetails?: { id?: string; label: string; url?: string; status?: SourceStatus; claim?: string; supports?: SourceClaimTarget[] }[]`
  - 出典ごとの状態や主張が必要な場合だけ使います
  - `id` は任意の安定 ID です
  - `supports` は `event` / `date` / `detail` / `worldline` / `participants` のどれを支える出典かを示します
- `conflicts?: { summary: string; sources?: string[]; resolution?: string }[]`
  - 出典同士の時期主張が矛盾する場合だけ使います
- `note?: string[]`

詳細パネルでは、`participants` は `src/data/characterCatalog.js`、`worldlineId` は `src/data/worldlines.js` を使って表示名へ解決します。未解決 ID は ID のまま表示し、`source` または `worldlineId` が空の場合は未設定として表示します。

## 証拠品質の派生カテゴリ

UI の監査フィルタとレーン品質サマリーは、イベント本体に新しい分類フィールドを追加せず、既存メタデータから派生します。

- `conflict`: `sourceStatus` の派生結果が `conflicting` のイベント
- `missingSource`: `sourceStatus` の派生結果が `unsourced` のイベント
- `unreviewedSource`: `sourceStatus` の派生結果が `unreviewed` のイベント
- `unknownSource`: `sourceStatus` の派生結果が `unknown` のイベント
- `inferred`: `dateConfidence`、`sourceBasis`、`sourceStatus` の派生結果のいずれかが `inferred` のイベント
- `rangeOnly`: `dateConfidence` の派生結果が `rangeOnly` のイベント

1つのイベントは複数の監査カテゴリに同時に入ります。出典なし、未確認、分類不能、出典矛盾は別の状態として扱い、まとめて汎用警告にはしません。

同じ出典の探索は `sourceDetails[].id`、`sourceDetails[].url`、`sourceDetails[].label`、`source[]` の順で安定キーを作ります。曖昧一致や部分一致では同じ出典とみなしません。

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

## データ追加・編集チェックリスト

1. 追加先を決める
   - 移行済みカテゴリ: `data/raw/worldline_commu/` 配下を編集し、`npm run generate:data` を実行します
   - 未移行カテゴリ: `src/data/worldline_commu/` 配下を編集します
   - アイドルコミュ: `data/raw/worldline_commu/idol_commu/`
   - 初星コミュ: `data/raw/worldline_commu/hatsuboshi_commu/`
   - イベントコミュ: `src/data/worldline_commu/event_commu/`
   - サポートカードコミュ: `src/data/worldline_commu/support_story/`
   - 共通イベント: `data/raw/worldline_commu/common_timeline.js`
2. 読み込み方法を確認する
   - アイドルコミュは raw から生成された `src/data/generated/worldline_commu/idol_commu/*.js` をファイル名順に自動集約します
   - 初星コミュは raw から生成された `src/data/generated/worldline_commu/hatsuboshi_commu/*.js` を `src/data/index.js` が読みます
   - 共通イベントは raw から生成された `src/data/generated/worldline_commu/common_timeline.js` を `src/data/index.js` が読みます
   - イベントコミュ、サポートカードコミュは現状 `src/data/index.js` への登録が必要です
3. `src/data/worldline_commu/template.js` を参考にファイルを作る
   - 移行済みカテゴリのコピー先は `data/raw/worldline_commu/` 配下です
   - 空文字入り配列を残さず、不要な任意フィールドは削除します
4. レーン情報を確認する
   - `id` はレーンの安定 ID として扱います
   - `name` は表示名です
   - `color` はレーンとイベントの識別色に使われます
5. イベントごとに `id` を付ける
   - `id` は `canonicalId` として URL 復元に使われます
   - 公開後の ID 変更は共有 URL を壊すため、原則として行いません
   - 新規 ID はタイトル変更に耐える安定した名前にします
6. 日付を入力する
   - `start` / `end` は `{ year, month, day? }` の形にします
   - 実カレンダーではなく、各月31日換算の抽象時系列です
   - 具体日が不明な場合、架空の確定日を入れず範囲で表現します
7. `occurrenceType` を必ず明示する
   - `continuous`: `start` から `end` まで継続する期間
   - `singleWithinRange`: `start` から `end` までの範囲内のどこか1日
8. 必要に応じて不確実性メタデータを入れる
   - 確定した継続期間は省略できます
   - `singleWithinRange` は未指定でも `rangeOnly` として表示されます
   - 推論なら `dateConfidence: "inferred"` と `sourceBasis: "inferred"` または `"mixed"` を検討します
   - 出典矛盾がある場合は `sourceStatus: "conflicting"` と `conflicts` を入れます
   - 不明な単日タイミングを架空の具体日にしないでください
9. `participants` を確認する
   - `src/data/characterCatalog.js` に存在する ID だけを入れます
   - 未登録人物、集団名、仮 ID は入れず、必要なら `note` に自然文で残します
10. `worldlineId` を確認する
   - 既知の場合のみ `src/data/worldlines.js` の ID を入れます
   - 未確定の世界線を表すための仮 ID は作りません
11. `source` を入れる
    - 新規データでは原則として出典を入れます
    - 例: コミュ名、章、話数、公式資料 URL、ページ番号など
    - 現行検証では未設定を hard fail にしませんが、出典なしの断定は避けます
    - `source` は互換用の簡易出典欄として残します。構造化が必要な場合は `sourceDetails` を併用します
12. `sourceDetails` / `conflicts` を必要な場合だけ入れる
    - 複数出典の主張を分けたい場合は `sourceDetails[].claim` を使います
    - 出典を再利用・追跡したい場合は `sourceDetails[].id` を入れます
    - 出典が支える対象を明示したい場合は `sourceDetails[].supports` を入れます
    - 出典同士の時期主張が矛盾する場合は `conflicts[].summary` に未解決内容を残します
13. `note` に補足を残す
    - 日付幅の根拠、推測理由、未登録人物、矛盾候補などを自然文で書きます
    - `note` は機械判定用フィールドではありません
14. 移行済みデータでは生成する
    - `npm run generate:data`
    - 生成された `src/data/generated/` は raw と同じ変更単位でコミットします
15. focused validation を実行する
    - 単一ファイル: `npm run validate:data -- data/raw/worldline_commu/idol_commu/001hanamiSaki.js`
    - ディレクトリ: `npm run validate:data -- data/raw/worldline_commu/idol_commu`
16. 全体検証を実行する
    - `npm run validate:data`
    - 実装変更を含む場合は `npm run test` と `npm run build` も実行します
17. ローカル表示を確認する
    - 編集中は `npm run dev`
    - build 後の確認が必要な場合は `npm run build` の後に `npm run preview`

## データ検証

`npm run validate:data` は生成済みデータの鮮度を確認したうえで、耐久データを検証します。`template.js` は雛形なので対象外です。

移行済みデータでは `data/raw/` を source of truth とし、`src/data/generated/` をアプリが読む生成物として扱います。生成物が古い場合は `npm run validate:data` が失敗するため、`npm run generate:data` を実行して差分を確認してください。

単一ファイルやディレクトリだけを確認したい場合は、パスを渡します。

```bash
npm run validate:data -- data/raw/worldline_commu/hatsuboshi_commu/001storyOfReiris.js
npm run validate:data -- data/raw/worldline_commu/idol_commu
```

focused validation は指定ファイルを主対象にしますが、イベント ID の重複と参照 ID は全データ文脈で確認します。

検証対象:

- イベント ID が重複していないこと
- `start` / `end` が `{ year, month, day? }` の形で、月が 1〜12、日が 1〜31 の範囲にあること
- `start` が `end` より後になっていないこと
- `occurrenceType` が明示され、`continuous` / `singleWithinRange` のどちらかであること
- `participants` が `src/data/characterCatalog.js` の ID を参照していること
- `worldlineId` が `src/data/worldlines.js` の ID を参照していること
- `source` / `note` / `participants` / `worldlineId` の配列に空文字や空白だけの値がないこと
- `dateConfidence` / `sourceBasis` / `sourceStatus` / `rangeReason` が許可値であること
- `dateConfidence: "rangeOnly"` と `rangeReason` は `occurrenceType: "singleWithinRange"` のときだけ使うこと
- `sourceDetails` は配列で、各要素の `label` が空でないこと
- `sourceDetails[].id` は任意ですが、入れる場合は空でないこと
- `sourceDetails[].id` は同一イベント内で重複しないこと
- `sourceDetails[].supports` は配列で、許可された対象だけを含むこと
- `conflicts` は配列で、各要素の `summary` が空でないこと
- `conflicts` があり `sourceStatus` を明示する場合は `conflicting` であること
- `sourceStatus: "conflicting"` の場合は `conflicts` があること
- `sourceStatus: "unsourced"` は `source` または `sourceDetails` があるイベントには使わないこと
- `sourceStatus: "confirmed"` は `source` または `sourceDetails` があるイベントにだけ使うこと

失敗時は、元ファイル、カテゴリ、レーン、イベント ID / title、フィールド、理由が表示されます。

よくある失敗:

- `participants[0] unknown id`: `characterCatalog` に存在しない ID を入れています。仮 ID は使わず、未登録人物は `note` に残してください。
- `worldlineId[0] unknown id`: `worldlines` に存在しない ID を入れています。未確定ならフィールドを省略し、理由を `note` に書いてください。
- `source[0] must not be empty`: 空文字や空白だけの値を配列に残しています。出典がない場合は空配列や空文字ではなく、フィールド自体を省略してください。
- `occurrenceType must be explicit`: `continuous` または `singleWithinRange` を明示してください。
- `start must be less than or equal to end`: `start` が `end` より後になっています。
- `duplicate event id`: URL 復元に使うイベント ID が他イベントと衝突しています。新規イベント側の ID を安定した別名にしてください。
- `dateConfidence rangeOnly requires occurrenceType "singleWithinRange"`: 範囲内の単日として扱う確度を、継続期間イベントに付けています。
- `sourceDetails[n].label must not be empty`: 構造化出典の表示名が空です。不要なら要素ごと削除してください。
- `duplicate source detail id`: 同じイベント内で構造化出典 ID が重複しています。
- `sourceDetails[n].supports[0] must be one of`: `supports` に許可されていない対象を入れています。
- `sourceStatus must be "conflicting" when conflicts are present`: 出典矛盾を持つイベントに矛盾以外の出典状態を明示しています。
- `sourceStatus must not be "unsourced" when source or sourceDetails are present`: 出典があるイベントに出典なし状態を付けています。

## 承認境界

通常の新規追加、誤字修正、出典追記、検証エラー修正はデータ author が進められます。

以下は実装前に確認が必要です。

- 既存イベントの意味、時系列解釈、出典主張を変える
- 公開済みイベント ID を変更する
- キャラクター名、世界線 ID、世界線の意味を変える
- 未確定の単日イベントを具体日に断定する
- `sourceStatus`、`dateConfidence`、`sourceBasis`、`rangeReason`、`sourceDetails`、`conflicts`、raw/generated などのフィールド契約を変更する

参加者 ID は既存の `participants`、出典状態と不確実性は上記の任意メタデータで扱います。
raw/generated の契約変更は、通常のデータ追加とは別の実装計画で扱います。
