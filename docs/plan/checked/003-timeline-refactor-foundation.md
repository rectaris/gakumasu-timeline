# Implementation Plan: Timeline Refactor Foundation

status: active
task_type: product_logic
review_class: B
human_design_required: no
human_approval_status: not_required
target_files:
  - src/App.vue
  - src/components/
  - src/composables/
  - src/data/
  - src/types/
  - src/utils/
  - docs/data-structure.md
  - docs/processing-flow.md
  - docs/plan/
target_json:
  - none
required_specs:
  - docs/agent/SPEC_DEVELOPMENT_FLOW.md
  - docs/agent/SPEC_UI_DESIGN.md
  - docs/agent/SPEC_ENVIRONMENT.md
  - docs/agent/SPEC_VALIDATION.md
  - docs/agent/SPEC_GIT_WORKFLOW.md
validation:
  - npm run test
  - npm run build
  - python3 scripts/validate-changes.py
  - python3 scripts/lint-plan-docs.py
  - git diff --check
acceptance:
  - Runtime time helpers have one canonical module for both app logic and data files.
  - Core timeline data contracts are documented in reusable type definitions.
  - Duplicate form-target DOM checks are consolidated.
  - Data module aggregation no longer requires manual idol imports while preserving display order.
  - App.vue sheds settings persistence and intro-guide markup without changing user-facing behavior.
  - TimelineSvg props are grouped into render context and interaction handlers.
  - Existing timeline tests and production build pass.
acceptance_focus:
  - abstract 31-day timeline invariants
  - menu/settings/intro behavior
  - lane ordering and data import stability
  - low-risk props and component boundaries
expected_output: full-implementation
checked_summary_ja: タイムライン基盤リファクタを段階的に実装する。

## Notes

## Tasks

### 1. Canonical Data Contracts And Time Helpers

- [x] Move `yearOf` / `yearsAgo` into `src/utils/time.js`.
- [x] Keep data imports working through a short compatibility shim if needed.
- [x] Add reusable timeline type definitions for data and derived event instances.
- [x] Update docs that describe time helpers and data contracts.

### 2. Low-Risk Shared Utilities

- [x] Extract shared DOM target checks to `src/utils/dom.js`.
- [x] Use the helper from `App.vue` and `useKeyboard.js`.

### 3. Data Aggregation

- [x] Replace manual idol imports in `src/data/index.js` with sorted `import.meta.glob` aggregation.
- [x] Preserve existing numbered display order.
- [x] Add or update tests that protect data order and basic shape.

### 4. App.vue Responsibility Split

- [x] Extract settings persistence/theme handling into a composable.
- [x] Extract intro guide markup into a component.
- [x] Group TimelineSvg props into render context and interaction handlers.
- [x] Keep interaction behavior unchanged.

### 5. Validation And Completion

- [x] Run selected validation.
- [x] Review final diff for unrelated user changes.
- [x] Commit only files touched by this work.
