# Timeline Event Tooltips

status: active
task_type: ui
review_class: B
human_design_required: no
human_approval_status: not_required
target_files:
  - src/components/TimelineEvents.vue
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
  - 本番タイムラインのイベントへマウスオーバーした時、項目説明が表示される
  - 標準 title と独自表示が重複しない
  - キーボードフォーカスでも同等の説明を確認できる
acceptance_focus:
  - タイムラインイベントと密集イベント要約のホバー表示
expected_output: full-implementation
checked_summary_ja: 本番タイムラインのイベント項目へホバー説明を追加する。

## Notes

- 2026-06-26: `TimelineEvents.vue` の既存 SVG title は標準ツールチップのみ。独自ツールチップを SVG 内に描画し、title 重複を避ける。
- 2026-06-26: イベント本体と密集イベント要約のホバー / フォーカス時に、SVG 内へ独自ツールチップを描画する実装を追加。
- 2026-06-26: `title` 要素を削除し、標準ツールチップとの二重表示を避けた。
- 2026-06-26: `npm run build`、`npm run test`、ブラウザ検証、`git diff --check`、`python3 scripts/lint-plan-docs.py`、`python3 scripts/validate-changes.py` を実行済み。
