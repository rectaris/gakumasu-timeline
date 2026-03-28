# Maintenance Rules

This document is agent-only maintenance guidance. It is not a human-facing explanation document.

## Time Representation

- Treat months as fixed 31-day units, not as real calendar months.
- Convert year/month with `timeValue(year, month)`.
- Convert year/month/day with `dayTimeValue(year, month, day)`.
- Use `displayStartDay` / `displayEndDay` for rendering, visibility checks, and selection focus.

## Event Representation

- `continuous`
  - A continuous event from `start` to `end`.
- `singleWithinRange`
  - An event that happens on one day somewhere between `start` and `end`.
  - It has no concrete center date.
  - The candidate range is shown with a bar and uncertainty markers.

## Event IDs

- For regular events, use `id` as `canonicalId`.
- Common events are duplicated per lane.
- Use `canonicalId` for URL sharing.
- Use `instanceId` to identify a rendered duplicated instance.

## Data Normalization Rules

- If an event has no `id`, assign a fallback ID.
- If an event has no `title`, fill in `(無題)`.
- If an event has no `detail`, fill in an empty string.
- Exclude events whose `start` or `end` is missing year or month.

No stricter data rule is fixed at this time.

## Naming And Responsibility

- Use the `display*` prefix for derived display-time values.
- Use `canonicalId` for URL-sharing IDs and `instanceId` for render-instance IDs.
- Rendering components should not perform data or ID normalization.
- Shared derived calculations belong in helpers/composables.

## Fragile Areas

- `useTimelineData.js`
  - Event normalization and derived fields
- `useTimelineLayout.js`
  - Visibility checks, sublane calculation, coordinate conversion
- `useZoomMachine.js`
  - View range, selection focus, label thresholds
- `usePointer.js`
  - Dragging, click suppression, touch handling
- `useSelection.js`
  - URL restore, common-event selection

## Changes That Require Docs Sync

- Any UI or visible-behavior change that affects `docs/manual.md`
- Input behavior changes
- Zoom behavior changes
- Label-display or event-visual changes
- Meaning changes to `occurrenceType`
- URL-sharing behavior changes

For other docs, update only the files whose text is actually affected.

## Verification Policy

- `npm run build` is a minimum check.
- Real browser verification is also required.
- Preferred environments: Windows Chrome first, then mobile view.

## Forbidden Changes

- Do not change character names or commu text as a side effect of UI work.
- Do not change data meaning unless explicitly requested.
