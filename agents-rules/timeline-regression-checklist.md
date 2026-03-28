# Timeline Regression Checklist

This document is agent-only regression guidance for timeline-related work.

## Interaction

- Wheel-based horizontal zoom still works
- Dragging still moves the timeline in both axes
- Touch drag still pans the timeline
- Pinch behavior still matches current mobile rules
- Dragging does not trigger accidental clicks

## Rendering

- Events stay within the timeline viewport
- Year/month/day labels do not bleed into lane-label space
- Edge labels do not overlap unnaturally
- Lane boundaries remain readable
- `singleWithinRange` still uses uncertainty markers and not a fake concrete date

## Selection

- Clicking an event still opens the side panel
- Clicking allowed empty space still closes the panel
- Menu/settings/manual interaction does not unintentionally close the panel
- Common-event selection and URL restore still work

## Filters And Lanes

- Initial lane visibility is still correct
- Hiding all lanes does not reset the horizontal viewport unexpectedly
- Re-showing lanes restores the previous horizontal viewport
- Sorting and search do not break lane identity
