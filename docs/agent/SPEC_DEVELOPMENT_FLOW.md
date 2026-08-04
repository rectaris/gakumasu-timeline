# Development Flow

This workflow is generated for `gakumasu-timeline`.

## Startup

1. Read `AGENTS.md`.
2. Read `docs/agent/spec-index.yaml`.
3. Select the smallest matching route.
4. Read `default_reads` and route `required` docs.
5. Check `docs/plan/plan.md`.
6. Treat checked archives as history; search an index before opening full archive files when possible.
7. Do not load raw agent logs by default. Use run manifests, search, targeted excerpts, or context compression only when the route or task requires log evidence.

## Implementation

- Keep changes scoped to the task.
- Prefer existing project patterns.
- Separate product logic, UI, data, and process changes when practical.
- Fix directly related issues only when they are necessary to complete the requested work or prevent an immediate regression.
- Record unrelated bugs, cleanup ideas, or design concerns in the active plan/backlog instead of expanding the current diff.
- Move mechanically checkable rules into scripts, tests, type checks, or linters.
- Escalate ambiguous high-impact changes before editing.
- Treat Copier-managed workflow files as shared template surface; avoid local-only edits unless the repository intentionally diverges.
- Preserve explicit contracts for public APIs, generated artifacts, runtime data paths, and integration boundaries.
- Keep README files human-facing; move reusable agent policy into `docs/agent/SPEC_*.md`.
- Treat `docs/agent/SPEC_*.md` as the mandatory routing layer for agent-facing decisions.
- Treat `agents-rules/` as detailed playbooks, invariants, and review checklists linked from the specs or `AGENTS.md`.
- Use `agents-rules/decision-boundaries.md` before making approval-sensitive, dependency, generated-artifact, public URL, helper, or release decisions.
- Keep `.agent-logs/` and `.agent-artifacts/` local-only. Use `docs/plan` for durable summaries and links to relevant run ids, not for raw log bodies.
- Read normative instructions directly. Do not compress `AGENTS.md`, `docs/agent/`, validation policy, or security policy.

## Data Integrity

- Do not change character names, commu text, event meaning, source claims, or timeline interpretation as an incidental side effect.
- Ask before changing data semantics, chronology, source attribution, or URL-facing IDs.
- Mechanical data-shape changes are allowed when scoped, validated, and behavior-preserving.
- Preserve `canonicalId` compatibility for shared URLs. If an ID must change, document the migration or compatibility decision before implementation.
- Represent uncertainty explicitly. Do not turn unknown single-day timing into a fake concrete date.

## Review Classes

- Class A: local or mechanical work.
- Class B: semantic implementation work.
- Class C: directional architecture, product, story, frame, or philosophy. Requires explicit approval.
- If a task spans classes, use the highest class.
- Treat timeline data semantics, published IDs, public URL behavior, data contracts, visual philosophy, and write-capable external-service changes as Class C unless the user explicitly requested the exact change.
- Treat broad policy changes to `AGENTS.md`, `docs/agent/`, hooks, validation gates, or helper orchestration as at least Class B; use Class C when the change alters cross-repository workflow, release authority, or human approval boundaries.

## Completion

- Complete active work by archiving the active plan to `docs/plan/checked/` when plan lifecycle scripts are enabled.
- Record validation, unresolved risks, and deferred work in the checked record.
- Do not use deferred-completion fields for finished work.
- If raw logs support the completion record, reference the run id and manifest path instead of copying raw log content into `docs/plan`.
