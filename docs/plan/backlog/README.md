# backlog の使い方

このディレクトリには、今すぐ着手しない作業候補や、条件待ちの作業を置きます。

## 基本方針

- 現在進行中の作業は `docs/plan/active/` に置きます。
- backlog は、開始条件、対象ファイル、検証方法、完了条件が見える形で保存します。
- 着手するときは `scripts/promote-plan.sh` で active に移します。
- 番号は active、backlog、checked で共通の連番として扱います。

## 現在の backlog

- [064 Three-View Application Shell](064-three-view-application-shell.md)
  - 「物語時系列」「物語イベント」「学マス情報史」を単一アプリ内の独立ビューとして切り替える共通基盤です。
- [065 Story Event Graph View](065-story-event-graph-view.md)
  - 親愛度、イベント、サポカなどの各話をノードとする「物語イベント」ビューです。
  - データ契約と表示仕様を確定してから実装を開始します。
- [066 Gakumasu Real-World History View](066-gakumasu-realworld-history-view.md)
  - 現実世界の日付で公式展開をたどる「学マス情報史」ビューです。
  - 収録範囲、出典方針、暦データ契約を確定してから実装を開始します。

064 は 065 と 066 の共通基盤です。

3ビューは同じ時間軸へ重ねず、選択中の1ビューだけを表示します。

## AI エージェント向け情報

詳しい運用ルールは `docs/agent/SPEC_PLAN_WORKFLOW.md` を参照してください。
