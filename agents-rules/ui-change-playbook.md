# UI Change Playbook

This document is agent-only workflow guidance for visible UI or interaction changes.

## When To Use

- Layout changes
- Timeline rendering changes
- Input behavior changes
- Menu, settings, manual, or side-panel changes
- Visual theme or label-display changes

## Workflow

1. Read the high-risk files first.
   - `src/App.vue`
   - `src/composables/useTimelineLayout.js`
   - `src/composables/useZoomMachine.js`
   - `src/composables/usePointer.js`
   - Relevant component files
2. Identify the source of truth before editing.
   - Rendering and visibility: `displayStartDay` / `displayEndDay`
   - URL selection: `canonicalId`
   - Render-instance identity: `instanceId`
3. Prefer one implementation path.
   - Do not add a second rendering path for the same UI
   - Do not duplicate derived calculations in components
4. Check interaction feel after the edit.
   - Wheel zoom
   - Drag movement
   - Click/tap selection
   - `Escape` behavior
5. Review affected human-facing docs.
   - `README.md`
   - `docs/manual.md`
   - Relevant files under `docs/`

## Mandatory Questions Before Finishing

- Did this change make the timeline feel heavier, noisier, or less predictable?
- Did this add duplicate rendering or duplicate state derivation?
- Did this change require text updates in app UI or docs?
- Did this create a new edge case near viewport boundaries?

## Minimum Verification

- `npm run build`
- Real browser verification when behavior changed
