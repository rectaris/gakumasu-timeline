# Editor List Item Manual

status: active
task_type: docs
review_class: C
human_design_required: no
human_approval_status: approved
target_files:
  - docs/manual/worldline-data-editor.md
target_json:
  - none
required_specs:
  - docs/agent/SPEC_VALIDATION.md
  - docs/agent/SPEC_GIT_WORKFLOW.md
  - docs/agent/SPEC_JAPANESE_TECH_WRITING.md
validation:
  - git diff --check
  - python3 scripts/lint-plan-docs.py
  - python3 scripts/validate-changes.py
acceptance:
  - Worldline Data Editor の選択リスト内アイテム説明をマニュアルへ追加する
  - 動的リストの由来と選択基準を説明する
acceptance_focus:
  - コミュ種別、ファイル、保存先、参加者、世界線、enum 選択肢
expected_output: full-implementation
checked_summary_ja: Worldline Data Editor マニュアルに選択リスト内アイテム説明を追加する。

## Notes

- 2026-06-26: 既存マニュアルには一部 enum の値説明があるが、コミュ種別、ファイル、保存先、参加者、世界線など動的リストの説明が不足している。
- 2026-06-26: `docs/manual/worldline-data-editor.md` に選択リスト内アイテム説明の節を追加し、コミュ種別、ファイル、保存先ファイル、参加者、世界線、状態系リストを説明した。
- 2026-06-26: `git diff --check`、`python3 scripts/lint-plan-docs.py`、`python3 scripts/validate-changes.py` を実行済み。
