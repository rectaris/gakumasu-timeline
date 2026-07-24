# 物語イベントのデータ作成

- 状態：Approved
- 仕様バージョン：1.0

## Source of Truth

StorySeries、StoryBlock、StoryEdge、StoryReferenceは、JSONの編集用原データとして管理します。

StorySeriesとStoryBlockは、最上位または独立して編集するStorySeriesごとに1ファイルへ保存します。

アプリケーションが読み込む一覧、逆引き参照、検索用索引は原データから生成します。

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
参照は参照元側へ保存し、StoryBlock側の逆引きは生成します。

## レビュー

構造エッジ、意味付きエッジ、解釈を伴う関係、公開ID変更の承認境界を定義します。

## 検証

ID書式、参照整合性、重複、StorySeries階層、生成表示タイトル、シリーズ内表示順、人物の役割、外部識別子、方向、relationType、`sequence`部分グラフの非循環性、URL復元を検証します。

## MVPの作成境界

- IDは`npm run story:id -- <series|block|edge|ref>`で発行します。
- MVPではグラフ専用編集画面を作りません。
- 原データの未知フィールドは入力誤りを検出するため拒否します。
- `schemaVersion`のメジャー値を変更する場合は生成処理と保存データを同時に移行します。
- 既存`source`文字列の全件移行はMVPに含めません。
