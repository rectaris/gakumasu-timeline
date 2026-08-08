# Agent standards decision rules

status: checked
task_type: orchestration_meta
review_class: B
human_design_required: no
human_approval_status: not_required
target_files:
  - AGENTS.md
  - docs/agent/SPEC_DEVELOPMENT_FLOW.md
  - docs/agent/SPEC_VALIDATION.md
  - docs/agent/SPEC_UI_DESIGN.md
  - docs/agent/SPEC_ENVIRONMENT.md
  - docs/agent/SPEC_ORCHESTRATION.md
  - agents-rules/decision-boundaries.md
  - agents-rules/docs-sync-playbook.md
target_json:
  - none
required_specs:
  - docs/agent/SPEC_DEVELOPMENT_FLOW.md
  - docs/agent/SPEC_PLAN_WORKFLOW.md
  - docs/agent/SPEC_ORCHESTRATION.md
  - docs/agent/SPEC_VALIDATION.md
  - docs/agent/SPEC_GIT_WORKFLOW.md
validation:
  - git diff --check
  - python3 scripts/lint-plan-docs.py
  - python3 scripts/structure-map.py --check
acceptance:
  - Agent approval boundaries, validation escalation, dependency, data, UI, helper, and release decisions are documented.
  - Existing startup routing remains concise and points to the detailed rules.
  - Docs-only validation passes.
acceptance_focus:
  - decision boundaries
  - validation behavior
  - routing clarity
expected_output: full-implementation
checked_summary_ja: エージェント行動基準の未決定事項を明文化する。

## Notes

- User requested implementation of the previously recommended policy set.

## Completion Notes

- Added `agents-rules/decision-boundaries.md` with approval, testing, browser evidence, data provenance, uncertainty, dependency, performance, accessibility, public URL, generated artifact, failure escalation, documentation, language, helper, and release boundaries.
- Linked the new detailed rules from `AGENTS.md` and the relevant agent specs.
- Extended validation, UI, environment, orchestration, and docs-sync rules with the selected policy details.
- Validation passed:
  - `git diff --check`
  - `python3 scripts/lint-plan-docs.py`
  - `python3 scripts/structure-map.py --check`
  - `python3 scripts/format-plan-docs.py --check`
- Unresolved risks: none.
