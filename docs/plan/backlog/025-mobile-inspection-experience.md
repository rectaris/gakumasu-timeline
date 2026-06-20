# Mobile Inspection Experience

status: backlog
task_type: ui_layout
review_class: B
human_design_required: no
human_approval_status: not_required
target_files:
  - src/App.vue
  - src/components/SidePanel.vue
  - src/components/ZoomControls.vue
  - src/components/TimelineSvg.vue
  - src/composables/usePointer.js
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
  - docs/agent/SPEC_UI_DESIGN.md
validation:
  - npm run build
  - npm run verify
  - browser verification at desktop and 375x812 mobile for selection, panel close, share, lane focus, zoom controls, touch drag, and pinch
  - git diff --check
acceptance:
  - Selected event details are reachable and readable on narrow mobile viewports.
  - Close, share, lane focus, and selected-event actions remain reachable by touch.
  - Mobile panel changes do not degrade desktop productivity layout.
  - Zoom controls and detail surfaces do not overlap critical timeline content.
acceptance_focus:
  - mobile detail access
  - touch ergonomics
  - desktop preservation
expected_output: implementation-plan
checked_summary_ja: モバイルでの詳細確認と操作導線を改善する。

## Goal

Improve mobile inspection of selected events without turning the desktop-first timeline into a separate mobile app.

## Improvement Items Covered

- Rework the detail panel into a more mobile-appropriate bottom-sheet or hybrid layout.
- Keep share, close, lane focus, and related-event navigation easy to reach on touch screens.
- Recheck zoom controls and touch gestures around the detail surface.

## Implementation Notes

- Desktop remains the primary productivity layout; mobile changes should be responsive CSS and minimal behavior branching where possible.
- Preserve all existing close paths: close button, Escape, and allowed outside tap behavior.
- Avoid trapping focus without a reachable close path.
- Keep panel text dense but readable; do not add explanatory onboarding text to compensate for layout issues.
- Verify `375x812` and at least one desktop viewport before completion.

## Suggested Task Breakdown

- [ ] Audit current side-panel behavior at narrow widths and document overlap/reachability issues.
- [ ] Define a responsive detail-panel layout that keeps primary actions visible.
- [ ] Update panel and zoom-control CSS with stable dimensions.
- [ ] Verify touch drag and pinch behavior with the panel open and closed.
- [ ] Update manual and behavior docs if visible behavior changes.

## Out Of Scope

- New mobile-only data model.
- Replacing the side menu.
- Native-app style gestures beyond current touch drag and pinch behavior.
