# Project UI Design

## Source Of Truth

- Use `agents-rules/ui-change-playbook.md` for the UI implementation workflow.
- Use `agents-rules/timeline-regression-checklist.md` for behavior-sensitive timeline checks.
- Use `docs/ui-behavior.md` and `docs/manual.md` as human-facing behavior documentation.

## Visual Direction

- Keep the timeline dense, readable, and work-focused.
- Prioritize predictable interaction and legible data over decorative layout.
- Preserve consistency across the header, side menu, settings, manual, detail panel, zoom controls, lane labels, and event bars.
- Prefer small, stable controls with clear affordances over text-heavy in-app explanations.

## Timeline Rendering

- Clip events to the timeline viewport. Keep year, month, and day labels from bleeding into lanes or event content.
- Keep lane boundaries, labels, and event markers readable in light and dark modes.
- Render `singleWithinRange` as uncertain, never as a concrete date or precise midpoint.
- Keep common events duplicated per lane visually associated with that lane without reusing DOM or render identity.

## Layout, Accessibility, And Interaction

- Desktop is the primary productivity layout; mobile must still support navigation and inspection.
- Fixed controls must not cover selected event content, menu controls, or required close actions.
- Repeated controls such as zoom buttons, menu controls, and lane labels need stable dimensions.
- Practical WCAG AA is the target. Icon-only controls need accessible labels, focusable controls need visible focus, and color cannot be the only selection or uncertainty signal.
- Menu, settings, manual, and detail-panel close paths must remain keyboard reachable. `Escape` should close the active surface without corrupting selection state.
- Changes affecting rendering volume, zoom, drag, filters, layout calculation, or data shape must preserve wheel zoom, two-axis drag, click suppression, selection, viewport restoration, and relevant filter/lane behavior.

## Browser And Documentation Checks

- Check desktop Chrome-sized and approximately `375x812` mobile viewports when layout, input, or fixed panels change.
- Inspect console errors and failed network requests for UI, route, asset, or data-loading changes when tooling allows it.
- If browser verification cannot run, record the exact blocker and remaining interaction or visual risk.
- Review `docs/manual.md` for UI text or visible behavior changes and `docs/ui-behavior.md` for input, panel, selection, menu, settings, or timeline behavior changes.
