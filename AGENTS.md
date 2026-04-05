# AGENTS.md

Agent-only operations memo for `gakumasu-timeline`. 
Follow this and `agents-rules/` for all operations.

## 1. Top Priorities
- Protect interaction feel (zoom, drag).
- Prioritize UI quality and user-visible appearance.
- Reference `agents-rules/invariants.md` for core app rules.

## 2. Core Directories
- Implementation: `src/` (App.vue, composables, components)
- Agent Rules: `agents-rules/`
- Documentation: `docs/` and `README.md`

## 3. Operations & Rules
- **Maintenance & Work Rules:** Follow `agents-rules/maintenance.md`.
- **Validation:** Always verify with `npm run build` and browser checks (see `maintenance.md`).
- **Autonomy:** Follow the **Continuous Development Mandate** in the workspace root `AGENTS.md`.
- **Playbooks:** Use relevant playbooks in `agents-rules/` (UI change, Docs sync, etc.).

## 4. Continuous Development & Autonomy (Local)
- **Directive Execution:** Complete entire task sequences (impl + validation) without pausing.
- **Multi-Role Chain:** Transition between PM and Engineering roles autonomously.
- **Git Operations:** Create feature branches, commit after validation, use git for restore.

## 4.5. Autonomous Self-Maintenance (Automatic Trigger)
- **Pre-Task Context Check:** Before starting any Directive, check the size of `handoff-latest.md` and the active project file.
  - If `handoff-latest.md` exceeds 5-7 entries, summarize it and rotate the old entries to a log using the Blind Append command.
  - If an active project file (e.g., in `pm/projects/`) exceeds 5 iterations, perform an "Active Window" archive immediately using the Blind Append command.
- **Monthly Rotation Trigger:** At the first session of a new month, autonomously execute the "Daily Note Rotation" (moving `todos/` and `inbox/` to `_archive/`) as the first action of the session.

## 5. Execution Best Practices
- **Think Before Tooling:** State strategy in 1 sentence before tool use.
- **Surgical Edits:** Prefer `replace` over `write_file`.
- **Parallel Research:** Gather all info in minimal turns using parallel calls.
- **Verification:** Always record the specific verification command and result.

## 5.5. Parallel Development & Codex Orchestration

- **Task Splitting:** If the Directive allows for parallel work (e.g., independent UI component vs. helper logic), the orchestrator must split the task and dispatch sub-agents.
- **Role Assignment:** Use `cc-company` (e.g., `inbox/handoff-latest.md`) to record worker roles and task boundaries. 
- **Conflict Prevention:** Never assign sub-agents to the same file in the same turn.
- **Verification:** Each sub-task must be independently verified by its sub-agent.

## 5.6. Hybrid Specialist Dispatch & Loop Protection

- **Orchestrator Role:** Analyze if a task is "spec-heavy" (Codex) or "logic-heavy" (Gemini).
- **Loop Guard:** If `Delegation Depth` is already 1, do not dispatch further. Return to the orchestrator.
- **Handoff Tracking:** Use `inbox/handoff-latest.md` to track the `Origin Agent` and `Delegation Depth`.

## 6. Related Documents (Reference)
- `agents-rules/invariants.md`
- `agents-rules/maintenance.md`
- `agents-rules/review-checklist.md`
- `agents-rules/ui-change-playbook.md`
- `agents-rules/docs-sync-playbook.md`
- `agents-rules/timeline-regression-checklist.md`
