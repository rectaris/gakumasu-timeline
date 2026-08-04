# 学マス情報史のデータ作成

- 状態：Approved
- 仕様バージョン：0.2

## Source of Truth

InfoEventはリポジトリ内のJSONをレビューして公開します。
公式ソースの取得処理は候補を集めるところまでを担当し、InfoEventを自動作成または自動公開しません。

保存境界は次のとおりです。

```text
data/raw/realworld_events/
├── source-registry.json
├── intake/
│   └── <sourceRegistryId>.json
├── reviews/
│   └── <sourceRegistryId>.json
├── unreviewed/
│   └── *.json
└── published.json
```

- `source-registry.json` は、取得を許可した公式発信元と収録範囲を定義します。
- `intake/` は、取得したページ、動画、投稿を正規化した軽量な候補を置きます。
- `reviews/` は、取得元IDと候補IDの組に対するレビュー判断を置きます。
- `unreviewed/` は候補、調査中、レビュー待ちのレコードを置きます。
- `published.json` は仕様と出典のレビューを通過したレコードだけを置きます。
- アプリの本番ビルドは `published.json` から生成したデータだけを参照します。
- StoryBlockから投影する公開情報は、元の公開データから生成し、InfoEventへ複製しません。
- 取得レスポンスの全文は `.agent-artifacts/realworld-ingest/<run ID>/` にのみ保存し、コミットしません。
- 取り込み候補のレビュー在庫は `.agent-artifacts/realworld-review/<run ID>/` にのみ生成し、コミットしません。

データセットのライフサイクルは `draft`、`unreviewed`、`approved`、`published` を使用します。
`approved` はレビュー完了、`published` は本番入力として採用済みであることを表します。

## 公式ソースの取得

取得元の追加や収録範囲の変更は、先に`source-registry.json`をレビューします。

```bash
npm run collect:realworld -- --max-pages 1
npm run validate:data
```

YouTube Data APIを使う取得では`YOUTUBE_API_KEY`を環境変数から読みます。
X APIの保留を将来解除する場合は`X_BEARER_TOKEN`を環境変数から読みます。
値はJSON、ログ、コマンド引数へ保存しません。
認証情報がない取得元は失敗扱いにせず、`skipped`として実行結果へ記録します。
既存候補がある場合はそのファイルを保持し、空の`skipped`データで上書きしません。
一部だけを再取得するときは`--source <sourceRegistryId>`を指定します。

各取り込み項目は、取得元内の`externalId`に加え、プラットフォームをまたいだ重複確認に使う`resourceKey`を持ちます。
アイドルマスター全体の発信元では、題名と本文に学マス判定語を含む項目だけを候補とします。

YouTubeで`--max-pages`の上限に達して次ページが残る場合は、`status: "partial"`として保存します。
部分取得は既存候補とマージされるため、少ないページ数で再実行しても以前の候補を削除しません。
末尾まで取得した`collected`だけが既存候補全体を置き換えます。

発信元ごとの通信失敗は後続ソースを止めません。
失敗した発信元の既存ファイルを保持し、コマンドは全ソースの処理後に失敗終了します。
`--require-all`を指定した場合は、通信失敗に加えて`skipped`がある場合も失敗終了します。

## 取り込み候補の確認

現在の取り込み候補は次のコマンドで一覧化します。

```bash
npm run review:realworld
```

コマンドは外部通信を行わず、`intake/`、`published.json`、`unreviewed/`を読み取ります。
実行ごとに`.agent-artifacts/realworld-review/<run ID>/`へ`inventory.json`、`summary.md`、`manifest.json`、`redaction-report.md`を生成します。
認証情報、環境変数、`.env.local`は読み取りません。

`summary.md`は取得元ごとの候補数、取得状態、ページング状態、公開日時範囲を示します。
候補には同一`resourceKey`、同一正規化タイトル、既存InfoEventの出典URLとの完全一致を手掛かりとして付けます。
タイトル正規化はUnicode NFKC、英字の小文字化、連続空白の統一だけを行います。
似た表記、内容、開催回、公開物の関係は推定しません。

完全一致があっても、同じ出来事であることや公開可能であることは確定しません。
レビュー担当者は確認資料を基に公式出典の内容を確認し、別途定めるレビュー状態と除外理由に従って判断します。

レポートの「パイロット候補」は、公式Webサイト候補、プレイリストの最新10件、最新の同一正規化タイトルグループから重複を除いて選びます。
現在のデータでは15件が対象です。

## レビュー判断の記録

候補レビューは取得処理と分離した`reviews/<sourceRegistryId>.json`へ保存します。
保存されていない候補は`pending`として扱います。
判断値は`include`、`exclude`、`defer`です。

最初に`--dry-run`で候補、理由、参照を検証します。

```bash
npm run review:realworld:decide -- \
  --source SOURCE_REGISTRY_ID \
  --intake INTAKE_ID \
  --decision include \
  --reviewed-by PUBLIC_REVIEWER_ID \
  --dry-run
```

`include`はInfoEvent作成候補として採用する判断であり、公開承認ではありません。
既存InfoEventを支える候補では、`--info-event INFO_EVENT_ID`を複数回指定できます。
候補の日時やタイトルはInfoEventへ自動転記しません。

