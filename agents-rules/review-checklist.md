# Review Checklist

This document is agent-only review guidance. It is not a human-facing explanation document.

## Scope

- Use this file for cross-cutting review points.
- Use `ui-change-playbook.md` for implementation workflow on visible UI changes.
- Use `timeline-regression-checklist.md` for detailed timeline interaction and rendering regression checks.
- Use `docs-sync-playbook.md` for doc-update workflow.

## Functional Review Points

- Confirm that rendering and visibility checks consistently use `displayStartDay` / `displayEndDay`.
- Confirm that `singleWithinRange` cannot be misread as a concrete date.
- Confirm that duplicated common events do not collide on `instanceId`.
- Confirm that the URL `event` query is consistent with `canonicalId`.
- Confirm that hidden events do not remain selected after filters change.

## Architecture And Duplication Review Points

- No rendering logic or derived calculation is duplicated across files without reason.
- No unused `prop`, `computed`, function, or CSS remains.
- No old UI helpers or styles remain after replacement.
- No new workflow or rule document duplicates the responsibility of an existing playbook without reason.

## Documentation Review Points

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
