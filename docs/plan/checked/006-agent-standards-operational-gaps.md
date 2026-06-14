# Agent Standards Operational Gaps

status: checked
task_type: orchestration_meta
review_class: B
human_design_required: no
human_approval_status: not_required
target_files:
  - docs/agent/SPEC_DEVELOPMENT_FLOW.md
  - docs/agent/SPEC_GIT_WORKFLOW.md
  - docs/agent/SPEC_FILE_MANAGEMENT.md
  - docs/agent/SPEC_VALIDATION.md
  - docs/agent/SPEC_ORCHESTRATION.md
  - docs/agent/SPEC_ENVIRONMENT.md
  - docs/agent/SPEC_UI_DESIGN.md
  - agents-rules/decision-boundaries.md
target_json:
  - none
required_specs:
  - docs/agent/SPEC_DEVELOPMENT_FLOW.md
  - docs/agent/SPEC_PLAN_WORKFLOW.md
  - docs/agent/SPEC_ORCHESTRATION.md
  - docs/agent/SPEC_VALIDATION.md
  - docs/agent/SPEC_GIT_WORKFLOW.md
  - docs/agent/SPEC_FILE_MANAGEMENT.md
  - docs/agent/SPEC_ENVIRONMENT.md
  - docs/agent/SPEC_UI_DESIGN.md
validation:
  - git diff --check
  - python3 scripts/lint-plan-docs.py
  - python3 scripts/format-plan-docs.py --check
  - python3 scripts/structure-map.py --check
acceptance:
  - Dirty-worktree, same-file user-change, and scope-creep handling are explicit.
  - UI/browser validation includes console and network error checks where relevant.
  - Helper-output acceptance, evidence handling, external content, dependency update, secret exposure, and deploy confirmation policies are documented.
  - Docs-only workflow validation passes.
acceptance_focus:
  - operational safety gaps
  - validation evidence
  - helper and release acceptance
expected_output: full-implementation
checked_summary_ja: エージェント行動基準の運用上の未定義点を補完する。

## Notes

- User requested implementation of the recommended policy approaches from the decision audit.
- This work fills remaining operational gaps without changing product runtime behavior.

## Tasks

- [x] Add dirty-worktree and same-file conflict handling.
- [x] Add scope-creep and related-bug handling.
- [x] Add browser console/network and performance observation expectations.
- [x] Add helper-output acceptance and evidence artifact policies.
- [x] Add external content, dependency update, secret exposure, and deploy confirmation policies.
- [x] Run docs/workflow validation.

## Completion Notes

- Added dirty-worktree and same-file user-change handling to Git and file-management policy.
- Added scope-creep handling and review-class guidance for broad policy changes.
- Added console/network validation, evidence artifact, and performance observation rules.
- Added helper-output acceptance checks.
- Added external content, dependency update, secret exposure, and deployment follow-up rules.
- Validation passed:
  - `git diff --check`
  - `python3 scripts/lint-plan-docs.py`
  - `python3 scripts/format-plan-docs.py --check`
  - `python3 scripts/structure-map.py --check`
  - `python3 scripts/validate-changes.py`
- Unresolved risks: none.
