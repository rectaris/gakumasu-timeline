# Project Policy

This repository maintains the Gakumasu timeline application, its data, and its interaction behavior.

## Priority And Rule Modules

- Follow the parent workspace `AGENTS.md` and `GEMINI.md` first for cross-repository coordination, security, and Git policy.
- Use `agents-rules/decision-boundaries.md` for approval, validation, data, dependency, generated-artifact, public-path, helper, and release decisions.
- Read `agents-rules/invariants.md` before changing core application rules.
- Use `agents-rules/ui-change-playbook.md` for UI changes and `agents-rules/timeline-regression-checklist.md` for behavior-sensitive changes.
- Use `agents-rules/docs-sync-playbook.md`, `agents-rules/maintenance.md`, and `agents-rules/review-checklist.md` when their scopes apply.

## Timeline Data Integrity

- Do not change character names, commu text, event meaning, source claims, chronology, or timeline interpretation as an incidental side effect.
- Ask before changing timeline data semantics, source attribution, URL-facing IDs, core data contracts, or the broad interaction model unless the user explicitly requested the exact change.
- Preserve `canonicalId` compatibility for shared URLs. Document any approved migration before implementation.
- Keep unknown timing unknown. Use `singleWithinRange` for one event known only to occur within a range; never invent a concrete midpoint.
- Keep data extraction accuracy and interaction behavior covered by focused tests, including `tests/useTimelineData.test.js` when relevant.

## Implementation And Validation

- Preserve interaction feel, especially zoom, drag, wheel, touch, selection, filtering, and keyboard navigation.
- Prioritize UI quality, predictable interaction, and visual consistency.
- Always verify TypeScript/Vite changes with `npm run build`.
- Runtime logic changes require `npm run test` and `npm run build`, or `npm run verify` when it covers the required checks.
- Timeline data normalization, time math, URL restore, common-event selection, IDs, filters, lane visibility, and `singleWithinRange` changes require focused regression tests when practical.
- UI interaction or layout changes require browser or visual verification when available.
- Use the namespaced workflow checks under `.project-agent-workflow/scripts/`; do not recreate generated helpers under root `scripts/`.
- The project-owned manual CI autofix workflow is documented in `docs/agent/PROJECT_CI_AUTOFIX.md`.

## Documentation And Artifacts

- Keep human-facing README files separate from agent-facing policy.
- Update `docs/manual.md` or `docs/ui-behavior.md` when user-visible behavior changes make them inaccurate.
- Keep raw agent logs and large artifacts local under `.agent-logs/` and `.agent-artifacts/`; do not commit them.
- Report touched repositories, public-path or link changes, validation, and commit status.
