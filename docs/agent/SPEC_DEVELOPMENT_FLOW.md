# Development Flow

This workflow is generated for `gakumasu-timeline`.

## Startup

1. Read `AGENTS.md`.
2. Read `docs/agent/spec-index.yaml`.
3. Select the smallest matching route.
4. Read `default_reads` and route `required` docs.
5. Check `docs/plan/plan.md`.
6. Treat checked archives as history; search an index before opening full archive files when possible.

## Implementation

- Keep changes scoped to the task.
- Prefer existing project patterns.
- Separate product logic, UI, data, and process changes when practical.
- Move mechanically checkable rules into scripts, tests, type checks, or linters.
- Escalate ambiguous high-impact changes before editing.
- Treat Copier-managed workflow files as shared template surface; avoid local-only edits unless the repository intentionally diverges.
- Preserve explicit contracts for public APIs, generated artifacts, runtime data paths, and integration boundaries.
- Keep README files human-facing; move reusable agent policy into `docs/agent/SPEC_*.md`.
- Treat `docs/agent/SPEC_*.md` as the mandatory routing layer for agent-facing decisions.
- Treat `agents-rules/` as detailed playbooks, invariants, and review checklists linked from the specs or `AGENTS.md`.

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

## Completion

- Complete active work by archiving the active plan to `docs/plan/checked/` when plan lifecycle scripts are enabled.
- Record validation, unresolved risks, and deferred work in the checked record.
- Do not use deferred-completion fields for finished work.
