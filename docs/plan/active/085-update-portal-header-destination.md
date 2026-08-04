# Update the shared header portal destination.

status: active
task_type: ui_layout
review_class: C
human_design_required: no
human_approval_status: approved
target_files:
  - src/components/ApplicationHeader.vue
target_json:
  - none
required_specs:
  - docs/agent/SPEC_VALIDATION.md
  - docs/agent/SPEC_GIT_WORKFLOW.md
  - docs/agent/SPEC_FILE_MANAGEMENT.md
  - docs/agent/SPEC_DEVELOPMENT_FLOW.md
  - docs/agent/SPEC_PLAN_WORKFLOW.md
  - docs/agent/SPEC_UI_DESIGN.md
  - docs/agent/SPEC_ENVIRONMENT.md
  - docs/agent/SPEC_JAPANESE_TECH_WRITING.md
validation:
  - npm run build
  - browser verification of the shared link in all three views
  - python3 scripts/validate-changes.py
  - python3 scripts/lint-plan-docs.py
  - git diff --check
acceptance:
  - The shared header portal button points to https://curiretas.com/gakumastool/ in all three public views.
  - The accessible label and title describe the Curiretas Gakumasu tools destination.
  - Existing timeline public paths, mode switching, and other header actions remain unchanged.
acceptance_focus:
  - exact destination URL
  - shared header coverage
expected_output: full-implementation
checked_summary_ja: 共通ヘッダーのポータルボタンをCuriretasの学マスツールへ変更する。

## Problem

The shared header portal button still links to the legacy Rectaris portal root.

## Goal

Point the existing shared portal button to the requested Curiretas Gakumasu
tools page without changing any application or deployment path.

## Implementation Instructions

- Change the destination, accessible label, and title in the shared header.
- Keep the icon, placement, same-tab behavior, and responsive visibility intact.
- Verify the shared component supplies the exact link to all three views.

## Decisions

- Use the exact destination `https://curiretas.com/gakumastool/`.
- Describe the destination as `Curiretasの学マスツール` in accessible copy.
- Do not change legacy application hosting URLs or deployment configuration.

## Tasks

- [x] Update the shared portal link.
- [x] Validate all three views and the production build.
- [ ] Commit and archive the completed plan.

## Validation Notes

- `npm run build` completed successfully.
- `python3 scripts/validate-changes.py`, plan lint, plan formatting, and
  `git diff --check` passed.
- Headless Chromium verified the exact `href`, accessible label, and title in
  all three views at `1440x900` and `375x812`.
- The link remains visible on desktop and retains its existing hidden mobile
  behavior with no browser console errors.
