# Review Checklist

This document is agent-only review guidance. It is not a human-facing explanation document.

## Functional Checks

- Confirm that rendering and visibility checks consistently use `displayStartDay` / `displayEndDay`.
- Confirm that `singleWithinRange` cannot be misread as a concrete date.
- Confirm that duplicated common events do not collide on `instanceId`.
- Confirm that the URL `event` query is consistent with `canonicalId`.
- Confirm that hidden events do not remain selected after filters change.

## Input Checks

- Wheel-based horizontal zoom works.
- Horizontal wheel movement pans left/right.
- Dragging moves in both axes.
- Drag-click suppression is neither too aggressive nor too weak.
- `Escape` closes menu / manual / panel correctly.

## UI Checks

- Year/month/day labels stay fixed while vertical movement continues.
- Common events, regular events, and `singleWithinRange` look distinct.
- In full-screen timeline mode, edges and lower lanes are not cut off.
- Menu and side panel overlap does not make the UI unusable.

## Duplication And Leftovers

- No rendering logic or derived calculation is duplicated across files without reason.
- No unused `prop`, `computed`, function, or CSS remains.
- No old UI helpers or styles remain after replacement.

## Documentation Checks

- `README.md`
- `docs/manual.md`
- `docs/ui-behavior.md`
- `docs/processing-flow.md`

If UI or visible behavior changed, `docs/manual.md` must always be reviewed.  
For other docs, update only what is affected by the change.

## Reporting Rules

- Find as many real issues as possible.
- Explain them clearly and accurately.
- Report duplication and unused code even when they are low priority.
- Report in severity order.
- Use numbered items starting from `1.`.
- Include severity in each item.

## Post-Change Report

- Changes
  - What changed
  - What the problem was
  - How it was fixed
- Verification
  - `npm run build`
  - Whether real browser/device verification was done
- Unverified risks
  - Remaining unchecked environments or operations
