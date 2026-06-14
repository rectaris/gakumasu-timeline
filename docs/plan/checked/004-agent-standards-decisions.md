# Implementation Plan: Agent Standards Decisions

status: checked
task_type: orchestration_meta
review_class: B
human_design_required: no
human_approval_status: not_required
target_files:
  - docs/agent/SPEC_UI_DESIGN.md
  - docs/agent/SPEC_ENVIRONMENT.md
  - docs/agent/SPEC_VALIDATION.md
  - docs/agent/SPEC_DEVELOPMENT_FLOW.md
  - docs/agent/SPEC_ORCHESTRATION.md
  - agents-rules/ui-change-playbook.md
  - agents-rules/maintenance.md
  - agents-rules/invariants.md
  - docs/plan/plan.md
target_json:
  - none
required_specs:
  - docs/agent/SPEC_VALIDATION.md
  - docs/agent/SPEC_GIT_WORKFLOW.md
  - docs/agent/SPEC_FILE_MANAGEMENT.md
  - docs/agent/SPEC_DEVELOPMENT_FLOW.md
  - docs/agent/SPEC_PLAN_WORKFLOW.md
  - docs/agent/SPEC_ORCHESTRATION.md
validation:
  - git diff --check
  - python3 scripts/lint-plan-docs.py
  - python3 scripts/structure-map.py --check
acceptance:
  - UI, browser verification, environment, data, dependency, and helper-agent decision policies are explicit.
  - Broken section-number references in UI change guidance are removed.
  - Agent-facing rules point to stable specification files rather than human-facing docs only.
acceptance_focus:
  - missing decision policies
  - stable routing for future agents
  - docs-only validation
expected_output: full-implementation
checked_summary_ja: エージェント行動基準の未決定事項を仕様化する。

## Notes

Implement the recommended approaches from the user-facing decision audit:

- Centralize mandatory UI and environment policies in `docs/agent/SPEC_*.md`.
- Keep `agents-rules/` as detailed playbooks/checklists and point them at stable files/headings.
- Define practical browser verification, data integrity, dependency, accessibility, and helper-use boundaries.

## Tasks

- [x] Fill `SPEC_UI_DESIGN.md` with UI quality, accessibility, responsive, and browser verification policy.
- [x] Fill `SPEC_ENVIRONMENT.md` with local stack, public path, generated file, deploy, dependency, and target browser policy.
- [x] Extend validation policy with project-specific checks and browser verification fallback rules.
- [x] Document data integrity and URL-facing ID compatibility boundaries.
- [x] Document helper-agent trigger and fallback policy.
- [x] Replace stale numbered `AGENTS.md` section references in UI playbook with stable file references.
- [x] Run docs/workflow validation.
- [x] Finalize and archive this active plan.
