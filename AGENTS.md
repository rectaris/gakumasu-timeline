# AGENTS.md

Agent entrypoint for `gakumasu-timeline`.

## Purpose

Maintain the Gakumasu timeline application, data, and UI interactions.

## Generated Profile

- Project name: `gakumasu-timeline`
- Primary language: `mixed`
- Planning style: `active_backlog_checked`
- Codex helper agents: `true`
- Codex hooks: `true`
- Plan lifecycle scripts: `true`
- Change-aware validation: `true`
- Static security checks: `true`
- SkillSpector scan: `true`
- Structure scanner: `true`
- Local agent logs: `true`
- Context compression helper: optional, Headroom-aware when available
- External service policies: MCP=`true`, Linear=`true`, graph memory=`true`

## Priority

1. Follow parent workspace `AGENTS.md` and `GEMINI.md` first for cross-repository coordination, security, and Git policy.
2. Follow this file for repository-local behavior.
3. Open `docs/agent/spec-index.yaml`.
4. Read only `default_reads` plus the matched route's `required` docs before editing.
5. Add `conditional` docs only when the task or touched files match.

## Operating Rules

- Keep project-specific implementation rules in `docs/agent/SPEC_*.md`, `agents-rules/`, or existing domain docs.
- Track non-trivial implementation work in `docs/plan/plan.md` or `docs/plan/active/`.
- Keep Copier-managed workflow files updateable; put timeline-specific details outside generated files when practical.
- Use Git for every coherent work unit.
- Preserve user changes you did not make.
- Prefer deterministic checks over prose-only rules.
<<<<<<< before updating
- Ask before high-impact or ambiguous changes to timeline data structures or core interactions.
- Use `agents-rules/decision-boundaries.md` for approval, validation, data, dependency, helper, and release decisions.
=======
- Use tmux for long-running, shared, or interactive commands when available; use normal command execution for short deterministic commands.
- Ask before high-impact or ambiguous changes.
>>>>>>> after updating
- Treat `docs/plan/checked.md` and checked archives as lookup-only history; search metadata first when possible.
- Keep human-facing README files separate from agent-facing operational policy.
- Keep raw agent logs and large agent artifacts local under `.agent-logs/` and `.agent-artifacts/`; do not commit them.
- Use run manifests, search, excerpts, and optional context compression before loading large raw logs.
- Read `AGENTS.md`, `docs/agent/`, validation policy, and security policy directly; do not route normative instructions through compression.
- When writing or editing Japanese prose, follow `docs/agent/SPEC_JAPANESE_TECH_WRITING.md`.
- Run decision audit before creating or materially updating active plans when meaningful design, storage, validation, lifecycle, security, or artifact-boundary choices remain open; keep the full audit out of `docs/plan/active`.

## CI Autofix Rules

- Codex must make minimal changes when repairing CI failures.
- Codex must not change unrelated behavior.
- Codex must not weaken tests to make CI pass.
- Codex must not delete failing tests unless the user explicitly requests it.
- Codex must not modify secrets, deployment credentials, or production settings.
- Codex must prefer fixing root causes over skipping checks.
- Codex must stop and report when the failure is due to missing secrets, external service outages, or environment-only issues.

## Timeline Rules

- Protect interaction feel, especially zoom, drag, wheel, touch, and keyboard navigation.
- Prioritize UI quality and visual consistency.
- Reference `agents-rules/invariants.md` before changing core app rules.
- Use `agents-rules/ui-change-playbook.md` for UI changes.
- Use `agents-rules/timeline-regression-checklist.md` for behavior-sensitive changes.

## Cascade Agent Handoff

- Tier 1: Codex CLI for bulk logic porting and scaffolding.
- Tier 2: GitHub Copilot CLI for UI tweaks and snippet generation.
- Tier 3: Gemini CLI for final integration and validation.
- Handoff documentation: `docs/plan/handoff-latest.md` or `docs/plan/handoffs/`.

## AutoAgent Optimization

- Goal: Improve timeline data extraction accuracy and UI interaction logic using `autoagent-opt` when available.
- Benchmark: Use `tests/useTimelineData.test.js` and visual checks/snapshots as baseline metrics when available.
- Protocol: Analyze failure traces in `tests/` before refining extraction regex or UI state machines.

## Validation

- Always verify TypeScript/Vite changes with `npm run build`.
- Use browser or visual verification for real interaction or layout changes when available.

## Reports

- State touched repositories.
- State link or public-path changes.
- Report validation run and commit status.
