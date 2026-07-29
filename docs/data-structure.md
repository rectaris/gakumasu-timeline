# データ構造

データは段階的に raw/generated 分離へ移行しています。

- 移行済みデータの source of truth: `data/raw/`
- 移行済みデータのアプリ用生成物: `src/data/generated/`
- 雛形: `data/raw/worldline_commu/template.json`

`data/raw/` は JSON で管理します。
`src/data/generated/` は `npm run generate:data` で生成されるため、手編集しません。
`npm run validate:data` は生成物が raw から再生成した内容と一致するか確認します。

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
raw JSON では `year` に変換後の数値を直接書きます。

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

ローカル開発環境では、`npm run dev` の起動後に `/timeline/?editor=worldline` を開くと worldline データ編集画面を使えます。
編集画面は `data/raw/worldline_commu/` の既存 raw JSON を読み込み、保存前に既存のデータ検証を実行します。
保存先はコミュ種別とファイルで選び、ファイル付きカテゴリでは新規 raw JSON ファイルも作成できます。
現時点の永続 source of truth は raw JSON です。
1イベント1ファイル YAML への移行は、編集画面の運用を確認した後の別作業として扱います。

1. 追加先を決める
   - 移行済みカテゴリ: `data/raw/worldline_commu/` 配下を編集し、`npm run generate:data` を実行します
   - アイドルコミュ: `data/raw/worldline_commu/idol_commu/*.json`
   - 初星コミュ: `data/raw/worldline_commu/hatsuboshi_commu/*.json`
   - イベントコミュ: `data/raw/worldline_commu/event_commu/*.json`
   - サポートカードコミュ: `data/raw/worldline_commu/support_story/*.json`
   - 共通イベント: `data/raw/worldline_commu/common_timeline.json`
2. 読み込み方法を確認する
   - アイドルコミュは raw から生成された `src/data/generated/worldline_commu/idol_commu/*.js` をファイル名順に自動集約します
   - 初星コミュは raw から生成された `src/data/generated/worldline_commu/hatsuboshi_commu/*.js` をファイル名順に自動集約します
   - 共通イベントは raw から生成された `src/data/generated/worldline_commu/common_timeline.js` を `src/data/index.js` が読みます
   - イベントコミュ、サポートカードコミュは raw から生成された `src/data/generated/worldline_commu/*/*.js` をファイル名順に自動集約します
3. `data/raw/worldline_commu/template.json` を参考にファイルを作る
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
   - `yearOf(1)` や `yearsAgo(16)` のような関数呼び出しは使わず、`1` や `-15` のような数値を書きます
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
    - 単一ファイル: `npm run validate:data -- data/raw/worldline_commu/idol_commu/001hanamiSaki.json`
    - ディレクトリ: `npm run validate:data -- data/raw/worldline_commu/idol_commu`
16. 全体検証を実行する
    - `npm run validate:data`
    - 実装変更を含む場合は `npm run test` と `npm run build` も実行します
17. ローカル表示を確認する
    - 編集中は `npm run dev`
    - worldline データ編集画面は `/timeline/?editor=worldline`
    - build 後の確認が必要な場合は `npm run build` の後に `npm run preview`

## データ検証

`npm run validate:data` は生成済みデータの鮮度を確認したうえで、耐久データを検証します。
`template.json` は雛形なので対象外です。

移行済みデータでは `data/raw/` を source of truth とし、`src/data/generated/` をアプリが読む生成物として扱います。生成物が古い場合は `npm run validate:data` が失敗するため、`npm run generate:data` を実行して差分を確認してください。

単一ファイルやディレクトリだけを確認したい場合は、パスを渡します。

