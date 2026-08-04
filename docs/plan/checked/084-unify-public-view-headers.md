# Unify the three public view headers around the narrative timeline shell.

status: active
task_type: ui_layout
review_class: C
human_design_required: yes
human_approval_status: approved
target_files:
  - src/components/ApplicationHeader.vue
  - src/components/TimelineModeSwitcher.vue
  - src/components/LoginLink.vue
  - src/pages/NarrativeTimelinePage.vue
  - src/pages/StoryGraphPage.vue
  - src/pages/RealworldHistoryPage.vue
  - src/style.css
  - docs/manual.md
  - docs/ui-behavior.md
target_json:
  - none
required_specs:
  - docs/agent/SPEC_VALIDATION.md
  - docs/agent/SPEC_GIT_WORKFLOW.md
  - docs/agent/SPEC_FILE_MANAGEMENT.md
  - docs/agent/SPEC_DEVELOPMENT_FLOW.md
  - docs/agent/SPEC_PLAN_WORKFLOW.md
  - docs/agent/SPEC_UI_DESIGN.md
  - docs/agent/SPEC_JAPANESE_TECH_WRITING.md
  - docs/agent/SPEC_DECISION_AUDIT.md
validation:
  - npm run test
  - npm run build
  - browser verification at 1440x900 and 375x812
  - python3 scripts/validate-changes.py
  - python3 scripts/lint-plan-docs.py
  - git diff --check
acceptance:
  - All three public views use one shared header component based on the narrative timeline header.
  - Header height, title hierarchy, mode switcher, login link, portal link, control shape, and responsive behavior remain consistent across views.
  - Narrative-only menu, manual, and settings actions remain available without being added to unrelated views.
  - Story graph and real-world history filters remain in their page-owned toolbars.
  - Existing mode switching, timeline interactions, selections, URLs, and public paths remain unchanged.
acceptance_focus:
  - shared application identity
  - narrative-based visual consistency
  - responsive header reachability
expected_output: full-implementation
checked_summary_ja: 物語時系列を基準に3ビューのヘッダーと共通操作の見た目を統一する。

## Problem

The three public views share navigation but implement visibly different header
structures, heights, title positions, portal actions, and responsive behavior.

## Goal

Create one shared public application header based on the compact fixed narrative
timeline shell while keeping page-specific tools and content ownership intact.

## Implementation Instructions

- Extract the narrative header shell into a reusable component with a slot for
  narrative-only primary actions.
- Let the shared component own the page heading, mode switcher, login link, and
  portal link.
- Use the canonical mode labels as page titles, including `物語時系列` for the
  narrative view.
- Consolidate header dimensions and control shape through shared CSS tokens.
- Remove superseded page-specific header markup and styles only.
- Keep story and real-world filters in their existing toolbars.
- Update human-facing UI documentation only where the shared shell changes the
  current description.

## Decisions

- Use one shared header component rather than parallel page-specific copies.
- Standardize only the app shell and common actions; preserve page-owned
  toolbars and information density.
- Reuse the narrative header's 56px fixed layout, neutral surface, centered
  title, compact controls, and narrow-screen title behavior.
- Keep the narrative menu, manual, and settings actions in the shared header's
  primary-action slot and do not expose them on other views.

## Tasks

- [x] Add the shared application header and migrate all three public views.
- [x] Consolidate header sizing, spacing, and action styling.
- [x] Align human-facing documentation with the shared shell.
- [x] Run automated and browser validation on desktop and mobile.
- [x] Commit and archive the completed plan.

## Validation Notes

- `npm run test` passed 139 tests across 25 files.
- `npm run build` completed successfully.
- `python3 scripts/validate-changes.py` passed its selected plan checks.
- `python3 scripts/lint-plan-docs.py`, plan formatting, and
  `git diff --check` passed.
- Headless Chromium passed at `1440x900` in light mode and `375x812` in dark
  mode for all three views.
- Browser checks covered the shared 56px header, 36px common controls, title
  and action spacing, page-content offsets, mobile title treatment, and the
  absence of console errors or failed requests.
- Interaction smoke checks covered the narrative menu and zoom, story graph
  node selection and zoom, real-world item selection and zoom, and keyboard
  mode switching with mobile heading focus.
- Temporary before-and-after screenshots are stored outside the repository in
  `/tmp/gakumasu-header-before/` and `/tmp/gakumasu-header-after/`.
