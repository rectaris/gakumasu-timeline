# 物語イベントのデータ作成

- 状態：Approved
- 仕様バージョン：1.0

## Source of Truth

StorySeries、StoryBlock、StoryEdge、StoryReferenceは、JSONの編集用原データとして管理します。

StorySeriesとStoryBlockは、最上位または独立して編集するStorySeriesごとに1ファイルへ保存します。

アプリケーションが読み込む一覧、逆引き参照、検索用索引は原データから生成します。

## 公開ライフサイクル

データ状態は次の4段階で管理します。

- `draft`：入力中であり、構造検証が完了していない場合があります。
- `unreviewed`：構造検証を通過していますが、内容と出典のレビューは未完了です。
- `approved`：内容と出典のレビューを完了し、公開対象にできます。
- `published`：公開判断を完了し、本番成果物へ収録します。

`draft`から`unreviewed`へ進める前に、ID、階層、参照、必須フィールドを検証します。

`unreviewed`から`approved`へ進める前に、コミュの存在、表示名、階層、人物、前後関係を出典と照合します。

`approved`から`published`への移行は、内容の修正ではなく公開対象への昇格として扱います。

未レビューの原データは`data/raw/story_events/unreviewed/`へ保存します。

本番表示の正本は`data/raw/story_events/published.json`です。

ローカル開発とテストは未レビューデータを使用でき、本番ビルドは`published`だけを読み込みます。

## StoryBlockの作成

カテゴリ選択、不変IDの発行、ゲーム内IDや別名、StorySeries階層、StoryBlockの話ラベル、表示順、話数、役割付き人物参照の入力手順を定義します。

StoryBlockに独立したタイトルを入力しません。

表示タイトルはStorySeries階層とStoryBlockの話ラベルから生成して確認します。

物語上の位置が不明なStoryBlockも登録し、前後関係を付けない状態を許容します。

内容が同一であることだけを理由に、ゲーム内で別のコミュを1つのStoryBlockへ統合しません。

## StoryEdgeの作成

`sequence`または`semantic`の種別、接続先、方向、relationType、ラベル、根拠、確度を登録する基準を定義します。

解釈を伴う`semantic`エッジには、根拠または説明と確度を入力します。

## StoryReferenceの作成

現行 `source` 文字列からStoryBlock候補を抽出し、レビュー済み対応表で不変IDへ対応付けます。

実行時に`source`文字列を解析してStoryBlockを推定しません。

「物語時系列」と「学マス情報史」の参照元データへ、StoryBlock IDと参照種別を登録します。

参照から物語イベントを開くURLは`?mode=story-graph&node=<StoryBlock ID>`とします。
参照は参照元側の`storyReferences`へ保存し、StoryBlock側の逆引きは
`src/data/generated/story_events/referenceIndex.js`へ生成します。

参照元のタイトルや既存`source`文字列が似ていることだけで、自動的に対応を確定しません。
実データへ追加する前に、参照元、参照先、参照種別をレビューします。
参照が存在する場合だけ、両ビューの詳細に移動リンクを表示します。

## レビュー

構造エッジ、意味付きエッジ、解釈を伴う関係、公開ID変更の承認境界を定義します。

最初の実データ登録では、1つのイベントコミュを開始話から最終話まで扱います。

初期エッジは`sequence/before`を中心にし、`semantic`のrelationTypeはレビュー済みの実例が複数必要になった場合に追加します。

## 検証

ID書式、参照整合性、重複、StorySeries階層、生成表示タイトル、シリーズ内表示順、人物の役割、外部識別子、方向、relationType、`sequence`部分グラフの非循環性、URL復元を検証します。

## MVPの作成境界

- IDは`npm run story:id -- <series|block|edge|ref>`で発行します。
- MVPではグラフ専用編集画面を作りません。
- 原データの未知フィールドは入力誤りを検出するため拒否します。
- `schemaVersion`のメジャー値を変更する場合は生成処理と保存データを同時に移行します。
- 既存`source`文字列の全件移行はMVPに含めません。
- 現在のパイロットデータへ実際のStoryReferenceを追加する作業は、出典対応のレビュー後に行います。
