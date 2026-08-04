# Side Panel Field Tooltips

status: active
task_type: ui
review_class: B
human_design_required: no
human_approval_status: not_required
target_files:
  - src/components/SidePanel.vue
  - src/style.css
target_json:
  - none
required_specs:
  - docs/agent/SPEC_VALIDATION.md
  - docs/agent/SPEC_GIT_WORKFLOW.md
  - docs/agent/SPEC_UI_DESIGN.md
validation:
  - npm run build
  - git diff --check
  - browser hover verification
acceptance:
  - 詳細パネル内の主要項目にマウスオーバー / フォーカスで説明が表示される
  - 標準 title と独自説明が二重表示されない
  - デスクトップとモバイル幅で説明が読める
acceptance_focus:
  - 詳細パネルの項目名、出典詳細、注記、関連コンテキスト
expected_output: full-implementation
checked_summary_ja: 詳細パネルの各項目へホバー説明を追加する。

## Notes

- 2026-06-26: `SidePanel.vue` の項目名とセクション見出しに説明を付ける。`title` は使わず、独自ツールチップのみ表示する。
- 2026-06-26: 詳細パネルの `dt` と主要セクション見出しに説明を追加し、詳細本文には見出しを追加して説明対象を明確化。
- 2026-06-26: 出典絞り込みボタンと閉じるボタンの `title` を削除し、`aria-label` のみへ変更。
- 2026-06-26: `npm run build`、`npm run test`、ブラウザ検証、`git diff --check`、`python3 scripts/lint-plan-docs.py`、`python3 scripts/validate-changes.py` を実行済み。