```bash
npm run validate:data -- data/raw/worldline_commu/hatsuboshi_commu/001storyOfReiris.json
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

## 物語イベントの公開ライフサイクル

未レビューパイロットは`data/raw/story_events/unreviewed/pilot.json`です。
本番表示の正本は`data/raw/story_events/published.json`です。
`npm run generate:data`は、対応する生成物を`src/data/generated/story_events/`へ出力します。

ルートは`schemaVersion`、`dataset`、`series`、`blocks`、`edges`を持ちます。
`dataset.status`には`draft`、`unreviewed`、`approved`、`published`のいずれかを指定します。
ローカル開発とテストは`unreviewed`を使用でき、本番ビルドは`published`だけを使用します。
`npm run verify`は、本番成果物に未レビューパイロットのIDが含まれないことも確認します。

StorySeriesは`series_<小文字UUID>`形式のID、カテゴリ、階層種別、ラベル、任意の親IDを持ちます。
StoryBlockは`block_<小文字UUID>`形式のID、末端のStorySeries ID、話ラベル、役割付き人物を持ちます。
表示タイトルはStorySeriesのラベルを親から順に並べ、最後に話ラベルを追加して生成します。

StoryEdgeは`edge_<小文字UUID>`形式のID、接続元と接続先のStoryBlock ID、`kind`、`direction`、`relationType`、`origin`を持ちます。
手動登録するエッジには、理由または根拠と確度が必要です。
`sequence`は`forward`かつ`before`だけを許可し、`semantic`は物語上の配置順へ影響しません。

IDは表示名から作らず、次のコマンドで発行します。

```bash
npm run story:id -- series
npm run story:id -- block
npm run story:id -- edge
npm run story:id -- ref
```

`npm run validate:data`は、物語イベントについて次の条件も検証します。

- IDの形式と重複。
- StorySeriesの親参照、許可階層、循環。
- StoryBlockからStorySeriesへの参照とアイドルコミュのowner。
- StoryEdgeの参照先、方向、relationType、根拠、確度。
- 自己エッジと同一論理エッジの重複。
- `sequence`部分グラフの循環。

「物語時系列」のイベントには、レビュー済みの対応だけを`storyReferences`として保存できます。
各参照は`ref_<小文字UUID>`形式のID、参照先`storyBlockId`、`type`を持ちます。
参照先が未登録、IDが重複、または未知フィールドを含む参照は検証エラーです。

StoryBlockから参照元を引くための索引は、`npm run generate:data`で
`src/data/generated/story_events/referenceIndex.js`へ生成します。
逆引き索引は編集せず、参照元の`storyReferences`を修正します。

保存契約、意味論、作成境界の正規仕様は[物語イベント仕様](story-event/README.md)に保存します。

## 学マス情報史

現実世界の公式情報は`data/raw/realworld_events/`を正本とします。

- `source-registry.json`：取得を許可した公式発信元と学マス候補の判定範囲です。
- `intake/`：公式ページ、動画、投稿を正規化したレビュー前の取得候補です。
- `reviews/`：取得元と候補IDの組に対するレビュー判断です。
- `published.json`：公式出典と事実レビューを通過した本番データです。
- `unreviewed/`：候補または表示検証用のデータです。
- `src/data/generated/realworld_events/`：生成物であり、直接編集しません。

取得レスポンス全文は`.agent-artifacts/realworld-ingest/`へローカル保存し、リポジトリへコミットしません。
`intake/`の項目はInfoEventではなく、レビュー後に同じ出来事を示す複数項目を1件へ統合できます。
`npm run review:realworld`は、全取得元の状態と`intake/`の候補を読み取り専用のレビュー在庫へ変換します。
レビュー在庫の`inventory.json`と`summary.md`は`.agent-artifacts/realworld-review/<run ID>/`へ保存し、正本またはコミット対象にしません。
レビュー在庫が示す`resourceKey`、正規化タイトル、InfoEvent出典URLの完全一致は確認の手掛かりであり、統合または公開の決定ではありません。
レビュー判断は`reviews/<sourceRegistryId>.json`へ保存し、取得処理が更新する`intake/`へ混在させません。
未登録の候補は`pending`とみなし、保存する判断は`include`、`exclude`、`defer`です。
判断には`reviewedAt`、公開可能な`reviewedBy`、確認時の`reviewedContentHash`を保存します。
現在の`contentHash`が確認時と異なる判断は削除せず、再確認対象として派生します。
取得候補が存在しなくなった判断も削除せず、孤立判断としてレビュー在庫へ表示します。
`include`はInfoEvent作成対象への採用を示すだけであり、承認または公開を意味しません。
ページ上限までの取得は`partial`としてページング情報を持ち、既存候補とマージして候補の減少を防ぎます。
通信失敗時は発信元ごとの既存ファイルを保持し、後続ソースの取得を続けます。
Xの取得元はレジストリ上で`paused`とし、取得を保留しています。

InfoEventは一回の公開、更新、公演、配信を表し、`info_<小文字UUID>`形式の不変IDを持ちます。
告知日時は`announcedAt`、発生日時は`startsAt`、終了は`endsAt`へ分けます。
日時値は`value`、`precision`、必要な場合の`timezone`を持ち、精度は`month`、`date`、`minute`です。

`npm run collect:realworld`は登録済み公式ソースを取得し、`intake/`を更新します。
`npm run review:realworld`は外部通信を行わず、現在の候補分布と完全一致の手掛かりをローカルへ出力します。
`npm run review:realworld:decide`は候補の存在、理由コード、確認ハッシュ、InfoEvent参照を検証し、明示された1件の判断だけを更新します。
`npm run validate:data`は、取得元と取り込みデータに加え、InfoEventのID、カテゴリ、状態、日時精度、タイムゾーン、開始終了順、公開項目の公式出典を検証します。
`npm run verify`は、本番成果物へ`unreviewed`の学マス情報史データが混入していないことも確認します。

完全な契約は[学マス情報史仕様](realworld-history/README.md)を参照してください。
