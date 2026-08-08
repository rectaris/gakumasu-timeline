# Keyboard And Command Navigation

status: checked
task_type: ui_layout
review_class: B
human_design_required: no
human_approval_status: not_required
target_files:
  - src/App.vue
  - src/composables/useKeyboard.js
  - src/composables/useEventSearchFilter.js
  - src/composables/useSelection.js
  - src/composables/useTimelineLayout.js
  - src/components/SidePanel.vue
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
  - npm run test
  - npm run build
  - npm run verify
  - browser verification for keyboard shortcuts, focus order, search focus, event navigation, panel close paths, and mobile viewport
  - git diff --check
acceptance:
  - Keyboard users can search, move between filtered events, and return focus without using the pointer.
  - Shortcuts do not interfere with typing in form controls or browser/system shortcuts.
  - Focus states remain visible and selection state remains stable.
  - Manual and behavior docs accurately describe supported shortcuts.
acceptance_focus:
  - keyboard flow
  - focus safety
  - event navigation
expected_output: implementation-plan
checked_summary_ja: 検索・前後移動・選択復帰などのキーボード操作を強化する。

## Goal

Make timeline exploration efficient for keyboard-heavy users without adding hidden behavior that surprises pointer users.

## Improvement Items Covered

- Add shortcuts such as `/` for event search, `n`/`p` for next/previous filtered event, and a selected-event return shortcut.
- Consider vertical event/lane navigation with arrow keys or modifier combinations.
- Add a lightweight navigation history only if it improves keyboard workflows without conflicting with browser history.

## Implementation Notes

- Continue using `isFormElementTarget` to avoid triggering shortcuts while typing.
- Keep Escape behavior consistent across menu, manual, settings, and detail panel.
- Prefer a small shortcut registry in `useKeyboard.js` over scattered keydown handlers.
- Navigation should use canonical event collapse rules already defined for filtered next/previous behavior.
- Any shortcut that opens or focuses UI must leave focus in a predictable element.

## Decisions

- Keep `useKeyboard.js` as the shortcut owner and expose a small registry-style handler from it.
- Use `/` to open the side menu and focus the existing event search input instead of adding a new global search field.
- Use `n` / `p` for next/previous navigation across the current canonical navigation list, whether or not filters are active.
- Preserve the existing wraparound behavior at the first/last navigation event.
- After keyboard navigation selects an event, move DOM focus to the selected timeline event when it is rendered.
- Keep `/` focused in the menu for query entry, but close the menu after `n` / `p` selects an event.
- Treat Escape as a top-layer close action in this order: manual, settings, menu, detail panel.
- Ignore app shortcuts from form controls and contenteditable targets except for Escape; always ignore IME composition and Ctrl/Alt/Meta modified key events.
- Keep existing arrow-key pan, `+` / `-` zoom, and `r` selected-event return shortcuts; do not add vertical event/lane navigation in this plan.
- Keep URL updates on the existing `replaceState` path and do not add browser-history or command-history behavior.
- Document shortcuts in `docs/manual.md` and `docs/ui-behavior.md`; avoid adding a full shortcut palette.
- Add focused unit tests for shortcut guards and handler dispatch, then verify UI behavior in browser.

## Suggested Task Breakdown

- [x] Inventory current key handling and define a non-conflicting shortcut map.
- [x] Add search focus and filtered next/previous shortcuts.
- [x] Add selected-event return shortcut if plan 021 or equivalent behavior exists.
- [x] Consider vertical nearest-event navigation after horizontal/event navigation is stable.
- [x] Add focused tests for shortcut guards and navigation target selection.
- [x] Update manual and behavior docs.

## Out Of Scope

- Full command palette.
- Custom user-configurable keybindings.
- Browser history replacement.
