# backlog の使い方

このディレクトリには、今すぐ着手しない作業候補や、条件待ちの作業を置きます。

## 基本方針

- 現在進行中の作業は `docs/plan/active/` に置きます。
- backlog は、開始条件、対象ファイル、検証方法、完了条件が見える形で保存します。
- 着手するときは `scripts/promote-plan.sh` で active に移します。
- 番号は active、backlog、checked で共通の連番として扱います。

## 現在の改善計画

- backlog: `008-data-source-model-hardening.md`: 参加者・世界線・出典・不確実性のデータモデル強化
- backlog: `009-generated-data-pipeline.md`: raw/generated 分離による長期運用向け読み込み
- backlog: `013-domain-uncertainty-semantics.md`: 学マス固有の不確実性・根拠・世界線意味論

汎用タイムラインアプリ化は、現時点では対象外です。

## AI エージェント向け情報

詳しい運用ルールは `docs/agent/SPEC_PLAN_WORKFLOW.md` を参照してください。
