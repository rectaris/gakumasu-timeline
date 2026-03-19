# AGENTS.md

このファイルは、このリポジトリで修正点の探索や実装修正を行う AI / 保守作業者向けの運用メモです。

`AGENTS.md` と `docs/maintainers/` 配下は AI / 保守作業向けです。  
それ以外のテキストファイルは、主に人間が読む前提のドキュメントとして扱います。

## 1. 最優先事項

- 操作感を最優先で守る
- UI と、ユーザーが実際に目にする見た目を重視する
- 破壊してはいけない対象として、以下を常に意識する
  - キャラクター情報
  - コミュ情報
  - ホイール拡大縮小
  - ドラッグ移動

## 2. 最初に確認するファイル

- `src/App.vue`
- `src/composables/useTimelineData.js`
- `src/composables/useTimelineLayout.js`
- `src/composables/useZoomMachine.js`
- `src/composables/usePointer.js`
- `src/components/TimelineEvents.vue`
- `src/components/TimelineScaleOverlay.vue`
- `src/components/TimelineScaleLabels.vue`
- `src/components/SidePanel.vue`
- `src/style.css`

## 3. 不変条件

- 日付は実カレンダーではなく、各月31日換算の抽象時系列として扱う
- 描画・可視判定・選択フォーカスは `displayStartDay` / `displayEndDay` を正とする
- `occurrenceType: "singleWithinRange"` は「期間内のどこか1日」を表し、具体的な発生日は持たない
- 共通イベントは表示上は各レーンに複製される
- URL 共有には `canonicalId` を使い、描画キーには `instanceId` を使う

## 4. 作業ルール

- 同じ責務の表示ロジックや派生計算を別ファイルに複製しない
- 基本的に重複処理は統合する
- 未使用の `prop`、`computed`、関数、CSS は残さない
- 参照されていない CSS / `prop` / helper は基本削除する
- 将来使う想定だけでは残さない
- UI コンポーネントは描画責務を優先し、データ補完や ID 補完は composable 側へ寄せる
- 複数箇所で使う派生計算は composable / helper に寄せ、コンポーネント内へ複製しない

## 5. 承認境界

- 以下は事前確認なしで進めてよい
  - typo 修正
  - 未使用コード削除
  - docs 更新
- それ以外の処理追加や仕様変更は、基本的に事前確認を行い、合意を取ってから進める
- docs 更新は自動で行ってよい

## 6. 変更禁止領域

- キャラ名やコミュ文言は、UI 修正のついでに直さない
- データ内容そのものの意味変更は、明示的な依頼がない限り行わない

## 7. 命名と責務

- 表示用の派生時刻は `display*` 接頭辞で表す
- URL 共有用 ID は `canonicalId`、描画インスタンス識別は `instanceId` に統一する
- 時刻表現を変える場合は `src/utils/time.js` と `docs/data-structure.md` を必ず確認する
- 選択や URL 復元を変える場合は `src/composables/useSelection.js` と共通イベント複製の整合を確認する

## 8. ドキュメント更新

- UI や表示を変えたら、アプリ内表示だけでなく `README.md` と `docs/` も確認する
- `docs/manual.md` は UI や表示の変更に伴って必ず確認する
- それ以外のドキュメントは、変更内容と既存記述を照らし合わせて必要なものだけ更新する

## 9. 修正点探索の優先観点

1. 実装と README / docs の説明が食い違っていないか
2. 同じ派生値や同じ描画を複数箇所で持っていないか
3. 未使用コードや旧 UI の残骸が残っていないか
4. 共通イベント複製、`canonicalId`、`instanceId` の整合が崩れていないか
5. 問題点は、許す限り多く・わかりやすく・正確に報告する

## 10. 修正後の確認

- `npm run build`
- 実機ブラウザ確認
- ホイールでの水平拡大縮小
- ドラッグでの上下左右移動
- `Escape` によるメニュー / マニュアル / パネルの閉鎖
- 共通イベントの選択と URL 復元
- `singleWithinRange` の表示と詳細文言

### 実機確認の優先環境

- 最優先: Windows Chrome
- 次点: スマホ表示

## 11. レビュー結果の出し方

- 重大度順で報告する
- アイテマイズを使い、`1.` から番号を振る
- 各項目に重要度を明記する
- 不具合、重複、残骸、docs 不整合を区別して書く

## 12. 修正後の報告テンプレート

- 変更点
  - 何を変えたか
  - 問題は何だったか
  - どう解決したか
- 確認結果
  - `npm run build`
  - 実機確認の有無
- 未確認リスク
  - まだ見ていない環境や操作

## 13. 関連ドキュメント

- `docs/maintainers/maintenance.md`
- `docs/maintainers/review-checklist.md`
- `docs/data-structure.md`
- `docs/processing-flow.md`
- `docs/ui-behavior.md`
