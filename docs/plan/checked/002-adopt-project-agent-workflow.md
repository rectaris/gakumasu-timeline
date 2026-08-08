# Adopt Project Agent Workflow

status: checked
task_type: orchestration_meta
review_class: B
human_design_required: no
human_approval_status: not_required
target_files:
  - AGENTS.md
  - README.md
  - .copier-answers.yml
  - .codex/
  - docs/agent/
  - docs/plan/
  - scripts/
target_json:
  - none
required_specs:
  - docs/agent/SPEC_DEVELOPMENT_FLOW.md
  - docs/agent/SPEC_PLAN_WORKFLOW.md
  - docs/agent/SPEC_ORCHESTRATION.md
  - docs/agent/SPEC_VALIDATION.md
validation:
  - python3 scripts/validate-changes.py
  - python3 scripts/check-agent-completion.sh
  - git diff --check
acceptance:
  - temp_project v0.3.0 template files are installed without overwriting timeline-specific rules.
  - Copier update metadata points to the GitHub template source.
acceptance_focus:
  - updateable workflow files
  - existing timeline rules preserved
expected_output: full-implementation
checked_summary_ja: project-agent-workflow テンプレート構成を gakumasu-timeline に導入した。

## Goal

導入済みの `temp_project` v0.3.0 テンプレート構成を `gakumasu-timeline` に統合し、既存の timeline 固有ルールを保持したまま Copier 更新可能な形式に整える。

## Tasks

- [x] Copier 生成物を別ディレクトリに作成する。
- [x] `.codex/`、`docs/agent/`、`scripts/`、`.copier-answers.yml` を導入する。
- [x] 既存 `AGENTS.md` と `README.md` を上書きせず統合する。
- [x] workflow/plan/security/structure 検証を実行する。
- [x] 完了記録を `docs/plan/checked.md` へ移す。
