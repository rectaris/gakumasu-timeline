# 物語イベントの決定記録

このディレクトリは、後から変更するとデータ互換性やグラフの意味が変わる承認済み判断を保存します。

## 保存対象

- StoryBlock、StoryEdge、EvidenceLinkの責務。
- ID体系と公開URLの互換方針。
- エッジ方向とrelationTypeの意味。
- StoryBlockの前後関係と相対的な配置規則。
- 自動生成エッジと手動登録エッジの境界。
- グラフ全体の操作モデル。

## 決定一覧

- [001 初期対象、ノード単位、物語上の流れ](001-initial-scope-node-and-flow.md)
- [002 StoryBlockの同一性と分類](002-story-block-identity-and-classification.md)
- [003 前後関係、意味的エッジ、ビュー間参照](003-sequence-semantic-edge-and-reference-boundaries.md)
- [004 ID、シリーズ階層、表示タイトル](004-id-series-hierarchy-and-derived-title.md)
- [005 カテゴリ別フィールドとデータ作成境界](005-category-fields-and-authoring-boundaries.md)
- [006 MVPコア契約](006-mvp-core-contract.md)

## 保存しない内容

- 検討中の選択肢一覧。
- 会話やレビューの全文。
- 個別データだけに関係する判断。
- 実装手順だけに関係する判断。

## ファイル形式

ファイル名は `NNN-short-slug.md` とします。
本文には状態、決定日、対象仕様、決定内容、短い理由、互換性への影響を記載します。
