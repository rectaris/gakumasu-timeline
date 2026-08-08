# backlog の使い方

このディレクトリには、今すぐ着手しない作業候補や、条件待ちの作業を置きます。

## 基本方針

- 現在進行中の作業は `docs/plan/active/` に置きます。
- backlog は、開始条件、対象ファイル、検証方法、完了条件が見える形で保存します。
- 着手するときは `.project-agent-workflow/scripts/promote-plan.sh` で active に移します。
- 番号は active、backlog、checked で共通の連番として扱います。

## 現在の backlog

現在、登録済みのbacklogはありません。

[064 Three-View Application Shell](../checked/064-three-view-application-shell.md)は完了済みで、
MVPを完了した[065 Story Event Graph View](../checked/065-story-event-graph-view.md)と
[066 Gakumasu Real-World History View](../checked/066-gakumasu-realworld-history-view.md)の共通基盤を提供します。

3ビューは同じ時間軸へ重ねず、選択中の1ビューだけを表示します。

## AI エージェント向け情報

詳しい運用ルールは `.project-agent-workflow/docs/agent/SPEC_PLAN_WORKFLOW.md` を参照してください。
