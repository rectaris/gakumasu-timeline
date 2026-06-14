# Maintenance Rules

This document defines rules for code cleanliness, environment handling, and documentation synchronization.

## 1. Work Rules
- Do not duplicate rendering logic or derived calculations across files.
- Consolidate duplicated logic by default.
- Remove unused `prop`, `computed`, function, and CSS.
- Remove unreferenced CSS, `prop`, and helper code by default.
- Do not keep code only because it might be used later.
- Keep UI components focused on rendering. Move data normalization and ID normalization into composables/helpers.
- Move reusable derived calculations into composables/helpers instead of duplicating them inside components.
- Before adding a new dependency, helper, abstraction, or workflow, first check whether the repository already has a suitable implementation.
- If the repository does not already cover it, check official docs and maintained external solutions before building custom code.
- Prefer adopt / extend over build when it keeps this repository simpler and easier to maintain.
- If custom implementation is still the right choice, keep it minimal and make the reason clear in the task report.
- Use Japanese by default for user-facing responses, reports, and explanations unless the user explicitly asks for another language.
- For implementation, prefer the language and style that keep the target file readable for future agents and maintainers. Follow the dominant language already used in the file/repo unless there is a clear reason not to.

## 2. Encoding And Save Rules
- Save human-facing documents (`README.md`, `docs/*.md`, other `.md` text files) as UTF-8.
- When writing text from PowerShell, always specify the encoding explicitly.
- Do not use `Set-Content` or `Out-File` without an explicit encoding.
- Even for partial replacements or appends, confirm that no mojibake was introduced on save.
- If mojibake is detected, stop patching on top of it. Restore the last known-good content first, then re-apply the intended diff.
- For recovery, use the known-good Git content and save it again as UTF-8 before re-applying changes.
- After updating docs that contain Japanese, reload the edited files and confirm that text is not corrupted.

## 3. Post-Change Checks
- `npm run build`
- Real browser verification for UI and interaction changes when available
- If a named browser helper is unavailable, use Playwright, Vite preview, or manual browser verification through the local stack when practical
- Wheel-based horizontal zoom
- Drag-based movement in both axes
- `Escape` closing menu / manual / panel
- Common-event selection and URL restore
- `singleWithinRange` rendering and detail text

### Preferred Viewports
- Highest priority: desktop Chromium/Chrome-sized viewport
- Next priority: mobile viewport around `375x812`
- Additional browser coverage only when pointer/touch/CSS compatibility risk requires it

## 4. Documentation Updates
- If UI or visible behavior changes, review app text plus `README.md` and relevant files under `docs/`.
- Always review `docs/manual.md` when UI or visible behavior changes.
- For other docs, update only the files whose current text is affected by the change.

## 5. Domain-Specific Fragile Areas
- `useTimelineData.js`: Event normalization and derived fields.
- `useTimelineLayout.js`: Visibility checks, sublane calculation, coordinate conversion.
- `useZoomMachine.js`: View range, selection focus, label thresholds.
- `usePointer.js`: Dragging, click suppression, touch handling.
- `useSelection.js`: URL restore, common-event selection.

## 6. Forbidden Changes
- Do not change character names or commu text as a side effect of UI work.
- Do not change data meaning unless explicitly requested.
- Do not change URL-facing IDs as incidental cleanup.
- Do not add dependencies as a shortcut without checking existing project utilities and documenting the reason.
