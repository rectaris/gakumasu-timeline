# AGENTS.md

Agent entrypoint for `gakumasu-timeline`.

## Purpose

Maintain the Gakumasu timeline application, data, and UI interactions.

## Generated Profile

- Project name: `gakumasu-timeline`
- Primary language: `typescript`
- Planning style: `active_backlog_checked`
- Codex helper agents: `true`
- Codex hooks: `true`
- Plan lifecycle scripts: `true`
- Change-aware validation: `true`
- Static security checks: `true`
- Structure scanner: `true`
- External service policies: MCP=`false`, Linear=`false`, graph memory=`false`

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
- Ask before high-impact or ambiguous changes to timeline data structures or core interactions.
- Use `agents-rules/decision-boundaries.md` for approval, validation, data, dependency, helper, and release decisions.
- Treat `docs/plan/checked.md` and checked archives as lookup-only history; search metadata first when possible.
- Keep human-facing README files separate from agent-facing operational policy.

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
