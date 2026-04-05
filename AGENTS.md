# AGENTS.md

Local operations memo for `gakumasu-timeline`.

## 1. Top Priorities
- Protect interaction feel (zoom, drag).
- Prioritize UI quality and visual consistency.
- Reference `agents-rules/invariants.md` for core app rules.

## 2. Operational Mandates
- **Hierarchy:** Follow parent workspace `AGENTS.md` and `GEMINI.md` first.
- **Workflow:** Follow `docs/rules/lifecycle.md` for all Directives.
- **Roles:** Use specialized roles (CEO, Eng, Visual QA) via `docs/rules/orchestration.md`.
- **Git:** Authorized `dev` auto-push. Follow `docs/rules/git-workflow.md`.

## 3. AutoAgent Optimization
- **Goal:** Improve timeline data extraction accuracy and UI interaction logic using `autoagent-opt`.
- **Benchmark:** Use `tests/useTimelineData.test.js` and `agent-browser` visual checks/snapshots as baseline metrics.
- **Protocol:** Analyze failure traces in `tests/` to iteratively refine extraction regex or UI state machine.

## 4. Local Maintenance
- **Self-Maintenance:** Automatic rotation of logs and projects to `_archive/`.
- **Validation:** Always verify with `npm run build` and use the `agent-browser` skill for real browser E2E/visual verification.

## 4. Related Documents (Reference)
- `agents-rules/invariants.md`
- `agents-rules/maintenance.md`
- `agents-rules/ui-change-playbook.md`
