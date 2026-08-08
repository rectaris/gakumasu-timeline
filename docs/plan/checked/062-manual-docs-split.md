# Manual Docs Split

status: checked
task_type: japanese_prose
review_class: C
human_design_required: no
human_approval_status: approved
target_files:
  - docs/manual/timeline.md
  - docs/manual/worldline-data-editor.md
target_json:
  - none
required_specs:
  - docs/agent/SPEC_VALIDATION.md
  - docs/agent/SPEC_GIT_WORKFLOW.md
  - docs/agent/SPEC_FILE_MANAGEMENT.md
  - docs/agent/SPEC_JAPANESE_TECH_WRITING.md
validation:
  - git diff --check
  - python3 scripts/lint-plan-docs.py
  - python3 scripts/validate-changes.py
acceptance:
  - docs/manual/ 配下にタイムライン用マニュアルを追加する
  - docs/manual/ 配下に Worldline Data Editor 用マニュアルを追加する
  - それぞれ項目説明と操作方法を含める
acceptance_focus:
  - 既存のアプリ内 manual.md と矛盾しない記述
expected_output: full-implementation
checked_summary_ja: タイムラインと Worldline Data Editor の詳細マニュアルを docs/manual/ 配下に追加する。

## Notes

- 2026-06-26: 既存の `docs/manual.md` はアプリ内マニュアルとして `src/App.vue` が読み込むため、今回は移動せず新規ドキュメントを追加する。
- 2026-06-26: `docs/manual/timeline.md` と `docs/manual/worldline-data-editor.md` を追加し、項目説明、操作方法、保存/検証手順を整理した。
- 2026-06-26: `git diff --check`、`python3 scripts/lint-plan-docs.py`、`python3 scripts/validate-changes.py`、`npm run build` を実行済み。
