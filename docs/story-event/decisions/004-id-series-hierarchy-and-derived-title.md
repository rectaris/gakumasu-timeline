# ID、シリーズ階層、表示タイトル

- 状態：Accepted
- 決定日：2026-07-19
- 対象仕様バージョン：0.1

## 背景

StoryBlockとStorySeriesの参照互換性を保つID書式、カテゴリ間で異なる階層の保存方法、ノードに表示するタイトルの生成元を定める必要がありました。

## 決定

- StorySeries、StoryBlock、StoryEdge、ビュー間参照のIDは、名前空間接頭辞と小文字UUIDで構成します。
- 接頭辞は`series_`、`block_`、`edge_`、`ref_`とします。
- IDは専用スクリプトまたは編集画面で発行し、表示ラベルや階層から生成しません。
- StorySeriesは`parentSeriesId`で階層化します。
- StoryBlockは最も具体的なStorySeriesだけを参照します。
- StoryBlockに独立した`title`を保存しません。
- 表示対象のStorySeriesラベルをルートから順に並べ、最後にStoryBlockの`label`を追加して表示タイトルを生成します。
- 技術的なカテゴリ名は表示タイトルへ含めず、各ラベルを1つの空白で連結します。

## 影響

- StorySeriesのラベルを変更すると、配下StoryBlockの表示タイトルも変わりますが、不変IDと参照関係は変わりません。
- 表示タイトルの重複は許容できますが、StoryBlock IDの重複は許容しません。
- 表示タイトルの生成結果をデータ検証と代表例で確認します。
