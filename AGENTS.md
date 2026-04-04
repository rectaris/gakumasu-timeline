# AGENTS.md

This file is an agent-only operations memo for reviewing and modifying this repository.

`AGENTS.md` and everything under `agents-rules/` are agent-only documents.  
Human-facing explanations belong in `README.md` and `docs/`. Do not treat agent-only docs as a replacement for human-facing docs.

## 1. Top Priorities

- Protect interaction feel first.
- Prioritize UI quality and user-visible appearance.
- Treat the following as must-not-break:
  - Character information
  - Commu information
  - Wheel-based zoom
  - Drag-based movement

## 2. Files To Check First

- `src/App.vue`
- `src/composables/useTimelineData.js`
- `src/composables/useTimelineLayout.js`
- `src/composables/useZoomMachine.js`
- `src/composables/usePointer.js`
- `src/components/TimelineEvents.vue`
- `src/components/TimelineScaleOverlay.vue`
- `src/components/TimelineScaleLabels.vue`
- `src/components/SidePanel.vue`
- `src/style.css`

## 3. Invariants

- Time is an abstract timeline, not a real calendar. Every month is treated as 31 days.
- Rendering, visibility checks, and selection focus use `displayStartDay` / `displayEndDay` as the source of truth.
- `occurrenceType: "singleWithinRange"` means "one day somewhere within the range" and does not imply a concrete date.
- Common events are duplicated per lane for display.
- URL sharing uses `canonicalId`. Render keys use `instanceId`.

## 4. Work Rules

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

## 5. Approval Boundary

- The following may be done without prior confirmation:
  - Typo fixes
  - Removing unused code
  - Docs updates
- For all other behavior additions or spec changes, get agreement first.
- Docs updates may be performed automatically.

## 6. Forbidden Changes

- Do not change character names or commu text as a side effect of UI work.
- Do not change the meaning of data content unless explicitly requested.
- Do not make destructive changes unless explicitly requested and clearly necessary for the task.

## 7. Naming And Responsibility

- Use the `display*` prefix for derived display-time fields.
- Use `canonicalId` for URL-sharing IDs and `instanceId` for render-instance IDs.
- If time representation changes, always check `src/utils/time.js` and `docs/data-structure.md`.
- If selection or URL restore changes, always check `src/composables/useSelection.js` and common-event duplication consistency.

## 8. Documentation Updates

- If UI or visible behavior changes, review app text plus `README.md` and relevant files under `docs/`.
- Always review `docs/manual.md` when UI or visible behavior changes.
- For other docs, update only the files whose current text is affected by the change.

## 8.5. Encoding And Save Rules

- Save human-facing documents (`README.md`, `docs/*.md`, other `.md` text files) as UTF-8.
- When writing text from PowerShell, always specify the encoding explicitly.
- Do not use `Set-Content` or `Out-File` without an explicit encoding.
- Even for partial replacements or appends, confirm that no mojibake was introduced on save.
- If mojibake is detected, stop patching on top of it. Restore the last known-good content first, then re-apply the intended diff.
- For recovery, use the known-good Git content and save it again as UTF-8 before re-applying changes.
- After updating docs that contain Japanese, reload the edited files and confirm that text is not corrupted.

## 9. Review Priorities

1. Check whether implementation and `README` / `docs` descriptions diverge.
2. Check whether the same derived value or rendering logic exists in multiple places.
3. Check for unused code and leftovers from old UI.
4. Check consistency around common-event duplication, `canonicalId`, and `instanceId`.
5. Report as many real issues as possible, clearly and accurately.

## 9.5. Task Playbooks

- Use `agents-rules/ui-change-playbook.md` for visible UI or interaction work.
- Use `agents-rules/docs-sync-playbook.md` when behavior or user-facing text changed.
- Use `agents-rules/timeline-regression-checklist.md` before closing timeline-related work.
- These playbooks add task flow. They do not override the rules in this file.

## 10. Post-Change Checks

- `npm run build`
- Real browser verification
- Wheel-based horizontal zoom
- Drag-based movement in both axes
- `Escape` closing menu / manual / panel
- Common-event selection and URL restore
- `singleWithinRange` rendering and detail text

### Preferred Real Devices

- Highest priority: Windows Chrome
- Next priority: mobile view

## 11. Review Output Format

- Report in severity order.
- Use numbered items starting from `1.`.
- Include severity in each item.
- Distinguish between bugs, duplication, leftovers, and docs mismatches.

## 12. Post-Change Report Template

- Changes
  - What changed
  - What the problem was
  - How it was fixed
- Verification
  - `npm run build`
  - Whether real-device/browser verification was done
- Unverified risks
  - Environments or operations not yet checked

## 12.5. Continuous Development & Autonomy

To maintain development momentum and avoid unnecessary pauses:

- **Directive Execution:** When a task is clearly a directive (e.g., "Implement the next 3 candidates"), do not stop after the first step. Continue through implementation and validation for the entire set unless an error prevents further progress.
- **Multi-Role Chain Execution:** When a task requires both PM (planning) and Engineering (implementation), transition between these roles automatically in the same session. Do not wait for user input between the planning and execution phases.
- **Iteration Protocol:** Follow the `.company/pm/projects/pm-iteration-protocol.md` for continuous improvements. When a PM execution order is defined, execute it sequentially.
- **Batch Tasks:** Use the `generalist` sub-agent for multi-file or repetitive tasks to keep the main context lean and the workflow continuous.
- **Validation Mandate:** Validation is required for finality. For autonomous sequences, verify each step as it's completed.

## 13. Related Documents

- `agents-rules/maintenance.md`
- `agents-rules/review-checklist.md`
- `agents-rules/ui-change-playbook.md`
- `agents-rules/docs-sync-playbook.md`
- `agents-rules/timeline-regression-checklist.md`
- `agents-rules/workspace/README.md`
- `docs/data-structure.md`
- `docs/ads-plan.md`
- `docs/processing-flow.md`
- `docs/ui-behavior.md`
