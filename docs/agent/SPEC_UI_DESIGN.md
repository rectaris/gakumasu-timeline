# UI Design

This file is the canonical agent-facing policy for visible UI, interaction,
accessibility, screenshot, and visual QA decisions.

## Source Of Truth

- Use `agents-rules/ui-change-playbook.md` for the UI implementation workflow.
- Use `agents-rules/timeline-regression-checklist.md` for behavior-sensitive timeline checks.
- Use `docs/ui-behavior.md` and `docs/manual.md` as human-facing behavior documentation, not as the primary agent policy.
- If a reusable UI rule exists only in a human-facing doc, mirror the agent-facing decision here before relying on it.

## Visual Direction

- Keep the timeline dense, readable, and work-focused.
- Prioritize predictable interaction and legible data over decorative layout.
- Preserve visual consistency across header, side menu, settings, manual, side panel, zoom controls, lane labels, and event bars.
- Avoid adding large decorative sections, marketing-style hero composition, or one-off visual systems to the app shell.
- Prefer small, stable UI controls with clear affordances over text-heavy explanations inside the app.

## Timeline Rendering Quality

- Events must remain clipped to the timeline viewport.
- Year, month, and day labels must not bleed into lane labels or event content.
- Edge labels may simplify or hide before overlapping in a confusing way.
- Lane boundaries, lane labels, and event markers must remain readable in light and dark modes.
- `singleWithinRange` must remain visually uncertain. Do not render it as a concrete date or a precise midpoint.
- Common events duplicated per lane must stay visually associated with their lane without reusing DOM/render identity.

## Layout And Responsiveness

- Desktop is the primary productivity layout; mobile viewport behavior is still required for navigation and inspection.
- UI changes must be checked at a desktop viewport and a narrow mobile viewport when they affect layout, input, or fixed panels.
- Fixed controls must not cover selected event content, menu controls, or required close actions.
- Text inside buttons, lane labels, panels, menus, and modals must fit without overlapping adjacent controls.
- Keep stable dimensions for controls that are repeatedly interacted with, especially zoom buttons, menu controls, and timeline label areas.

## Accessibility

- Practical WCAG AA is the target for user-facing UI changes.
- Icon-only buttons need accessible labels.
- Menu, settings, manual, and detail panel close actions must remain keyboard reachable.
- `Escape` should close the currently open menu, manual, settings panel, or detail panel without breaking selection state.
- Focusable controls must have visible focus states.
- Modal or panel changes must preserve sensible focus order and avoid trapping focus without a reachable close path.
- Color changes must preserve readable contrast for labels, controls, and event text in light and dark modes.
- Do not rely on color alone for selection, uncertainty, or warning states.

## Performance And Interaction Baseline

- Changes that affect rendering volume, zoom, drag, filters, layout calculation, or data shape must preserve the representative timeline interaction feel.
- Check wheel zoom, drag movement, event selection, and relevant filter/lane behavior when touched.
- Numeric performance budgets are optional until repeatable performance tooling exists; do not replace interaction checks with prose-only claims.

## Browser And Visual Verification

- UI or interaction changes require browser verification when available.
- Preferred minimum viewports:
  - desktop Chrome-sized viewport
  - mobile viewport around `375x812`
- If browser automation is available, use it for smoke interaction and screenshots.
- If the named browser automation helper is unavailable, use the local stack instead: `npm run build`, `npm run preview` or Vite dev server, and Playwright/browser checks when practical.
- If browser verification cannot run, record the exact blocker and the remaining visual or interaction risk.

## Documentation Boundary

- UI text or visible behavior changes require reviewing `docs/manual.md`.
- Review `docs/ui-behavior.md` when input, panel, selection, menu, settings, or timeline behavior changes.
- Review `README.md` only when the main human usage flow changes.
- Keep reusable agent policy in `docs/agent/` or `agents-rules/`, not only in README files.