除外または保留では、判断に対応する理由を指定します。

```bash
npm run review:realworld:decide -- \
  --source SOURCE_REGISTRY_ID \
  --intake INTAKE_ID \
  --decision exclude \
  --reason not_an_event \
  --reviewed-by PUBLIC_REVIEWER_ID \
  --dry-run
```

除外理由は`out_of_scope`、`not_an_event`、`duplicate_candidate`、`superseded_resource`、`unverifiable`、`other`です。
保留理由は`needs_source_review`、`needs_grouping_decision`、`incomplete_source_data`、`other`です。
`other`では`--note`を必須とします。

`--dry-run`を外した場合だけ台帳を更新します。
記録時の`contentHash`は`reviewedContentHash`として自動保存します。
候補内容が後から変化した場合は、以前の判断を残して`needsRecheck`として報告します。
候補が取得データから消えた場合も判断は自動削除せず、孤立判断として報告します。

初回の永続的なレビュー判断は、構造レビューと事実レビューを承認できる担当者を決めてから記録します。
担当者が確定するまでは、`--dry-run`とローカルレポートだけを使用します。

## X取得の保留

学園アイドルマスター公式Xとアイドルマスター公式Xは、`source-registry.json`で`collectionState: "paused"`としています。
保留中はBearer Tokenの有無にかかわらずX APIを呼び出しません。
ログイン済みブラウザ、oEmbed、X APIによる代替取得はこの段階では実装しません。

## 新規項目の追加

1. `intake/`の候補が収録範囲に含まれるか確認します。取得候補を使わず手動登録することもできます。
2. 同じ出来事、同じ開催回、同じ公開物の既存レコードがないか確認します。
3. 複数の投稿、動画、ページが同じ出来事を示す場合は、別イベントにせず1件のInfoEventの出典候補としてまとめます。
4. `info_<UUID>` のIDを発行します。
5. [データモデル](data-model.md)に従い、カテゴリ、タイトル、概要、日時、状態を入力します。
6. 発表と発生を別レコードにせず、`announcedAt` と `startsAt` へ分けます。
7. 複数公演など別の発生単位は別レコードとし、共通の `groupId` を付けます。
8. 各事実を裏付ける公式出典を登録します。
9. 関連キャラクターや物語イベントがある場合だけ参照を追加します。
10. `unreviewed` データで構造検証を行い、レビューを依頼します。

## 出典確認

- タイトル、日時、状態の各主張が、どの公式出典で確認できるかをレビューします。
- 出典のURL、種別、表示名、確認日を保存します。
- 二次情報だけの候補は `unreviewed` のままとします。
- URLが削除または移動された場合は、元URLを消さず、到達状態と代替の公式URLを記録します。
- HTML本文や画像の複製保存はMVPの対象外です。

## 更新と訂正

既存の公開項目について延期、中止、日時変更、名称変更、公式訂正が発生した場合は、現在値だけを上書きしません。

1. 新しい公式出典を追加します。
2. `revisions` に変更前後、変更種別、確認日時、理由、根拠の出典IDを追加します。
3. 現在の日時または状態を更新します。
4. 構造と出典の再レビューを行います。
5. 公開データを再生成します。

誤入力の修正も、公開後に意味が変わる場合は訂正履歴へ残します。

## レビューと公開

レビューは次の二つを分けます。

- 構造レビュー：必須フィールド、ID、日時精度、参照、重複、開始終了順が妥当であること。
- 事実レビュー：公式出典が、登録したタイトル、日時、状態を実際に裏付けること。

両方を満たしたデータセットだけを `approved` とし、その内容を `published.json` へ反映して `published` とします。
構造が妥当でも、出典で正しさを確認できない項目は本番へ公開しません。

収録範囲、カテゴリ、日時精度、出典優先順位、公開IDの互換方針を変える場合は、個別項目の通常レビューではなく仕様変更として承認を得ます。

## 継続保守

- 初期運用の担当は、このリポジトリのデータ保守担当者とします。
- `scheduled` と `active` の項目は、予定日の前後で公式情報を再確認します。
- 公開データ全体の出典到達性と状態を四半期ごとに確認します。
- 更新担当と周期は初期データセットを決める際に明示的に承認します。

## 検証

自動検証では少なくとも次を確認します。

- データセット状態と本番入力の分離。
- InfoEvent IDと出典IDの一意性。
- 必須フィールドとカテゴリ、状態の許可値。
- 日時表現と `precision` の一致。
- `minute` 精度のタイムゾーン。
- 開始と終了の順序および精度。
- 訂正履歴が参照する出典の存在。
- キャラクター、物語イベント、StoryBlock参照の存在。
- 手動InfoEventと投影項目の重複。
- 生成物の再現性。
- 公開IDを使うURLの復元。
- 本番生成物へ `unreviewed` データが混入しないこと。

事実の正しさは自動検証だけでは証明できないため、出典レビューを公開条件に含めます。

## 初期データセット拡充前に必要な作業

1. [承認チェックリスト](review-checklist.md)を確定します。
2. 代表的な実在情報を各カテゴリから選び、公式出典を確認します。
3. そのデータで重複、日時精度、訂正、複数公演、StoryBlock投影の境界を再確認します。
4. 承認された判断をADRへ記録します。
