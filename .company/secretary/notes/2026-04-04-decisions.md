# 2026-04-04 Decisions

- `gakumasu-timeline/.company/` は、親ワークスペースの `.company/` にある `gakumasu-timeline` 関連メモを参照して初期化する
- `gakumasu-timeline` の次作業は、まずイントロガイド文言の再確認を行い、必要なら1件の小さな追従タスクに限定する
- portal や public URL に関わる変更は、実際に文言依存が出るまでは対象外とする
- PM 部署を常設し、直近 PM 作業は `intro-guide` 再確認を project / ticket 管理する
- engineering では、`抽象時系列` の説明対象を `日付ラベル` と明示する最小の文言修正だけを実施する
- 次の PM 順序は、実表示の再確認 → 用語統一確認 → 操作感の小さな改善候補の選定とする
- 実表示確認待ちの間も PM は止めず、用語統一確認チケットと候補比較メモを先行で作成する
- wording consistency check は追加 ticket なしで完了し、次の第一候補は `ズーム操作エリアの理解` とする
- `ズーム操作エリアの理解` は、まず見た目変更なし・文言限定の bounded task として扱う
- `ズーム操作エリアの理解` については、`表示期間（横軸）` / `レーン密度（縦軸）` の文言明確化を実装して閉じる
- 安定性整理として、`npm run verify` と実ブラウザ確認の役割差を `docs/development.md` に明記する
- 自動確認の基準値として、2026-04-04 時点の `npm run verify` 成功を記録する
- ブラウザ確認は、headless Chrome による desktop / mobile 幅の smoke check まで実施し、残リスクは Windows Chrome 実機確認に絞る
