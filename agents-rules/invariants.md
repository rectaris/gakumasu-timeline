# Invariants

This document defines the core technical and domain invariants of the `gakumasu-timeline` application.

## 1. Time Representation
- Time is an abstract timeline, not a real calendar. 
- Every month is treated as exactly 31 days.
- Rendering, visibility checks, and selection focus use `displayStartDay` / `displayEndDay` as the source of truth.

## 2. Event Types
- `occurrenceType: "singleWithinRange"` means "one day somewhere within the range" and does not imply a concrete date.
- Common events (shared across multiple idols) are duplicated per lane for display.

## 3. Identification
- URL sharing and data lookup use `canonicalId`. 
- Render keys and DOM instances use `instanceId`.
