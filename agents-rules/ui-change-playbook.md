# UI Change Playbook

This document is agent-only workflow guidance for visible UI or interaction changes.

## When To Use

- Layout changes
- Timeline rendering changes
- Input behavior changes
- Menu, settings, manual, or side-panel changes
- Visual theme or label-display changes

## Workflow

1. Read the canonical routing rules before editing.
   - Use `AGENTS.md` for repository priority and timeline rule entry points.
   - Use `.project-agent-workflow/docs/agent/SPEC_UI_DESIGN.md` for UI quality, accessibility, viewport, and browser verification policy.
   - Use `agents-rules/invariants.md` for timeline invariants and ID/display-time ownership.
   - Use `agents-rules/docs-sync-playbook.md` for documentation review scope.
   - Use `agents-rules/timeline-regression-checklist.md` for behavior-sensitive regression checks.
2. Narrow the write scope to the smallest set of files that owns the behavior.
   - Keep rendering in components and shared derivation in composables/helpers.
   - If more than one file appears to compute the same UI value, consolidate instead of adding a parallel path.
3. Identify the user-visible behavior being changed before editing.
   - Confirm whether the change affects rendering, interaction, panel behavior, menu behavior, or theme/display text.
   - Use that boundary to decide which components and composables actually own the change.
4. Re-check interaction feel after the edit using the verification items from `AGENTS.md`.
5. Update only the human-facing docs whose current text is made inaccurate by the change, following `AGENTS.md`.

## Mandatory Questions Before Finishing

- Did this change make the timeline feel heavier, noisier, or less predictable?
- Did this add duplicate rendering or duplicate state derivation?
- Did this change require text updates in app UI or docs?
- Did this create a new edge case near viewport boundaries?

## Verification Reference

- Follow `.project-agent-workflow/docs/agent/SPEC_UI_DESIGN.md` for required browser and viewport verification.
- If the UI change alters timeline behavior, execute the relevant interaction checks from `agents-rules/timeline-regression-checklist.md`.
