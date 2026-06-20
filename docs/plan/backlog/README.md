# backlog の使い方

このディレクトリには、今すぐ着手しない作業候補や、条件待ちの作業を置きます。

## 基本方針

- 現在進行中の作業は `docs/plan/active/` に置きます。
- backlog は、開始条件、対象ファイル、検証方法、完了条件が見える形で保存します。
- 着手するときは `scripts/promote-plan.sh` で active に移します。
- 番号は active、backlog、checked で共通の連番として扱います。

## 現在の backlog

現在、backlog には以下の計画があります。

- `020-view-state-persistence-and-sharing.md`: 表示状態の保存・共有と絞り込み状態の見える化
- `021-orientation-range-navigation.md`: 現在位置の把握、選択イベント復帰、ズームプリセット
- `022-keyboard-command-navigation.md`: 検索・前後移動・復帰のキーボード操作
- `023-lane-comparison-and-dense-event-summary.md`: 複数レーン比較と密集イベント要約
- `024-evidence-quality-audit-navigation.md`: 不確実・矛盾・出典関連の監査ビュー
- `025-mobile-inspection-experience.md`: モバイルでの詳細確認とタッチ操作改善
- `026-performance-observability-and-scaling.md`: 描画性能の観測と大規模化の準備

汎用タイムラインアプリ化は、現時点では対象外です。

## AI エージェント向け情報

詳しい運用ルールは `docs/agent/SPEC_PLAN_WORKFLOW.md` を参照してください。
