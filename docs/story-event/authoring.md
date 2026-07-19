# 物語イベントのデータ作成

- 状態：Draft
- 仕様バージョン：0.1

## Source of Truth

StorySeries、StoryBlock、StoryEdge、EvidenceLinkは、JSONの編集用原データとして管理します。

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

## EvidenceLinkの作成

現行 `source` 文字列からStoryBlock候補を抽出し、レビュー済み対応表で不変IDへ対応付けます。

実行時に`source`文字列を解析してStoryBlockを推定しません。

「物語時系列」と「学マス情報史」の参照元データへ、StoryBlock IDと参照種別を登録します。

## レビュー

構造エッジ、意味付きエッジ、解釈を伴う関係、公開ID変更の承認境界を定義します。

## 検証

ID書式、参照整合性、重複、StorySeries階層、生成表示タイトル、シリーズ内表示順、人物の役割、外部識別子、方向、relationType、`sequence`部分グラフの非循環性、URL復元を検証します。

## 未決定事項

- 初期relationTypeと参照種別の一覧。
- ID発行スクリプトとグラフ専用編集画面の実装範囲。
